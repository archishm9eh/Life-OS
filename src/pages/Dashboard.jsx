import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [activeScreen, setActiveScreen] = useState('goals');
  // Countdown initialized to 15 minutes (900 seconds)
  const [workoutSeconds, setWorkoutSeconds] = useState(900); 

  // Fixed Tactical Countdown Engine
  useEffect(() => {
    if (activeScreen !== 'workout') return;
    
    const timer = setInterval(() => {
      setWorkoutSeconds((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeScreen]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const systemDialogue = {
    goals: {
      prompt: "TARGETS LOCATED.",
      subText: "ELIMINATE COGNITIVE OBJECTIVES BEFORE MIDNIGHT."
    },
    initial: {
      prompt: "",
      subText: ""
    },
    workout: {
      prompt: "There are no shortcuts to finding out what it truly means to be strong",
      subText: "Lace up your shoes and give it everything you've got today—let's push past our limits together!"
    },
    schedule: {
      prompt: "TIMELINE ROUTE ACQUIRED.",
      subText: "EXECUTE SEQUENCE CHRONOLOGICALLY PER PARAMETERS."
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-white font-sans overflow-hidden select-none">
      
      {/* Precision Styles for the Jagged Shard Layout and Animations */}
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

        /* Top white shard: Sharp lightning indicator tail point at (100% 48%) */
        .clip-top-blade {
          clip-path: polygon(0% 18%, 82% 2%, 84% 24%, 100% 48%, 83% 62%, 85% 100%, 2% 88%);
        }

        /* Bottom black shard: Lower dramatic tail hook point at (100% 64%) */
        .clip-bottom-blade {
          clip-path: polygon(3% 0%, 80% 12%, 81% 38%, 100% 64%, 79% 78%, 81% 100%, 0% 86%);
        }

        /* Stylized sharp diagonal frame for Area A Persona-style cut-in */
        .clip-anime-frame {
          clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
        }

        /* Scaling sharp blade layout for large paragraph structures */
        .clip-p5-large-blade {
          clip-path: polygon(0% 6%, 84% 0%, 86% 28%, 100% 50%, 86% 72%, 84% 100%, 0% 94%);
        }
      `}</style>

      {/* High-Contrast Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#141414] to-black z-0" />
      <div className="absolute -top-40 -right-20 w-8/12 h-[120%] bg-red-700/10 transform rotate-12 origin-top-right pointer-events-none z-0" />

      {/* AREA A: PERSONA STYLE ANIME VIDEO CUT-IN (Initial Task Screen) */}
      {activeScreen === 'initial' && (
        <div style={{ animation: 'p5-view-entrance 0.3s ease-out forwards' }} className="absolute bottom-0 right-0 w-[55%] h-[85%] z-10 pointer-events-none hidden lg:block">
          <div className="relative w-full h-full flex justify-end items-end overflow-hidden">
            
            {/* Background geometric shard style effect layer */}
            <div className="absolute inset-0 clip-anime-frame bg-neutral-900/40 border-l-4 border-black z-0">
              <div className="absolute top-0 left-0 w-full h-full bg-red-600/10 transform -skew-x-12 origin-top-left" />
            </div>
            
            {/* Fully visible uncropped video frame */}
            <video 
              src="/WhatsApp Video 2026-07-02 at 9.21.36 AM.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="relative w-full h-full object-contain object-right-bottom mix-blend-lighten z-10"
            />
          </div>
        </div>
      )}

      {/* AREA A: PERSONA STYLE ANIME VIDEO CUT-IN (Workout Screen) */}
      {activeScreen === 'workout' && (
        <div style={{ animation: 'p5-view-entrance 0.3s ease-out forwards' }} className="absolute bottom-0 right-0 w-[50%] h-[75%] z-10 pointer-events-none hidden lg:block">
          <div className="relative w-full h-full flex justify-end items-end overflow-hidden">
            
            {/* Background geometric shard style effect layer */}
            <div className="absolute inset-0 clip-anime-frame bg-neutral-900/40 border-l-4 border-black z-0">
              <div className="absolute top-0 left-0 w-full h-full bg-red-600/10 transform -skew-x-12 origin-top-left" />
            </div>
            
            {/* Fully visible uncropped video frame */}
            <video 
              src="/WhatsApp Video 2026-06-29 at 9.06.45 PM.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="relative w-full h-full object-contain object-right-bottom mix-blend-lighten z-10"
            />
          </div>
        </div>
      )}

      {/* Main Structural Framework */}
      <div className="relative max-w-7xl mx-auto h-screen grid grid-cols-1 lg:grid-cols-12 p-4 md:p-12 z-20 items-start gap-6 pt-10 md:pt-16">
        
        {/* NAV CONTROLLER PANEL */}
        <div className="lg:col-span-4 flex flex-col gap-4 justify-start z-30 transform lg:-translate-x-14 lg:-translate-y-4">
          
          <div className="bg-red-600 text-black font-black text-2xl md:text-3xl px-6 py-2 tracking-tighter uppercase inline-block -rotate-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-max mb-6">
            SYSTEM // INTERFACE
          </div>

          {/* Today's Goals Control */}
          <button 
            onClick={() => setActiveScreen('goals')}
            className="group relative text-left transform -skew-x-12 -rotate-1 transition-all duration-150 active:scale-95 w-full max-w-xs"
          >
            <div className={`absolute inset-0 bg-red-600 translate-x-1 translate-y-1 transition-transform ${activeScreen === 'goals' ? 'translate-x-2 translate-y-2' : 'group-hover:translate-x-2 group-hover:translate-y-2'}`} />
            <div className={`relative font-black text-base md:text-lg px-5 py-3.5 uppercase tracking-wide border-2 transition-all ${activeScreen === 'goals' ? 'bg-white text-black border-black' : 'bg-black text-white border-white group-hover:text-red-500'}`}>
              <span className="text-red-600 mr-3 font-mono text-xs">01</span>
              Today's Goals
            </div>
          </button>

          {/* Initial Task Control */}
          <button 
            onClick={() => setActiveScreen('initial')}
            className="group relative text-left transform -skew-x-12 rotate-2 transition-all duration-150 active:scale-95 w-full max-w-xs"
          >
            <div className={`absolute inset-0 bg-red-600 translate-x-1 translate-y-1 transition-transform ${activeScreen === 'initial' ? 'translate-x-2 translate-y-2' : 'group-hover:translate-x-2 group-hover:translate-y-2'}`} />
            <div className={`relative font-black text-base md:text-lg px-5 py-3.5 uppercase tracking-wide border-2 transition-all ${activeScreen === 'initial' ? 'bg-white text-black border-black' : 'bg-black text-white border-white group-hover:text-red-500'}`}>
              <span className="text-red-600 mr-3 font-mono text-xs">02</span>
              Initial Task
            </div>
          </button>

          {/* Start Workout Control */}
          <button 
            onClick={() => setActiveScreen('workout')}
            className="group relative text-left transform -skew-x-12 -rotate-2 transition-all duration-150 active:scale-95 w-full max-w-xs"
          >
            <div className={`absolute inset-0 bg-red-600 translate-x-1 translate-y-1 transition-transform ${activeScreen === 'workout' ? 'translate-x-2 translate-y-2' : 'group-hover:translate-x-2 group-hover:translate-y-2'}`} />
            <div className={`relative font-black text-base md:text-lg px-5 py-3.5 uppercase tracking-wide border-2 transition-all ${activeScreen === 'workout' ? 'bg-white text-black border-black' : 'bg-black text-white border-white group-hover:text-red-500'}`}>
              <span className="text-red-600 mr-3 font-mono text-xs">03</span>
              Start Workout
            </div>
          </button>

          {/* Today's Schedule Control */}
          <button 
            onClick={() => setActiveScreen('schedule')}
            className="group relative text-left transform -skew-x-12 rotate-1 transition-all duration-150 active:scale-95 w-full max-w-xs"
          >
            <div className={`absolute inset-0 bg-red-600 translate-x-1 translate-y-1 transition-transform ${activeScreen === 'schedule' ? 'translate-x-2 translate-y-2' : 'group-hover:translate-x-2 group-hover:translate-y-2'}`} />
            <div className={`relative font-black text-base md:text-lg px-5 py-3.5 uppercase tracking-wide border-2 transition-all ${activeScreen === 'schedule' ? 'bg-white text-black border-black' : 'bg-black text-white border-white group-hover:text-red-500'}`}>
              <span className="text-red-600 mr-3 font-mono text-xs">04</span>
              Today's Schedule
            </div>
          </button>

        </div>

        {/* WORKSPACE AREA & OPERATIONAL SHARDS */}
        <div className="lg:col-span-8 h-full flex flex-col justify-start pb-4 relative z-20">
          
          {/* FUNCTIONAL MONITOR AREA */}
          <div className="flex-initial flex items-center justify-center p-2 mb-2 transform lg:-translate-y-12 xl:-translate-y-16">
            
            {activeScreen === 'goals' && (
              <div style={{ animation: 'p5-view-entrance 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} className="bg-black border-2 border-red-600 transform -skew-x-6 p-6 w-full max-w-md shadow-[6px_6px_0px_0px_rgba(220,38,38,0.3)]">
                <div className="text-red-500 font-mono text-xs tracking-widest mb-3 uppercase">// CURRENT OBJECTIVES</div>
                <ul className="space-y-3 font-black text-base uppercase tracking-tight">
                  <li className="flex items-center gap-3 bg-neutral-900/90 p-2 border-l-4 border-red-600">✕ Master React Complex State</li>
                  <li className="flex items-center gap-3 bg-neutral-900/90 p-2 border-l-4 border-red-600">✕ Push Clean Core Architecture to GitHub</li>
                  <li className="flex items-center gap-3 bg-neutral-900/90 p-2 border-l-4 border-red-600">✕ Deploy Initial Dashboard Matrix</li>
                </ul>
              </div>
            )}

            {/* INITIAL TASK SCREEN: Synchronized Dynamic Shard Dialogue Box Layout */}
            {activeScreen === 'initial' && (
              <div className="relative w-full max-w-xl lg:translate-y-10">
                {/* Secondary Offset Shadow Layers */}
                <div 
                  className="absolute inset-0 bg-black clip-p5-large-blade translate-x-3 translate-y-3 pointer-events-none"
                  style={{
                    transformOrigin: 'right center',
                    animation: 'p5-large-blade-extend 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards'
                  }}
                />
                <div 
                  className="absolute inset-0 bg-red-600 clip-p5-large-blade translate-x-1.5 translate-y-1.5 pointer-events-none"
                  style={{
                    transformOrigin: 'right center',
                    animation: 'p5-large-blade-extend 0.48s cubic-bezier(0.19, 1, 0.22, 1) forwards'
                  }}
                />
                
                {/* Main Shard Body Block */}
                <div 
                  className="relative bg-white text-black border border-black clip-p5-large-blade p-6 pt-7 pb-8 pl-8 pr-24"
                  style={{
                    transformOrigin: 'right center',
                    animation: 'p5-large-blade-extend 0.45s cubic-bezier(0.19, 1, 0.22, 1) forwards'
                  }}
                >
                  <p 
                    className="font-black text-xs md:text-sm uppercase tracking-tight leading-relaxed italic text-black font-sans select-text"
                    style={{
                      opacity: 0,
                      animation: 'p5-text-slide 0.3s ease-out 0.45s forwards'
                    }}
                  >
                    "Your dull, dehydrated skin and messy, sluggish state are a complete eyesore, making you look utterly pathetic before the day has even begun. Go drink some water and wash that exhaustion off your face right now, unless you are content with letting everyone else outshine you while you rot like a total nobody."
                  </p>
                </div>
              </div>
            )}

            {activeScreen === 'workout' && (
              <div style={{ animation: 'p5-view-entrance 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} className="bg-black border-2 border-white transform -skew-x-6 p-6 w-full max-w-xl text-left shadow-[6px_6px_0px_0px_#fff] grid grid-cols-1 md:grid-cols-12 gap-6 bg-black/95 backdrop-blur-sm">
                
                {/* Countdown Wing */}
                <div className="md:col-span-5 flex flex-col justify-center items-center border-b-2 md:border-b-0 md:border-r-2 border-neutral-800 pb-4 md:pb-0 md:pr-4">
                  <div className="text-red-600 font-mono text-xs tracking-widest uppercase mb-1">// TIME REMAINING</div>
                  <div className="font-mono text-4xl md:text-5xl font-black tracking-tighter text-white my-2 tabular-nums">
                    {formatTime(workoutSeconds)}
                  </div>
                  <button className="bg-red-600 text-black font-black text-xs px-4 py-2 uppercase tracking-wide transform skew-x-12 border border-black hover:bg-white transition-colors w-full mt-2">
                    ABORT OPERATION
                  </button>
                </div>

                {/* Workout Plan Layout Area */}
                <div className="md:col-span-7 pl-0 md:pl-2 flex flex-col justify-between">
                  <div>
                    <div className="text-red-500 font-mono text-xs tracking-widest uppercase mb-2">// COMBAT CONDITIONING PLAN</div>
                    <ul className="space-y-2 font-black text-xs md:text-sm uppercase tracking-tight text-neutral-400">
                      <li className="flex justify-between items-center bg-neutral-900/80 p-2 border-l-2 border-white text-white">
                        <span>01 // PUSH COMPONENT</span>
                        <span className="font-mono text-red-500">4 SETS</span>
                      </li>
                      <li className="flex justify-between items-center bg-neutral-900/40 p-2 border-l-2 border-neutral-700">
                        <span>02 // PULL PROTOCOL</span>
                        <span className="font-mono text-neutral-500">3 SETS</span>
                      </li>
                      <li className="flex justify-between items-center bg-neutral-900/40 p-2 border-l-2 border-neutral-700">
                        <span>03 // CORE SEVERITY</span>
                        <span className="font-mono text-neutral-500">TO FAILURE</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 text-[10px] text-neutral-600 font-mono tracking-wider uppercase italic">
                    * Layout segment secured. Routine arrays can be customized later.
                  </div>
                </div>

              </div>
            )}

            {activeScreen === 'schedule' && (
              <div style={{ animation: 'p5-view-entrance 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} className="bg-gradient-to-br from-neutral-900 to-black border-2 border-neutral-800 p-6 w-full max-w-md transform -skew-x-6">
                <div className="text-red-500 font-mono text-xs tracking-widest uppercase mb-4">// CHRONOLOGICAL OPERATIONAL TIMELINE</div>
                <div className="space-y-3 font-black text-xs md:text-sm tracking-tight uppercase">
                  <div className="flex justify-between border-b border-neutral-800 pb-1.5"><span className="text-neutral-400">07:00 AM</span> <span className="text-white">Wake Matrix Initialization</span></div>
                  <div className="flex justify-between border-b border-neutral-800 pb-1.5"><span className="text-red-500">09:00 AM</span> <span className="text-white">Core Development Operations</span></div>
                  <div className="flex justify-between border-b border-neutral-800 pb-1.5"><span className="text-neutral-400">04:00 PM</span> <span className="text-white">Data Structures & Algo Drill</span></div>
                  <div className="flex justify-between pb-0.5"><span className="text-neutral-400">09:00 PM</span> <span className="text-white">Combat Workout Loop</span></div>
                </div>
              </div>
            )}

          </div>

          {/* TAILED HORIZONTAL SHARD ENGINE (Hides on 'initial' screen as it's shifted fully to the workspace area) */}
          {activeScreen !== 'initial' && (
            <div className="relative w-full max-w-md mx-auto lg:mx-0 flex flex-col gap-3 mt-2 items-start transform lg:-translate-x-10 lg:translate-y-4 z-30">
              
              {/* TOP SHARD WITH DIRECTIONAL TAIL POINT */}
              <div className="relative w-full min-h-[3.5rem] transform origin-right">
                <div className="absolute inset-0 bg-black clip-top-blade translate-x-1.5 translate-y-1 pointer-events-none" />
                
                <div 
                  key={`top-${activeScreen}`} 
                  className="absolute inset-0 bg-white border-2 border-black clip-top-blade flex items-center pl-6 pr-16 py-2"
                  style={{
                    transformOrigin: 'right center',
                    animation: 'p5-blade-extend 0.45s cubic-bezier(0.19, 1, 0.22, 1) forwards'
                  }}
                >
                  <span 
                    className="text-black font-black font-mono text-xs md:text-sm tracking-tighter uppercase leading-tight"
                    style={{
                      opacity: 0,
                      animation: 'p5-text-slide 0.3s ease-out 0.45s forwards'
                    }}
                  >
                    {systemDialogue[activeScreen].prompt}
                  </span>
                </div>
              </div>

              {/* LOWER SHARD WITH LOWER DIRECTIONAL TAIL HOOK */}
              <div className="relative w-full min-h-[3.5rem] transform origin-right -mt-1">
                <div className="absolute inset-0 bg-red-600 clip-bottom-blade translate-x-0.5 translate-y-0.5 pointer-events-none" />
                
                <div 
                  key={`bottom-${activeScreen}`} 
                  className="absolute inset-0 bg-black border border-white clip-bottom-blade flex items-center pl-6 pr-16 py-2 justify-between gap-4"
                  style={{
                    transformOrigin: 'right center',
                    animation: 'p5-blade-extend 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards'
                  }}
                >
                  <p 
                    className="text-white font-mono font-black text-[10px] md:text-xs tracking-tight italic uppercase leading-tight"
                    style={{
                      opacity: 0,
                      animation: 'p5-text-slide 0.3s ease-out 0.5s forwards'
                    }}
                  >
                    "{systemDialogue[activeScreen].subText}"
                  </p>
                  
                  <span 
                    className="text-red-500 font-black text-sm animate-pulse font-mono hidden md:inline shrink-0"
                    style={{
                      opacity: 0,
                      animation: 'p5-text-slide 0.3s ease-out 0.5s forwards'
                    }}
                  >
                    ►
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}