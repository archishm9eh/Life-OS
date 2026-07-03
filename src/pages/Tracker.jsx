import React, { useState, useEffect, useMemo } from 'react';

// Helper function to fetch saved metrics securely from LocalStorage
const loadSavedState = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

// Generates an exact YYYY-MM-DD date string localized to the user's timezone
const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
};

export default function Tracker() {
  // --- CALENDAR TIME SYSTEMS ---
  const currentWeekDays = useMemo(() => {
    const current = new Date();
    const day = current.getDay();
    const distanceToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(current);
    monday.setDate(current.getDate() + distanceToMonday);

    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weekdays.map((name, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      return {
        name,
        dateStr: getLocalDateString(d)
      };
    });
  }, []);

  const todayStr = useMemo(() => getLocalDateString(), []);

  // --- PERSISTENT CORE STATES ---
  const [waterUnit, setWaterUnit] = useState(() => loadSavedState('tracker_waterUnit', 'glass'));
  const [customTrackers, setCustomTrackers] = useState(() => loadSavedState('tracker_customTrackers', []));
  const [dailyLogs, setDailyLogs] = useState(() => loadSavedState('tracker_dailyLogs', {}));

  // Modal Interactive States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrackerName, setNewTrackerName] = useState('');

  // Save states to local machine storage on modification
  useEffect(() => {
    localStorage.setItem('tracker_waterUnit', JSON.stringify(waterUnit));
    localStorage.setItem('tracker_customTrackers', JSON.stringify(customTrackers));
    localStorage.setItem('tracker_dailyLogs', JSON.stringify(dailyLogs));
  }, [waterUnit, customTrackers, dailyLogs]);

  // --- DATABASE WRITE MUTATION LOGIC ---
  const getLogForDate = (dateStr) => {
    return dailyLogs[dateStr] || {
      waterGlasses: Array(8).fill(false),
      waterBottles: Array(3).fill(false),
      exercise: false,
      customTasks: {}
    };
  };

  const toggleGlass = (index) => {
    const currentLog = getLogForDate(todayStr);
    const updatedGlasses = [...currentLog.waterGlasses];
    updatedGlasses[index] = !updatedGlasses[index];

    setDailyLogs(prev => ({
      ...prev,
      [todayStr]: { ...currentLog, waterGlasses: updatedGlasses }
    }));
  };

  const toggleBottle = (index) => {
    const currentLog = getLogForDate(todayStr);
    const updatedBottles = [...currentLog.waterBottles];
    updatedBottles[index] = !updatedBottles[index];

    setDailyLogs(prev => ({
      ...prev,
      [todayStr]: { ...currentLog, waterBottles: updatedBottles }
    }));
  };

  const toggleExerciseDay = (dateStr) => {
    const currentLog = getLogForDate(dateStr);
    setDailyLogs(prev => ({
      ...prev,
      [dateStr]: { ...currentLog, exercise: !currentLog.exercise }
    }));
  };

  const toggleCustomTaskDay = (trackerId, dateStr) => {
    const currentLog = getLogForDate(dateStr);
    const updatedCustomTasks = { ...currentLog.customTasks };
    updatedCustomTasks[trackerId] = !updatedCustomTasks[trackerId];

    setDailyLogs(prev => ({
      ...prev,
      [dateStr]: { ...currentLog, customTasks: updatedCustomTasks }
    }));
  };

  const handleCreateTracker = (e) => {
    e.preventDefault();
    if (!newTrackerName.trim()) return;

    setCustomTrackers([...customTrackers, {
      id: `task-${Date.now()}`,
      name: newTrackerName.toUpperCase()
    }]);

    setNewTrackerName('');
    setShowAddModal(false);
  };

  const deleteCustomTracker = (trackerId) => {
    setCustomTrackers(customTrackers.filter(t => t.id !== trackerId));
    setDailyLogs(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(date => {
        if (updated[date].customTasks) {
          delete updated[date].customTasks[trackerId];
        }
      });
      return updated;
    });
  };

  // --- PERFORMANCE METRIC AGGREGATION ENGINE ---
  const todayLog = getLogForDate(todayStr);
  const currentWaterCount = waterUnit === 'glass' 
    ? todayLog.waterGlasses.filter(Boolean).length 
    : todayLog.waterBottles.filter(Boolean).length;
  const targetWaterCount = waterUnit === 'glass' ? 8 : 2.5;

  const weeklyScoreMetrics = useMemo(() => {
    let totalPossiblePoints = 0;
    let earnedPoints = 0;

    currentWeekDays.forEach(({ dateStr }) => {
      const log = dailyLogs[dateStr];
      totalPossiblePoints += 1;
      if (log) {
        const glassesLogged = log.waterGlasses ? log.waterGlasses.filter(Boolean).length : 0;
        const bottlesLogged = log.waterBottles ? log.waterBottles.filter(Boolean).length : 0;
        const waterPct = waterUnit === 'glass' ? (glassesLogged / 8) : (bottlesLogged / 2.5);
        earnedPoints += Math.min(waterPct, 1);
      }

      totalPossiblePoints += 1;
      if (log && log.exercise) {
        earnedPoints += 1;
      }

      customTrackers.forEach(tracker => {
        totalPossiblePoints += 1;
        if (log && log.customTasks && log.customTasks[tracker.id]) {
          earnedPoints += 1;
        }
      });
    });

    return totalPossiblePoints === 0 ? 0 : Math.round((earnedPoints / totalPossiblePoints) * 100);
  }, [currentWeekDays, dailyLogs, customTrackers, waterUnit]);

  return (
    // CANVAS: Vanilla Cream Base (#FFF7E6) with a dynamic abstract mesh color system
    <div className="bg-[#FFF7E6] text-[#2D3A47] min-h-screen relative w-full p-6 md:p-12 flex flex-col justify-between font-sans subpixel-antialiased overflow-x-hidden selection:bg-[#F7C8D3]">
      
      {/* GLOBAL BACKGROUND GLOW ORBS - Creates color diversity beneath glass layers */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#A8B58A]/40 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-20 w-[30rem] h-[30rem] bg-[#F7C8D3]/50 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[25rem] h-[25rem] bg-[#A9B7C6]/50 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-[#B46A72]/30 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="w-full max-w-7xl mx-auto z-10 relative">
        
        {/* HEADER INFRASTRUCTURE */}
        <header className="mb-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#2D3A47] drop-shadow-[0_2px_10px_rgba(45,58,71,0.06)]">
              BIOMETRIC TARGET REGISTRY
            </h1>
          </div>
          
          {/* Timestamp Badge: Midnight Lagoon (#2D3A47) Accent Frame */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 px-5 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] font-mono text-xs font-black tracking-wider text-[#2D3A47]">
            SYSTEM DATE: <span className="bg-[#2D3A47] text-[#FFF7E6] ml-2 px-3 py-1 rounded-xl font-sans text-xs font-bold shadow-sm">{todayStr}</span>
          </div>
        </header>

        {/* PRIMARY CONTAINER MODULES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* HYDRO CORE MODULE - Crystal Translucent Glass Sheet */}
          <div className="lg:col-span-7 backdrop-blur-2xl bg-white/25 border border-white/50 border-t-white/80 border-l-white/80 p-8 rounded-[2.5rem] shadow-[0_30px_70px_rgba(45,58,71,0.08)] relative overflow-hidden transition-all duration-300 hover:shadow-[0_35px_80px_rgba(45,58,71,0.12)]">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D3A47]/10 pb-5 mb-8">
              <span className="font-mono text-xs tracking-widest font-black uppercase flex items-center gap-2.5 text-[#2D3A47]/80">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A9B7C6] shadow-[0_0_10px_#A9B7C6]"></span>
                // HYDRO TARGET LOGS
              </span>
              
              {/* High-Gloss Unit Switcher */}
              <div className="bg-white/40 border border-white/60 p-1 flex rounded-xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.03)] backdrop-blur-md">
                <button 
                  type="button" 
                  onClick={() => setWaterUnit('glass')} 
                  className={`px-5 py-2 rounded-lg text-xs font-black tracking-wider transition-all duration-300 ${waterUnit === 'glass' ? 'bg-[#2D3A47] text-white shadow-[0_6px_15px_rgba(45,58,71,0.15)]' : 'text-[#2D3A47]/60 hover:text-[#2D3A47]'}`}
                >
                  GLASSES
                </button>
                <button 
                  type="button" 
                  onClick={() => setWaterUnit('bottle')} 
                  className={`px-5 py-2 rounded-lg text-xs font-black tracking-wider transition-all duration-300 ${waterUnit === 'bottle' ? 'bg-[#2D3A47] text-white shadow-[0_6px_15px_rgba(45,58,71,0.15)]' : 'text-[#2D3A47]/60 hover:text-[#2D3A47]'}`}
                >
                  BOTTLES
                </button>
              </div>
            </div>

            <p className="text-lg font-black tracking-tight text-[#2D3A47] mb-8">
              Objective Metric: <span className="bg-[#A9B7C6]/30 border border-[#A9B7C6]/40 text-[#2D3A47] px-3 py-1 rounded-xl font-mono text-sm font-black ml-1 shadow-sm">{waterUnit === 'glass' ? '8 Fluid Glasses' : '2.5 Tactical Bottles'}</span>
            </p>

            {/* RAW LIQUID METRIC MATRIX */}
            {waterUnit === 'glass' ? (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-6 justify-items-center my-10 px-2">
                {todayLog.waterGlasses.map((filled, idx) => (
                  <button 
                    key={`glass-${idx}`} 
                    type="button" 
                    onClick={() => toggleGlass(idx)} 
                    className="focus:outline-none transition-all duration-300 hover:scale-125 active:scale-95"
                  >
                    <svg 
                      className={`w-9 h-12 transition-all duration-300 ${
                        filled 
                          ? 'text-[#A9B7C6] fill-[#A9B7C6]/80 filter drop-shadow-[0_0_15px_rgba(169,183,198,0.95)] stroke-[#2D3A47] scale-110' 
                          : 'text-transparent stroke-[#2D3A47]/25 hover:stroke-[#2D3A47]/60'
                      }`} 
                      viewBox="0 0 24 32" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polygon points="4 2, 20 2, 17 28, 7 28" />
                      {filled && <path d="M5.5 16 Q12 13 18.5 16" strokeWidth="1.5" fill="none" />}
                    </svg>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-10 justify-center my-10">
                {todayLog.waterBottles.map((filled, idx) => (
                  <button 
                    key={`bottle-${idx}`} 
                    type="button" 
                    onClick={() => toggleBottle(idx)} 
                    className="relative focus:outline-none transition-all duration-300 hover:scale-125 active:scale-95"
                  >
                    <svg 
                      className={`w-12 h-16 transition-all duration-300 ${
                        filled 
                          ? 'text-[#A9B7C6] fill-[#A9B7C6]/70 filter drop-shadow-[0_0_18px_rgba(169,183,198,0.95)] stroke-[#2D3A47] scale-110' 
                          : 'text-transparent stroke-[#2D3A47]/25 hover:stroke-[#2D3A47]/60'
                      }`} 
                      viewBox="0 0 24 32" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M9 2h6v4H9zM6 9h12a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2z" />
                    </svg>
                    {idx === 2 && (
                      <div className="absolute -top-2 -right-4 bg-[#B46A72] text-[9px] text-[#FFF7E6] font-mono px-1.5 py-0.5 font-black rounded-md shadow-sm rotate-12">0.5</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-[#2D3A47]/10 flex justify-between font-mono text-xs font-black uppercase tracking-wider text-[#2D3A47]/60">
              <span>Shift Engine Status</span>
              <span className="bg-[#2D3A47] text-[#FFF7E6] px-3.5 py-1 rounded-xl font-sans font-black shadow-md">{currentWaterCount} / {targetWaterCount}</span>
            </div>
          </div>

          {/* KINETIC ACTIVITY STREAK - Crystal Translucent Glass Sheet */}
          <div className="lg:col-span-5 backdrop-blur-2xl bg-white/25 border border-white/50 border-t-white/80 border-l-white/80 p-8 rounded-[2.5rem] shadow-[0_30px_70px_rgba(45,58,71,0.08)]">
            <div className="border-b border-[#2D3A47]/10 pb-5 mb-6">
              <span className="font-mono text-xs tracking-widest font-black uppercase text-[#2D3A47]/80">// KINETIC PROTOCOLS</span>
            </div>

            <div className="flex flex-col items-center my-4">
              <p className="text-[10px] font-mono font-black tracking-widest text-[#2D3A47]/40 uppercase mb-8">WEEKLY KINETIC SYNC ARRAY</p>
              
              <div className="flex gap-2 w-full justify-between px-1">
                {currentWeekDays.map(({ name, dateStr }) => {
                  const active = !!dailyLogs[dateStr]?.exercise;
                  const isToday = dateStr === todayStr;

                  return (
                    <button 
                      key={dateStr} 
                      type="button" 
                      onClick={() => toggleExerciseDay(dateStr)} 
                      className="flex flex-col items-center gap-4 group focus:outline-none flex-1 transition-all"
                    >
                      <span className={`text-xs font-mono font-black transition-colors ${active ? 'text-[#B46A72]' : isToday ? 'text-[#2D3A47] underline decoration-2' : 'text-[#2D3A47]/40'}`}>
                        {name}
                      </span>
                      
                      <div className="transition-all duration-300 transform group-hover:scale-125">
                        <svg 
                          className={`w-7 h-7 fill-current transition-all duration-300 ${
                            active 
                              ? 'text-[#B46A72] filter drop-shadow-[0_0_14px_rgba(180,106,114,0.95)] scale-115' 
                              : isToday 
                                ? 'text-[#2D3A47]/60 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)]' 
                                : 'text-[#2D3A47]/15 hover:text-[#2D3A47]/40'
                          }`} 
                          viewBox="0 0 32 32"
                        >
                          <path d="M16 6c-2.2 0-4 1.8-4 4 0 1 .4 1.9 1 2.6-2.3.9-4 3.1-4 5.7 0 3.9 4 5.7 8 5.7s8-1.8 8-5.7c0-2.6-1.7-4.8-4-5.7.6-.7 1-1.6 1-2.6 0-2.2-1.8-4-4-4zm-2 4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm2 12c-3.1 0-5.5-1-5.9-3.2.7-.5 1.6-.8 2.6-.8 1.4 0 2.6.7 3.3 1.8l.5.7.5-.7c.7-1.1 1.9-1.8 3.3-1.8 1 0 1.9.3 2.6.8-.4 2.2-2.8 3.2-5.9 3.2z"/>
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-9 pt-5 border-t border-[#2D3A47]/10 font-mono text-xs flex justify-between font-black uppercase tracking-wider text-[#2D3A47]/60">
              <span>Week Engagement</span>
              <span className="text-sm font-sans font-black text-[#2D3A47]">{currentWeekDays.filter(({ dateStr }) => dailyLogs[dateStr]?.exercise).length} / 7 Days</span>
            </div>
          </div>

        </div>

        {/* CUSTOM PARADIGMS EXTENSION HOUSING */}
        {customTrackers.length > 0 && (
          <div className="mt-10 backdrop-blur-2xl bg-white/25 border border-white/50 border-t-white/80 border-l-white/80 p-8 rounded-[2.5rem] shadow-[0_30px_70px_rgba(45,58,71,0.08)]">
            <div className="text-xs font-mono font-black tracking-widest uppercase w-full border-b border-[#2D3A47]/10 pb-4 mb-6 text-[#2D3A47]/50">
              // EXPANSION MODULE ARRAYS
            </div>
            
            <div className="flex flex-col gap-5">
              {customTrackers.map(tracker => (
                <div key={tracker.id} className="bg-white/30 border border-white/40 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all duration-300 hover:bg-white/40">
                  
                  <div className="flex justify-between items-center md:w-1/3">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-[#2D3A47]">{tracker.name}</h3>
                      <p className="text-[10px] font-mono text-[#A8B58A] uppercase font-black tracking-widest mt-0.5">Sage Leaf Insertion Array</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => deleteCustomTracker(tracker.id)}
                      className="text-[#B46A72] hover:text-red-700 font-mono text-xs font-black tracking-widest md:hidden"
                    >
                      [TERMINATE]
                    </button>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 flex-1">
                    <div className="flex gap-2.5">
                      {currentWeekDays.map(({ name, dateStr }) => {
                        const isChecked = !!dailyLogs[dateStr]?.customTasks?.[tracker.id];
                        const isToday = dateStr === todayStr;

                        return (
                          <div key={dateStr} className="flex flex-col items-center gap-1.5">
                            <span className={`text-[10px] font-mono font-bold ${isToday ? 'text-[#B46A72]' : 'opacity-40'}`}>{name}</span>
                            <button
                              type="button"
                              onClick={() => toggleCustomTaskDay(tracker.id, dateStr)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300 border ${
                                isChecked 
                                  ? 'bg-gradient-to-b from-white via-[#A8B58A] to-[#A8B58A] border-white text-white shadow-[inset_0_2px_4px_white,_0_8px_20px_rgba(168,181,138,0.5)] scale-105' 
                                  : isToday 
                                    ? 'bg-white/50 border-white text-transparent' 
                                    : 'bg-white/10 border-white/20 text-transparent hover:border-white/40 hover:bg-white/20'
                              }`}
                            >
                              ✓
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <button 
                      type="button"
                      onClick={() => deleteCustomTracker(tracker.id)}
                      className="hidden md:block text-[#B46A72]/50 hover:text-[#B46A72] font-mono text-lg font-black transition-colors ml-4"
                    >
                      [X]
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DASHBOARD BOTTOM REPORT HOUSING */}
      <footer className="w-full max-w-7xl mx-auto mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#2D3A47]/10 pt-8 z-10 relative">
        
        <div className="backdrop-blur-2xl bg-white/20 border border-white/40 border-t-white/60 border-l-white/60 p-6 rounded-3xl shadow-[0_15px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="text-[10px] font-mono font-black tracking-widest mb-2 text-[#2D3A47]/40">// WEEK COMPLIANCE PERFORMANCE</div>
          <div className="text-xl uppercase font-black flex items-center justify-between">
            Weekly Return Value: 
            <span className="bg-[#F7C8D3] border border-white text-[#2D3A47] text-sm font-mono px-3 py-1 rounded-xl font-black shadow-sm">
              {weeklyScoreMetrics}% ACCURACY
            </span>
          </div>
        </div>

        <div className="backdrop-blur-2xl bg-white/20 border border-white/40 border-t-white/60 border-l-white/60 p-6 rounded-3xl shadow-[0_15px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="text-[10px] font-mono font-black tracking-widest mb-2 text-[#2D3A47]/40">// MATRIX INTEGRITY RATIO</div>
          <div className="text-xl uppercase font-black flex items-center justify-between">
            Core Stability Index: 
            <span className={`text-sm font-mono px-3 py-1 rounded-xl font-black shadow-sm border ${
              weeklyScoreMetrics >= 50 
                ? 'bg-[#A8B58A] border-white text-white' 
                : 'bg-[#B46A72] border-white text-white animate-pulse'
            }`}>
              {weeklyScoreMetrics >= 50 ? "STABLE // SYNCED" : "DIVERGENT // CRITICAL"}
            </span>
          </div>
        </div>

      </footer>

      {/* FLOATING ACTION FAB SYSTEM */}
      <div className="fixed bottom-8 right-8 z-40">
        <button 
          type="button"
          onClick={() => setShowAddModal(true)} 
          className="bg-gradient-to-b from-white via-[#F7C8D3] to-[#F7C8D3] text-[#2D3A47] font-black w-15 h-15 rounded-2xl flex items-center justify-center text-2xl shadow-[0_15px_35px_rgba(180,106,114,0.25)] transition-all duration-200 hover:scale-110 active:scale-95 border border-white/60 shadow-[inset_0_3px_6px_white]"
        >
          ＋
        </button>
      </div>

      {/* ADD TRACKER ACTION MODAL FRAME */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#2D3A47]/20 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
          <form 
            onSubmit={handleCreateTracker}
            className="bg-white/70 backdrop-blur-3xl border border-white/80 p-8 w-full max-w-md rounded-[2.5rem] relative shadow-[0_40px_90px_rgba(45,58,71,0.15)] shadow-[inset_0_2px_4px_white]"
          >
            <div className="bg-[#2D3A47] text-[#FFF7E6] font-mono font-black text-[10px] px-3 py-1.5 uppercase tracking-widest mb-6 inline-block rounded-xl">
              // INITIALIZE CONFIG PARADIGM
            </div>
            
            <label className="block text-xs font-mono tracking-wider uppercase font-black text-[#2D3A47]/70 mb-2">
              TARGET MODULAR LABEL
            </label>
            <input 
              type="text" 
              value={newTrackerName}
              onChange={(e) => setNewTrackerName(e.target.value)}
              placeholder="E.g., READING SCHEDULE" 
              className="w-full bg-white/40 border border-white/60 text-[#2D3A47] px-4 py-3.5 text-sm uppercase font-black rounded-xl focus:outline-none focus:bg-white transition-all duration-200 mb-6 shadow-inner"
              autoFocus
            />

            <div className="flex gap-4 justify-end text-xs font-black uppercase tracking-wider">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 text-[#2D3A47]/50 hover:text-[#2D3A47] font-mono tracking-widest"
              >
                [ABORT]
              </button>
              <button 
                type="submit"
                className="px-6 py-3 bg-[#2D3A47] text-[#FFF7E6] hover:bg-black rounded-xl shadow-md transition-all duration-200 active:scale-95 font-bold"
              >
                DEPLOY ARRAY
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}