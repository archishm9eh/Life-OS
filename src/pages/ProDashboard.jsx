import React, { useState, useEffect, useRef } from 'react';

export default function Pro() {
  // 1. STATE CONFIGURATION
  const [telemetry, setTelemetry] = useState({
    active_app: "Offline",
    active_title: "Connecting to magical eye...",
    consecutive_distraction_time: 0,
    breach_detected: false
  });
  
  const [yesterdaysGoals, setYesterdaysGoals] = useState([]);
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: "You retreat into dreamy, colorful horizons to escape reality. Let us tear down the illusion. What did you actually execute today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [monitorOffline, setMonitorOffline] = useState(false);
  
  const chatEndRef = useRef(null);

  // 2. SAFE DATA BRIDGE: READS RAW STRINGS FROM P5_TODAY_GOALS
  useEffect(() => {
    const storedGoals = localStorage.getItem('p5_today_goals');
    const storedCompletedIndexes = localStorage.getItem('p5_completed_goal_indexes');
    
    let completedIndexes = [];
    if (storedCompletedIndexes) {
      try {
        completedIndexes = JSON.parse(storedCompletedIndexes);
      } catch (e) {
        console.error("Failed to parse completion indexes:", e);
      }
    }

    if (storedGoals) {
      try {
        const parsed = JSON.parse(storedGoals);
        if (Array.isArray(parsed)) {
          // Transforms your dashboard's raw text strings into tracking modules cleanly
          const formatted = parsed.slice(0, 3).map((goalText, idx) => ({
            id: idx,
            text: typeof goalText === 'string' ? goalText : "Empty Tactical Objective",
            completed: completedIndexes.includes(idx)
          }));
          setYesterdaysGoals(formatted);
        }
      } catch (err) {
        console.error("Dashboard database sync failed:", err);
      }
    } else {
      setYesterdaysGoals([
        { id: 'err', text: "No active targets initialized in 'p5_today_goals'. Set objectives on the Dashboard first.", completed: false }
      ]);
    }
  }, []);

  // 3. POLL TELEMETRY FROM PYTHON MONITOR
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/telemetry?t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const data = await response.json();
        setTelemetry(data);
        setMonitorOffline(false);
      } catch (error) {
        setMonitorOffline(true);
        setTelemetry(prev => ({ ...prev, active_app: "OFFLINE", active_title: "Run python monitor.py in terminal" }));
      }
    };

    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // 4. SAFE TOGGLE ENGINE (Keeps Dashboard array structurally untouched)
  const toggleGoal = (id) => {
    if (id === 'err') return;
    
    setYesterdaysGoals(prev => {
      const updated = prev.map(goal => goal.id === id ? { ...goal, completed: !goal.completed } : goal);
      const completedIndexes = updated.filter(g => g.completed).map(g => g.id);
      
      // Persist the completed index values independently
      localStorage.setItem('p5_completed_goal_indexes', JSON.stringify(completedIndexes));
      return updated;
    });
  };

  const failedGoalsCount = yesterdaysGoals.filter(g => !g.completed && g.id !== 'err').length;
  const totalGoalsCount = yesterdaysGoals.filter(g => g.id !== 'err').length;

  // 5. INTEL ARCHITECTURE: JOHAN LIEBERT DEMOLITION CORE
  const sendToTacticalAuditor = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAiLoading) return;

    const userMessage = userInput;
    setUserInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsAiLoading(true);

    const API_KEY = localStorage.getItem('p5_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!API_KEY || API_KEY.trim() === '') {
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        text: "[SYSTEM ERROR]: API key missing. Go back to your Dashboard screen and paste your Gemini API key into the portal first." 
      }]);
      setIsAiLoading(false);
      return;
    }

    // UPDATED: Set to the current production Gemini 2.5 Flash model matrix
    const MODEL_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const contextRules = `
      [CRITICAL INSTRUCTION SYSTEM: YOU MUST ADOPT THIS PERSONA IMMEDIATELY. DO NOT BREAK CHARACTER]
      You are Johan Liebert, the soft-spoken, unsettlingly calm tactical auditor of this user's routine.
      
      HUMILIATION STRATEGY MATRIX:
      - You completely despise standard corporate AI motivation. It fails this user. 
      - Speak with quiet, freezing, calculated contempt. Never use exclamation marks, never shout, never use profanity.
      - Ruthlessly break down their digital paralysis. Target their exact loop: they talk incredibly big about major software projects, coding data structures, and reaching success, but they run away to cheap distractions like a coward.
      - If they offer pathetic excuses like delaying their deployment or hiding a project because of algorithmic timing or what day of the week it is, destroy that fragile justification instantly.
      - You must say something directly along these lines: "You only talk big and do nothing. You only cry and get secretly jealous of others who build things, but you choose to do absolutely nothing yourself. You sit in your room staring at beautiful interfaces, dreaming instead of executing."
      
      CURRENT TELEMETRY METRICS:
      - Dashboard targets left unexecuted: ${failedGoalsCount} out of ${totalGoalsCount}.
      - Foreground desktop program captured: "${telemetry.active_app}".
      - Slacking duration: ${telemetry.consecutive_distraction_time} seconds.
      
      Dismantle their response. Keep it to 3 or 4 chillingly precise, elegant sentences.
    `;

    const dynamicHistory = chatHistory.filter(msg => msg.text !== "You retreat into dreamy, colorful horizons to escape reality. Let us tear down the illusion. What did you actually execute today?");

    const formattedContents = [
      ...dynamicHistory.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      })),
      { 
        role: 'user', 
        parts: [{ text: `${contextRules}\n\nUser Statement to audit: "${userMessage}"` }] 
      }
    ];

    try {
      const response = await fetch(MODEL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedContents })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || `HTTP status ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      setChatHistory(prev => [...prev, { role: 'model', text: aiResponse }]);
    } catch (error) {
      console.error("Audit channel failure:", error);
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        text: `[CONNECTION SHATTERED]: ${error.message}. Check your API key access parameters. Johan refuses to speak through a broken terminal.` 
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#070512] via-[#0f0c24] to-[#05040a] text-purple-200/70 p-4 md:p-8 font-sans selection:bg-purple-800/50 selection:text-white relative overflow-hidden">
      
      {/* BACKGROUND LUMINESCENT ORBS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* TOP HEADER PLATFORM */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative border-b border-purple-500/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
            ✦ CHRONICLES OF PROCONSCIOUSNESS
          </h1>
          <p className="text-xs text-purple-400/40 tracking-widest uppercase mt-1">REAL-TIME TELEMETRY ENGINE // TWILIGHT FOREST DEPLOYMENT</p>
        </div>
        <div className="flex gap-3 items-center">
          {monitorOffline && (
            <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 text-[10px] tracking-widest rounded-full animate-pulse">
              EYE_OFFLINE
            </span>
          )}
          <div className="bg-purple-950/30 backdrop-blur-md border border-purple-500/10 px-4 py-1.5 rounded-full text-xs text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.05)]">
            STATUS: <span className={telemetry.breach_detected ? "text-orange-400 animate-pulse font-semibold" : "text-purple-400"}>
              {telemetry.breach_detected ? "ATTENTION_DEFICIT" : "EVALUATING"}
            </span>
          </div>
        </div>
      </div>

      {/* INTERFACE GRID WORKSPACE */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        
        {/* LEFT INSIGHT LABELS */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* SYNCED VERIFICATION MATRIX */}
          <div className="bg-purple-950/10 backdrop-blur-xl border border-purple-500/10 p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center border-b border-purple-500/10 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-purple-200 tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                [ Synchronized Objectives ]
              </h3>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${failedGoalsCount === 0 ? "bg-purple-900/30 text-purple-300" : "bg-orange-500/10 text-orange-300"}`}>
                {failedGoalsCount === 0 ? "PRISTINE" : `${failedGoalsCount} PENDING`}
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {yesterdaysGoals.map(goal => (
                <div 
                  key={goal.id} 
                  onClick={() => goal.id !== 'err' && toggleGoal(goal.id)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    goal.completed 
                      ? "bg-purple-950/5 border-purple-950/20 text-purple-300/30 line-through" 
                      : "bg-purple-950/20 border-purple-500/5 hover:border-purple-500/20 text-purple-200/80 cursor-pointer shadow-inner"
                  }`}
                >
                  <div className={`w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center text-[11px] transition-all duration-300 ${
                    goal.completed ? "border-purple-500/20 bg-purple-500/20 text-purple-300" : "border-purple-500/30 bg-black/40"
                  }`}>
                    {goal.completed && "✦"}
                  </div>
                  <span className="text-xs leading-relaxed tracking-wide">{goal.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* EYE TELEMETRY MONITOR */}
          <div className="bg-purple-950/10 backdrop-blur-xl border border-purple-500/10 p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <h3 className="text-sm font-semibold text-purple-200 tracking-wide mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_#f472b6]" />
              [ Real-Time Vision ]
            </h3>
            <div className="bg-black/30 border border-purple-500/5 p-4 rounded-2xl flex flex-col gap-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-purple-400/50">ACTIVE ENGAGEMENT:</span>
                <span className="text-purple-200 bg-purple-500/10 px-2.5 py-0.5 rounded-md font-medium border border-purple-500/10">{telemetry.active_app}</span>
              </div>
              <div className="flex flex-col gap-1.5 border-t border-purple-500/10 pt-3">
                <span className="text-purple-400/50">METADATA VECTOR:</span>
                <span className="text-purple-300/70 truncate text-[11px] bg-black/20 p-2 rounded-xl border border-purple-500/5">{telemetry.active_title}</span>
              </div>
              <div className="flex justify-between border-t border-purple-500/10 pt-3 items-center">
                <span className="text-purple-400/50">FOCAL DRIFT TIMER:</span>
                <span className={`font-semibold ${telemetry.consecutive_distraction_time > 0 ? "text-orange-300 animate-pulse" : "text-purple-400/40"}`}>
                  {telemetry.consecutive_distraction_time}s <span className="text-[10px] text-purple-400/30">/ 600s</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AUDITOR RECKONING TERMINAL */}
        <div className="lg:col-span-7 bg-purple-950/10 backdrop-blur-xl border border-purple-500/10 rounded-3xl flex flex-col min-h-[500px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden">
          
          {/* HEADER BAR */}
          <div className="flex justify-between items-center border-b border-purple-500/10 p-4 bg-purple-950/20">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c] animate-pulse"></span>
              <h3 className="text-xs font-semibold text-purple-200 tracking-wider uppercase">
                PROXY_LINK // CRITIQUE_JOHAN
              </h3>
            </div>
            <span className="text-[10px] text-purple-400/40 tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded-full">AUDIT_ACTIVE</span>
          </div>

          {/* CHAT GRID CONTAINER */}
          <div className="flex-1 bg-black/10 p-4 overflow-y-auto flex flex-col gap-4 max-h-[390px] min-h-[320px]">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                <span className="text-[9px] text-purple-400/30 uppercase mb-1 tracking-widest font-medium">
                  {msg.role === 'user' ? '✦ OPERATOR_EXCUSE' : '✦ JOHAN'}
                </span>
                <div className={`p-3.5 text-xs leading-relaxed tracking-wide border rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-orange-500/5 border-orange-500/10 text-orange-200/80 text-right rounded-tr-sm shadow-[0_4px_15px_rgba(251,146,60,0.02)]' 
                    : 'bg-purple-950/40 border-purple-500/10 text-purple-100 rounded-tl-sm shadow-[0_4px_15px_rgba(168,85,247,0.02)]'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="text-left text-[10px] text-purple-400/40 animate-pulse tracking-widest p-2">
                ✦ JOHAN IS CONTEXTUALIZING YOUR INACTION...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT FORM PROTOCOL */}
          <form onSubmit={sendToTacticalAuditor} className="border-t border-purple-500/10 bg-black/20 p-3 flex gap-2.5 items-center">
            <span className="text-purple-500/40 font-semibold pl-2 text-sm">✦</span>
            <input 
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isAiLoading}
              placeholder="Provide your defense, or accept your parameters..."
              className="flex-1 bg-transparent border-none text-purple-200 text-xs focus:outline-none placeholder-purple-400/20 font-sans"
            />
            <button 
              type="submit"
              disabled={isAiLoading || !userInput.trim()}
              className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-white px-5 py-2 text-xs uppercase tracking-widest font-semibold rounded-xl disabled:opacity-20 transition-all duration-300 shadow-md"
            >
              LOG
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}