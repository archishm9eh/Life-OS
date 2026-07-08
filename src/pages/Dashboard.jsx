import React, { useState, useEffect } from 'react';
import { workoutRoutine } from '../data/workoutRoutine';

export default function Dashboard() {
  const [activeScreen, setActiveScreen] = useState('goals');
  const [workoutSeconds, setWorkoutSeconds] = useState(900); 
  const [isLoaded, setIsLoaded] = useState(false);

  // --- CORE DATA & SYSTEM STATES ---
  const [tomorrowGoals, setTomorrowGoals] = useState(['', '', '']);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);

  // Fallback structural defaults for initial server paint / unhydrated states
  const [todayGoals, setTodayGoals] = useState([
    "Master React Complex State",
    "Push Clean Core Architecture to GitHub",
    "Deploy Initial Dashboard Matrix"
  ]);

  const [todaySchedule, setTodaySchedule] = useState([
    { time: "07:00 AM", task: "Wake Matrix & Hydration" },
    { time: "07:30 AM", task: "Bath, Grooming & Getting Ready" },
    { time: "08:15 AM", task: "Breakfast & College Commute" },
    { time: "09:00 AM", task: "College Operations Window" },
    { time: "01:00 PM", task: "Lunch Break Protocol" },
    { time: "05:00 PM", task: "Return Commute & Decompress" },
    { time: "06:00 PM", task: "Family Connection & Tea" },
    { time: "07:00 PM", task: "Target Goal Study & Homework" },
    { time: "09:00 PM", task: "Combat Workout Loop" },
    { time: "10:30 PM", task: "Night Wind-Down Sequence" }
  ]);

  // Determine current day configuration properties 
  const currentDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayWorkout = workoutRoutine.find((r) => r.day === currentDayName) || workoutRoutine[0];

  // --- HIGH-PERFORMANCE WORKOUT TIMER STEPPING ENGINE ---
  
  // 1. Initial screen entry alignment loader
  useEffect(() => {
    if (activeScreen === 'workout' && todayWorkout?.exercises?.[currentExerciseIdx]) {
      setWorkoutSeconds(todayWorkout.exercises[currentExerciseIdx].timePerSet);
    }
  }, [activeScreen]);

  // 2. Continuous 1-Second Decrement Clock
  useEffect(() => {
    if (activeScreen !== 'workout') return;

    const timer = setInterval(() => {
      if (workoutSeconds > 0) {
        setWorkoutSeconds((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeScreen, workoutSeconds]);

  // 3. Absolute "00:00" Row Progression Monitor
  useEffect(() => {
    if (activeScreen === 'workout' && workoutSeconds === 0) {
      const nextIdx = currentExerciseIdx + 1;
      
      // Look up if a subsequent row item exists
      if (todayWorkout?.exercises && nextIdx < todayWorkout.exercises.length) {
        setCurrentExerciseIdx(nextIdx);
        // Instantly look up and seed the exact countdown duration configuration for that new item
        setWorkoutSeconds(todayWorkout.exercises[nextIdx].timePerSet);
      }
    }
  }, [workoutSeconds, activeScreen, currentExerciseIdx, todayWorkout]);

  // ------------------------------------------------------------

  // --- SAFE UNIFIED HYDRATION & DAY-TURNOVER HANDLING ENGINE ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedKey = localStorage.getItem('p5_gemini_api_key');
        if (savedKey) setGeminiApiKey(savedKey);

        // Track local calendar dates to avoid UTC timezone cutoff errors
        const todayStr = new Date().toLocaleDateString('en-CA'); 
        const savedDate = localStorage.getItem('p5_dashboard_last_date');

        // Execute turnover sequence immediately prior to populating any states
        if (savedDate && savedDate !== todayStr) {
          const pendingGoals = localStorage.getItem('p5_tomorrow_goals');
          const pendingSchedule = localStorage.getItem('p5_tomorrow_schedule');

          if (pendingGoals && pendingGoals !== JSON.stringify(['', '', ''])) {
            localStorage.setItem('p5_today_goals', pendingGoals);
            localStorage.setItem('p5_tomorrow_goals', JSON.stringify(['', '', '']));
          }
          if (pendingSchedule) {
            localStorage.setItem('p5_today_schedule', pendingSchedule);
            localStorage.removeItem('p5_tomorrow_schedule');
          }
        }

        // Pull processed records directly into application view frames
        const finalTodayGoals = localStorage.getItem('p5_today_goals');
        const finalTodaySchedule = localStorage.getItem('p5_today_schedule');
        const finalTomorrowGoals = localStorage.getItem('p5_tomorrow_goals');

        if (finalTodayGoals) {
          setTodayGoals(JSON.parse(finalTodayGoals));
        } else {
          localStorage.setItem('p5_today_goals', JSON.stringify(todayGoals));
        }

        if (finalTodaySchedule) {
          setTodaySchedule(JSON.parse(finalTodaySchedule));
        } else {
          localStorage.setItem('p5_today_schedule', JSON.stringify(todaySchedule));
        }

        if (finalTomorrowGoals) {
          setTomorrowGoals(JSON.parse(finalTomorrowGoals));
        }

        localStorage.setItem('p5_dashboard_last_date', todayStr);
      } catch (e) {
        console.error("System storage metrics initialization error:", e);
      }
      setIsLoaded(true);
    }
  }, []);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- GEMINI INTELLIGENT ROUTING & PROTOCOL ENGINE ---
  const handleDeployNextDay = async (e) => {
    e.preventDefault();
    if (tomorrowGoals.some(g => g.trim() === '')) {
      alert("INPUT REQUIRED: ENTER ALL THREE TARGET OBJECTIVES.");
      return;
    }

    setIsLoadingAI(true);

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const tomorrowIndex = (new Date().getDay() + 1) % 7;
    const tomorrowDayName = daysOfWeek[tomorrowIndex];
    const isWeekend = tomorrowDayName === 'Saturday' || tomorrowDayName === 'Sunday';

    const systemConstraints = `
      - Tomorrow is ${tomorrowDayName}.
      - Mon to Fri constraints: College from 9:00 AM to 5:00 PM with a Lunch Break between 1:00 PM and 2:00 PM. Include travel time/commute buffers before 9 AM and after 5 PM.
      - Sat and Sun constraints: Off from college. Completely open schedule.
      - Core Targets to schedule: 1. ${tomorrowGoals[0]} | 2. ${tomorrowGoals[1]} | 3. ${tomorrowGoals[2]}.
    `;

    let generatedSchedule = [];

    if (geminiApiKey.trim() !== '') {
      try {
        const prompt = `You are a meticulous, high-performance tactical routine planner. Generate a highly detailed, realistic, and granular 24-hour chronological schedule array for tomorrow (${tomorrowDayName}).
        
        Context and parameters: ${systemConstraints}
        
        CRITICAL RULES FOR REALISTIC SCHEDULING:
        1. Do NOT just list broad blocks. You must generate a highly comprehensive schedule containing between 8 to 12 chronological steps.
        2. Account for human routines explicitly:
           - Include a Morning Routine block (e.g., "07:00 AM" or "07:30 AM") specifically mentioning bathing, personal hygiene, breakfast, and getting ready.
           - Include a Commute/Travel step to and from college.
           - Include a post-college Decompression / Family time block (e.g., "05:40 PM" or "06:00 PM") specifically mentioning talking with family, dinner, or relaxing.
           - Allocate distinct, dedicated time blocks for Self-Study, Homework, or working specifically on the 3 core objectives provided.
           - Include a dedicated night fitness loop/workout step.
           - End with a clear wind-down / sleep preparation step.
        
        Return ONLY a clean, valid JSON array of objects following exactly this schema format with absolutely no markdown wrapping, no \`\`\`json tags, and no conversational filler text:
        [
          {"time": "07:00 AM", "task": "Wake Up & Hydration Matrix"},
          {"time": "07:20 AM", "task": "Bath, Personal Hygiene & Grooming"},
          {"time": "08:00 AM", "task": "Breakfast & College Commute Route"},
          ...
        ]`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = data.candidates[0].content.parts[0].text;
          
          const startIdx = rawText.indexOf('[');
          const endIdx = rawText.lastIndexOf(']');
          
          if (startIdx !== -1 && endIdx !== -1) {
            const cleanJson = rawText.substring(startIdx, endIdx + 1).trim();
            generatedSchedule = JSON.parse(cleanJson);
          } else {
            throw new Error("JSON formatting boundaries absent");
          }
        } else {
          throw new Error("Invalid API payload framework");
        }
      } catch (err) {
        console.warn("AI layout failed or format mismatched. Dropping to local smart fallback...", err);
        generatedSchedule = runLocalFallbackScheduler(isWeekend);
      }
    } else {
      generatedSchedule = runLocalFallbackScheduler(isWeekend);
    }

    localStorage.setItem('p5_tomorrow_goals', JSON.stringify(tomorrowGoals));
    localStorage.setItem('p5_tomorrow_schedule', JSON.stringify(generatedSchedule));

    setIsLoadingAI(false);
    alert(`STRATEGY DEPLOYED: High-granularity protocols locked for ${tomorrowDayName}. They will load automatically upon next-day turnover!`);
    setActiveScreen('goals');
  };

  const runLocalFallbackScheduler = (isWeekend) => {
    if (!isWeekend) {
      return [
        { time: "07:00 AM", task: "Wake Up Matrix & Morning Hydration" },
        { time: "07:25 AM", task: "Bath, Personal Hygiene & Get Ready" },
        { time: "08:15 AM", task: "Breakfast & College Transit Buffer" },
        { time: "09:00 AM", task: "COLLEGE OPERATIONS WINDOW // START" },
        { time: "01:00 PM", task: "System Fuel // Lunch Break Protocol" },
        { time: "05:00 PM", task: "College Termination & Return Commute" },
        { time: "05:45 PM", task: "Decompress & Quality Time with Family" },
        { time: "06:45 PM", task: `CORE STUDY // Homework & Target: ${tomorrowGoals[0].substring(0, 30)}` },
        { time: "08:15 PM", task: `SECONDARY DRILL // Target: ${tomorrowGoals[1].substring(0, 30)}` },
        { time: "09:15 PM", task: `TERTIARY OPERATIONS // Target: ${tomorrowGoals[2].substring(0, 30)}` },
        { time: "10:00 PM", task: "Combat Fitness Loop & Conditioning" },
        { time: "11:00 PM", task: "System Sleep Hibernation Sequence" }
      ];
    } else {
      return [
        { time: "08:00 AM", task: "Weekend Wake-up & Morning Fluid Cycle" },
        { time: "08:30 AM", task: "Bath, Refreshment & Extended Breakfast" },
        { time: "09:30 AM", task: "Family Conversation & Household Sync" },
        { time: "10:30 AM", task: `WEEKEND DRIVE // Focus: ${tomorrowGoals[0]}` },
        { time: "02:00 PM", task: `STRATEGY DRILL // Focus: ${tomorrowGoals[1]}` },
        { time: "05:00 PM", task: "Leisure, Walk, or Social Intermission" },
        { time: "06:30 PM", task: `FINAL OBJECTIVE // Complete: ${tomorrowGoals[2]}` },
        { time: "09:00 PM", task: "Combat Fitness Loop / Evening Run" },
        { time: "11:00 PM", task: "Deep Sleep Cycles Engaged" }
      ];
    }
  };

  const systemDialogue = {
    goals: { prompt: "TARGETS LOCATED.", subText: "ELIMINATE COGNITIVE OBJECTIVES BEFORE MIDNIGHT." },
    initial: { prompt: "", subText: "" },
    workout: { prompt: "There are no shortcuts to finding out what it truly means to be strong", subText: "Lace up your shoes and give it everything you've got today—let's push past our limits together!" },
    schedule: { prompt: "TIMELINE ROUTE ACQUIRED.", subText: "EXECUTE SEQUENCE CHRONOLOGICALLY PER PARAMETERS." },
    deploy: { prompt: "", subText: "" }
  };

  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-white font-sans overflow-hidden select-none">
      
      <style>{`
        @keyframes p5-blade-extend {
          0% { transform: scaleX(0) skewX(-10deg); background-color: #000000; opacity: 0; }
          30% { transform: scaleX(1.1) skewX(-10deg); background-color: #000000; opacity: 1; }
          60% { transform: scaleX(0.95) skewX(-10deg); background-color: #dc2626; }
          100% { transform: scaleX(1) skewX(-10deg); }
        }
        @keyframes p5-large-blade-extend {
          0% { transform: scaleX(0); background-color: #000000; opacity: 0; }
          30% { transform: scaleX(1.1); background-color: #000000; opacity: 1; }
          60% { transform: scaleX(0.95); background-color: #dc2626; }
          100% { transform: scaleX(1); }
        }
        @keyframes p5-text-slide {
          0% { opacity: 0; transform: translateX(15px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes p5-view-entrance {
          0% { opacity: 0; transform: scale(0.96) rotate(-1deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .clip-top-blade { clip-path: polygon(0% 18%, 82% 2%, 84% 24%, 100% 48%, 83% 62%, 85% 100%, 2% 88%); }
        .clip-bottom-blade { clip-path: polygon(3% 0%, 80% 12%, 81% 38%, 100% 64%, 79% 78%, 81% 100%, 0% 86%); }
        .clip-anime-frame { clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%); }
        .clip-p5-large-blade { clip-path: polygon(0% 6%, 84% 0%, 86% 28%, 100% 50%, 86% 72%, 84% 100%, 0% 94%); }
      `}</style>

      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#141414] to-black z-0" />
      <div className="absolute -top-40 -right-20 w-8/12 h-[120%] bg-red-700/10 transform rotate-12 origin-top-right pointer-events-none z-0" />

      {/* DYNAMIC BACKGROUND ANIME CUT-IN CARDS */}
      {activeScreen === 'goals' && (
        <div style={{ animation: 'p5-view-entrance 0.3s ease-out forwards' }} className="absolute bottom-0 right-0 w-[52%] h-[80%] z-10 pointer-events-none hidden lg:block">
          <div className="relative w-full h-full flex justify-end items-end overflow-hidden">
            <div className="absolute inset-0 clip-anime-frame bg-neutral-900/40 border-l-4 border-black z-0">
              <div className="absolute top-0 left-0 w-full h-full bg-red-600/10 transform -skew-x-12 origin-top-left" />
            </div>
            <video src="/WhatsApp Video 2026-07-05 at 11.30.55 PM.mp4" autoPlay loop muted playsInline className="relative w-full h-full object-contain object-right-bottom mix-blend-lighten z-10" />
          </div>
        </div>
      )}

      {activeScreen === 'initial' && (
        <div style={{ animation: 'p5-view-entrance 0.3s ease-out forwards' }} className="absolute bottom-0 right-0 w-[55%] h-[85%] z-10 pointer-events-none hidden lg:block">
          <div className="relative w-full h-full flex justify-end items-end overflow-hidden">
            <div className="absolute inset-0 clip-anime-frame bg-neutral-900/40 border-l-4 border-black z-0">
              <div className="absolute top-0 left-0 w-full h-full bg-red-600/10 transform -skew-x-12 origin-top-left" />
            </div>
            <video src="/WhatsApp Video 2026-07-02 at 9.21.36 AM.mp4" autoPlay loop muted playsInline className="relative w-full h-full object-contain object-right-bottom mix-blend-lighten z-10" />
          </div>
        </div>
      )}

      {activeScreen === 'workout' && (
        <div style={{ animation: 'p5-view-entrance 0.3s ease-out forwards' }} className="absolute bottom-0 right-0 w-[50%] h-[75%] z-10 pointer-events-none hidden lg:block">
          <div className="relative w-full h-full flex justify-end items-end overflow-hidden">
            <div className="absolute inset-0 clip-anime-frame bg-neutral-900/40 border-l-4 border-black z-0">
              <div className="absolute top-0 left-0 w-full h-full bg-red-600/10 transform -skew-x-12 origin-top-left" />
            </div>
            <video src="/WhatsApp Video 2026-06-29 at 9.06.45 PM.mp4" autoPlay loop muted playsInline className="relative w-full h-full object-contain object-right-bottom mix-blend-lighten z-10" />
          </div>
        </div>
      )}

      {activeScreen === 'schedule' && (
        <div style={{ animation: 'p5-view-entrance 0.3s ease-out forwards' }} className="absolute bottom-0 right-0 w-[50%] h-[78%] z-10 pointer-events-none hidden lg:block">
          <div className="relative w-full h-full flex justify-end items-end overflow-hidden">
            <div className="absolute inset-0 clip-anime-frame bg-neutral-900/40 border-l-4 border-black z-0">
              <div className="absolute top-0 left-0 w-full h-full bg-red-600/10 transform -skew-x-12 origin-top-left" />
            </div>
            <video src="/WhatsApp Video 2026-07-06 at 12.28.08 AM.mp4" autoPlay loop muted playsInline className="relative w-full h-full object-contain object-right-bottom mix-blend-lighten z-10" />
          </div>
        </div>
      )}

      {/* Main Structural Grid Canvas */}
      <div className="relative max-w-7xl mx-auto h-screen grid grid-cols-1 lg:grid-cols-12 p-4 md:p-12 z-20 items-start gap-6 pt-10 md:pt-16">
        
        {/* NAV CONTROLLER PANEL */}
        <div className="lg:col-span-4 flex flex-col gap-3.5 justify-start z-30 transform lg:-translate-x-14 lg:-translate-y-4">
          
          <div className="bg-red-600 text-black font-black text-2xl md:text-3xl px-6 py-2 tracking-tighter uppercase inline-block -rotate-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-max mb-4">
            SYSTEM // INTERFACE
          </div>

          {[
            { id: 'goals', label: "Today's Goals", index: "01", rot: "-rotate-1" },
            { id: 'initial', label: "Initial Task", index: "02", rot: "rotate-2" },
            { id: 'workout', label: "Start Workout", index: "03", rot: "-rotate-2" },
            { id: 'schedule', label: "Today's Schedule", index: "04", rot: "rotate-1" },
            { id: 'deploy', label: "Deploy Next Day", index: "05", rot: "-rotate-1" }
          ].map((btn) => (
            <button 
              key={btn.id}
              onClick={() => setActiveScreen(btn.id)}
              className={`group relative text-left transform -skew-x-12 ${btn.rot} transition-all duration-150 active:scale-95 w-full max-w-xs`}
            >
              <div className={`absolute inset-0 bg-red-600 translate-x-1 translate-y-1 transition-transform ${activeScreen === btn.id ? 'translate-x-2 translate-y-2' : 'group-hover:translate-x-2 group-hover:translate-y-2'}`} />
              <div className={`relative font-black text-base md:text-lg px-5 py-3.5 uppercase tracking-wide border-2 transition-all ${activeScreen === btn.id ? 'bg-white text-black border-black' : 'bg-black text-white border-white group-hover:text-red-500'}`}>
                <span className="text-red-600 mr-3 font-mono text-xs">{btn.index}</span>
                {btn.label}
              </div>
            </button>
          ))}

          {/* Secure API Key Entry Portal */}
          <div className="mt-4 transform -skew-x-12 max-w-xs bg-neutral-950 p-2 border border-neutral-800 rounded">
            <label className="block text-[9px] font-mono tracking-widest text-neutral-500 mb-1">// API ENGINE ENCRYPTION KEY</label>
            <input 
              type="password" 
              placeholder="Paste Gemini Key here..." 
              value={geminiApiKey}
              onChange={(e) => {
                setGeminiApiKey(e.target.value);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('p5_gemini_api_key', e.target.value);
                }
              }}
              className="w-full bg-black text-xs border border-neutral-700 p-1 text-red-500 font-mono focus:outline-none"
            />
          </div>

        </div>

        {/* WORKSPACE OPERATIONS DISPLAY AREA */}
        <div className={`lg:col-span-8 h-full flex flex-col ${activeScreen === 'deploy' ? 'justify-center items-center lg:translate-y-12' : 'justify-start'} pb-4 relative z-20`}>
          
          <div className={`flex-initial flex items-center justify-center p-2 mb-2 w-full ${activeScreen !== 'deploy' ? 'transform lg:-translate-y-12 xl:-translate-y-16' : ''}`}>
            
            {/* SCREEN 01: TODAY'S ACTIVE GOALS */}
            {activeScreen === 'goals' && (
              <div style={{ animation: 'p5-view-entrance 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} className="bg-black border-2 border-red-600 transform -skew-x-6 p-6 w-full max-w-md shadow-[6px_6px_0px_0px_rgba(220,38,38,0.3)] bg-black/95 backdrop-blur-sm">
                <div className="text-red-500 font-mono text-xs tracking-widest mb-3 uppercase">// CURRENT ACTIVE OBJECTIVES</div>
                <ul className="space-y-3 font-black text-base uppercase tracking-tight">
                  {todayGoals.map((goal, idx) => (
                    <li key={idx} className="flex items-center gap-3 bg-neutral-900/90 p-2 border-l-4 border-red-600">✕ {goal}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* SCREEN 02: INITIAL SHARD TASK CUT-IN */}
            {activeScreen === 'initial' && (
              <div className="relative w-full max-w-xl lg:translate-y-10">
                <div className="absolute inset-0 bg-black clip-p5-large-blade translate-x-3 translate-y-3 pointer-events-none" style={{ transformOrigin: 'right center', animation: 'p5-large-blade-extend 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards' }} />
                <div className="absolute inset-0 bg-red-600 clip-p5-large-blade translate-x-1.5 translate-y-1.5 pointer-events-none" style={{ transformOrigin: 'right center', animation: 'p5-large-blade-extend 0.48s cubic-bezier(0.19, 1, 0.22, 1) forwards' }} />
                <div className="relative bg-white text-black border border-black clip-p5-large-blade p-6 pt-7 pb-8 pl-8 pr-24" style={{ transformOrigin: 'right center', animation: 'p5-large-blade-extend 0.45s cubic-bezier(0.19, 1, 0.22, 1) forwards' }}>
                  <p className="font-black text-xs md:text-sm uppercase tracking-tight leading-relaxed italic text-black font-sans select-text" style={{ opacity: 0, animation: 'p5-text-slide 0.3s ease-out 0.45s forwards' }}>
                    "Your dull, dehydrated skin and messy, sluggish state are a complete eyesore, making you look utterly pathetic before the day has even begun. Go drink some water and wash that exhaustion off your face right now, unless you are content with letting everyone else outshine you while you rot like a total nobody."
                  </p>
                </div>
              </div>
            )}

            {/* SCREEN 03: COMBAT CONDITIONING WORKOUT TRACKER */}
            {activeScreen === 'workout' && (
              <div style={{ animation: 'p5-view-entrance 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} className="bg-black border-2 border-white transform -skew-x-6 p-6 w-full max-w-xl text-left shadow-[6px_6px_0px_0px_#fff] grid grid-cols-1 md:grid-cols-12 gap-6 bg-black/95 backdrop-blur-sm">
                <div className="md:col-span-5 flex flex-col justify-center items-center border-b-2 md:border-b-0 md:border-r-2 border-neutral-800 pb-4 md:pb-0 md:pr-4">
                  <div className="text-red-600 font-mono text-xs tracking-widest uppercase mb-1">// TIME REMAINING</div>
                  <div className="font-mono text-4xl md:text-5xl font-black tracking-tighter text-white my-2 tabular-nums">{formatTime(workoutSeconds)}</div>
                  
                  <button 
                    onClick={() => {
                      if (todayWorkout?.exercises?.[currentExerciseIdx]) {
                        setWorkoutSeconds(todayWorkout.exercises[currentExerciseIdx].timePerSet);
                      }
                    }} 
                    className="bg-red-600 text-black font-black text-xs px-4 py-2 uppercase tracking-wide transform skew-x-12 border border-black hover:bg-white transition-colors w-full mt-2"
                  >
                    RESET PROTOCOL
                  </button>
                </div>
                <div className="md:col-span-7 pl-0 md:pl-2 flex flex-col justify-between">
                  <div>
                    <div className="text-red-500 font-mono text-xs tracking-widest uppercase mb-2">
                      // {todayWorkout.type} // {todayWorkout.mode}
                    </div>
                    <ul className="space-y-2 font-black text-xs md:text-sm uppercase tracking-tight text-neutral-400">
                      {todayWorkout.exercises.map((ex, idx) => {
                        const isActive = idx === currentExerciseIdx;
                        return (
                          <li 
                            key={ex.id} 
                            onClick={() => {
                              setCurrentExerciseIdx(idx);
                              setWorkoutSeconds(ex.timePerSet);
                            }}
                            className={`flex justify-between items-center p-2 border-l-2 cursor-pointer transition-all ${
                              isActive 
                                ? 'bg-neutral-900 border-white text-white font-black shadow-[0_0_20px_rgba(255,255,255,0.3)] drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' 
                                : 'bg-neutral-900/40 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                            }`}
                          >
                            <span>{ex.id} // {ex.name}</span>
                            <span className={`font-mono text-xs ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse' : 'text-neutral-600'}`}>{ex.reps}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 04: SCHEDULE TIMELINE MONITOR */}
            {activeScreen === 'schedule' && (
              <div style={{ animation: 'p5-view-entrance 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} className="bg-black/95 backdrop-blur-sm border-2 border-neutral-800 p-6 w-full max-w-lg transform -skew-x-3 lg:-translate-x-24 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
                <div className="text-red-500 font-mono text-xs tracking-widest uppercase mb-4">// CHRONOLOGICAL OPERATIONAL TIMELINE</div>
                <div className="space-y-2.5 font-black text-xs md:text-sm tracking-tight uppercase">
                  {todaySchedule.map((slot, index) => (
                    <div key={index} className="flex justify-between border-b border-neutral-800 pb-1.5 gap-4">
                      <span className={index % 2 === 1 ? "text-red-500 font-mono shrink-0" : "text-neutral-400 font-mono shrink-0"}>{slot.time}</span> 
                      <span className="text-white text-right">{slot.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN 05: DEPLOY NEXT DAY GENERATOR PROTOCOL */}
            {activeScreen === 'deploy' && (
              <div style={{ animation: 'p5-view-entrance 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} className="bg-black border-2 border-red-600 transform -skew-x-3 p-6 w-full max-w-lg shadow-[6px_6px_0px_0px_#dc2626] mx-auto">
                <div className="text-red-500 font-mono text-xs tracking-widest mb-1 uppercase">// COGNITIVE MAP GENERATOR</div>
                <div className="text-[10px] text-neutral-400 font-mono mb-4 uppercase tracking-tighter">Mon-Fri timeline maps outside 09:00 AM - 05:00 PM college constraints</div>
                
                <form onSubmit={handleDeployNextDay} className="space-y-4">
                  {tomorrowGoals.map((val, index) => (
                    <div key={index} className="flex flex-col gap-1">
                      <span className="font-mono text-red-500 text-[10px] font-bold">TARGET DATA // 0{index + 1}</span>
                      <input 
                        type="text"
                        required
                        placeholder={`Enter Tomorrow's Objective ${index + 1}...`}
                        value={val}
                        onChange={(e) => {
                          const updated = [...tomorrowGoals];
                          updated[index] = e.target.value;
                          setTomorrowGoals(updated);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('p5_tomorrow_goals', JSON.stringify(updated));
                          }
                        }}
                        className="w-full bg-neutral-900 border-b-2 border-neutral-700 text-sm font-black p-2 uppercase tracking-wide focus:outline-none focus:border-red-600 transition-colors text-white"
                      />
                    </div>
                  ))}

                  <button 
                    type="submit" 
                    disabled={isLoadingAI}
                    className="w-full bg-red-600 text-black text-center font-black py-3 px-4 uppercase tracking-wider text-sm transform skew-x-6 border-2 border-black hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_0px_#fff]"
                  >
                    {isLoadingAI ? "COMPILING HIGH-GRANULARITY SCHEDULE..." : "DEPLOY TOMORROW PROTOCOL"}
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* LOWER TAILED DIALOGUE BLADES PANEL */}
          {activeScreen !== 'initial' && activeScreen !== 'deploy' && (
            <div className="relative w-full max-w-md mx-auto lg:mx-0 flex flex-col gap-3 mt-2 items-start transform lg:translate-x-20 lg:translate-y-4 z-30">
              
              {/* TOP BLADE */}
              <div className="relative w-full min-h-[3.5rem] transform origin-right">
                <div className="absolute inset-0 bg-black clip-top-blade translate-x-1.5 translate-y-1 pointer-events-none" />
                <div 
                  key={`top-${activeScreen}`} 
                  className="absolute inset-0 bg-white border-2 border-black clip-top-blade flex items-center pl-6 pr-16 py-2"
                  style={{ transformOrigin: 'right center', animation: 'p5-blade-extend 0.45s cubic-bezier(0.19, 1, 0.22, 1) forwards' }}
                >
                  <span className="text-black font-black font-mono text-xs md:text-sm tracking-tighter uppercase leading-tight" style={{ opacity: 0, animation: 'p5-text-slide 0.3s ease-out 0.45s forwards' }}>
                    {systemDialogue[activeScreen].prompt}
                  </span>
                </div>
              </div>

              {/* BOTTOM BLADE */}
              <div className="relative w-full min-h-[3.5rem] transform origin-right -mt-1">
                <div className="absolute inset-0 bg-red-600 clip-bottom-blade translate-x-0.5 translate-y-0.5 pointer-events-none" />
                <div 
                  key={`bottom-${activeScreen}`} 
                  className="absolute inset-0 bg-black border border-white clip-bottom-blade flex items-center pl-6 pr-16 py-2 justify-between gap-4"
                  style={{ transformOrigin: 'right center', animation: 'p5-blade-extend 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards' }}
                >
                  <p className="text-white font-mono font-black text-[10px] md:text-xs tracking-tight italic uppercase leading-tight" style={{ opacity: 0, animation: 'p5-text-slide 0.3s ease-out 0.5s forwards' }}>
                    "{systemDialogue[activeScreen].subText}"
                  </p>
                  <span className="text-red-500 font-black text-sm animate-pulse font-mono hidden md:inline shrink-0" style={{ opacity: 0, animation: 'p5-text-slide 0.3s ease-out 0.5s forwards' }}>►</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}