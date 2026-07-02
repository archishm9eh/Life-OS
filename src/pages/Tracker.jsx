import React, { useState, useEffect } from 'react';

// Helper function to load saved data from the browser
const loadSavedState = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export default function Tracker() {
  // 1. Initialize States from LocalStorage (Prevents data loss on reload)
  const [waterUnit, setWaterUnit] = useState(() => loadSavedState('tracker_waterUnit', 'glass')); 
  const [waterGlasses, setWaterGlasses] = useState(() => loadSavedState('tracker_waterGlasses', Array(8).fill(false))); 
  const [waterBottles, setWaterBottles] = useState(() => loadSavedState('tracker_waterBottles', Array(3).fill(false))); 

  const [exerciseDays, setExerciseDays] = useState(() => loadSavedState('tracker_exerciseDays', {
    Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false
  }));

  const [customTrackers, setCustomTrackers] = useState(() => loadSavedState('tracker_customTrackers', []));
  
  // Modal States (These don't need to be saved to LocalStorage)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrackerName, setNewTrackerName] = useState('');
  const [newTrackerLimit, setNewTrackerLimit] = useState('7');
  const [newTrackerUnit, setNewTrackerUnit] = useState('Days');

  // 2. Save to LocalStorage whenever any data changes
  useEffect(() => {
    localStorage.setItem('tracker_waterUnit', JSON.stringify(waterUnit));
    localStorage.setItem('tracker_waterGlasses', JSON.stringify(waterGlasses));
    localStorage.setItem('tracker_waterBottles', JSON.stringify(waterBottles));
    localStorage.setItem('tracker_exerciseDays', JSON.stringify(exerciseDays));
    localStorage.setItem('tracker_customTrackers', JSON.stringify(customTrackers));
  }, [waterUnit, waterGlasses, waterBottles, exerciseDays, customTrackers]);

  // Standard Toggles
  const toggleGlass = (index) => {
    const updated = [...waterGlasses];
    updated[index] = !updated[index];
    setWaterGlasses(updated);
  };

  const toggleBottle = (index) => {
    const updated = [...waterBottles];
    updated[index] = !updated[index];
    setWaterBottles(updated);
  };

  const toggleExerciseDay = (day) => {
    setExerciseDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  // Custom Task Logic
  const handleCreateTracker = (e) => {
    e.preventDefault();
    if (!newTrackerName.trim()) return;
    
    // Ensure the limit is a valid number
    const limitNum = Math.max(1, parseInt(newTrackerLimit) || 1);
    
    setCustomTrackers([...customTrackers, {
      id: Date.now(),
      name: newTrackerName.toUpperCase(),
      limit: limitNum,
      unit: newTrackerUnit,
      progress: Array(limitNum).fill(false) // Creates an array of checkboxes based on the limit
    }]);

    setNewTrackerName('');
    setNewTrackerLimit('7');
    setShowAddModal(false);
  };

  const toggleCustomTaskDay = (trackerId, dayIndex) => {
    setCustomTrackers(customTrackers.map(tracker => {
      if (tracker.id === trackerId) {
        const newProgress = [...tracker.progress];
        newProgress[dayIndex] = !newProgress[dayIndex];
        return { ...tracker, progress: newProgress };
      }
      return tracker;
    }));
  };

  const deleteCustomTracker = (trackerId) => {
    setCustomTrackers(customTrackers.filter(tracker => tracker.id !== trackerId));
  };

  // Performance Report Progress Aggregations
  const waterLoggedCount = waterUnit === 'glass' ? waterGlasses.filter(Boolean).length : waterBottles.filter(Boolean).length;
  const waterTargetCount = waterUnit === 'glass' ? 8 : 2.5;
  const waterPercentage = Math.min(Math.round((waterLoggedCount / waterTargetCount) * 100), 100);

  const workoutsCompleted = Object.values(exerciseDays).filter(Boolean).length;
  const exercisePercentage = Math.round((workoutsCompleted / 7) * 100);

  const calculatedWeeklyScore = Math.round((waterPercentage + exercisePercentage) / 2);

  return (
    <div className="relative max-w-7xl mx-auto p-6 md:p-12 min-h-[calc(100vh-6rem)] flex flex-col justify-between select-none">
      
      <style>{`
        .clip-p5-tracker-card { clip-path: polygon(0% 0%, 96% 0%, 100% 8%, 100% 100%, 4% 100%, 0% 92%); }
        .clip-p5-report-shard { clip-path: polygon(0% 0%, 100% 0%, 95% 100%, 0% 100%); }
      `}</style>

      <div className="w-full">
        {/* Header Title */}
        <div className="bg-[#D3968C] text-zinc-950 font-black text-xl md:text-2xl px-6 py-1 tracking-tighter uppercase inline-block -rotate-2 border border-zinc-950 shadow-[3px_3px_0px_0px_#105666] mb-8">
          BIOMETRIC TARGET REGISTRY
        </div>

        {/* TRACKING MODULE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* WATER PROTOCOL INTERFACE */}
          <div className="lg:col-span-7 bg-[#105666] border-2 border-[#D3968C] p-6 clip-p5-tracker-card shadow-[5px_5px_0px_0px_rgba(211,150,140,0.15)]">
            <div className="flex justify-between items-center border-b border-[#0d4653] pb-3 mb-4">
              <span className="text-[#D3968C] font-mono text-xs tracking-wider font-extrabold">// HYDRO PROTOCOL METRICS</span>
              <div className="bg-[#0b3b46] p-0.5 flex border border-[#0d4653] text-[10px] font-black">
                <button type="button" onClick={() => setWaterUnit('glass')} className={`px-3 py-1 transition-all ${waterUnit === 'glass' ? 'bg-[#D9F5F0] text-[#105666]' : 'text-zinc-400 hover:text-white'}`}>GLASSES</button>
                <button type="button" onClick={() => setWaterUnit('bottle')} className={`px-3 py-1 transition-all ${waterUnit === 'bottle' ? 'bg-[#D9F5F0] text-[#105666]' : 'text-zinc-400 hover:text-white'}`}>BOTTLES</button>
              </div>
            </div>

            <p className="text-xs text-zinc-200 uppercase font-bold mb-6">
              Daily Target Objective: <span className="text-[#D9F5F0] font-black">{waterUnit === 'glass' ? '8 Fluid Glasses' : '2.5 Tactical Bottles'}</span>
            </p>

            {/* Interactive Fluid Matrix */}
            {waterUnit === 'glass' ? (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4 justify-items-center my-4">
                {waterGlasses.map((filled, idx) => (
                  <button key={`glass-${idx}`} type="button" onClick={() => toggleGlass(idx)} className="group focus:outline-none transition-transform active:scale-90">
                    <svg className={`w-10 h-14 transition-all duration-200 ${filled ? 'text-[#D9F5F0] fill-[#D9F5F0]/40 filter drop-shadow-[0_0_10px_rgba(217,245,240,0.95)] scale-105' : 'text-[#D9F5F0]/20 fill-transparent hover:text-[#D9F5F0]/40'}`} viewBox="0 0 24 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="4 2, 20 2, 17 28, 7 28" />
                      {filled && <path d="M6 18 Q12 15 18 18" stroke="currentColor" strokeWidth="1.5" fill="none" />}
                    </svg>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-8 justify-center my-4">
                {waterBottles.map((filled, idx) => (
                  <button key={`bottle-${idx}`} type="button" onClick={() => toggleBottle(idx)} className="relative group focus:outline-none transition-transform active:scale-90">
                    <svg className={`w-12 h-16 transition-all duration-200 ${filled ? 'text-[#D9F5F0] fill-[#D9F5F0]/30 filter drop-shadow-[0_0_12px_rgba(217,245,240,0.85)] scale-105' : 'text-[#D9F5F0]/20 fill-transparent hover:text-[#D9F5F0]/40'}`} viewBox="0 0 24 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 2h6v4H9zM6 9h12a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2z" />
                    </svg>
                    {idx === 2 && (
                      <div className="absolute -top-1 -right-3 bg-[#D3968C] text-[9px] font-mono px-1 border border-zinc-950 font-black text-zinc-950 rotate-12">0.5</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-[#0d4653] flex justify-between font-mono text-[11px] text-zinc-300 font-bold">
              <span>SYNC STATUS // LOGGED</span>
              <span className="text-[#D9F5F0] font-black">{waterUnit === 'glass' ? `${waterGlasses.filter(Boolean).length} / 8` : `${waterBottles.filter(Boolean).length} / 2.5`}</span>
            </div>
          </div>

          {/* KINETIC EXERCISE PROTOCOL */}
          <div className="lg:col-span-5 bg-black border-2 border-[#5AA371] p-6 clip-p5-tracker-card shadow-[5px_5px_0px_0px_rgba(90,163,113,0.15)]">
            <div className="border-b border-zinc-800 pb-3 mb-4">
              <span className="text-[#5AA371] font-mono text-xs tracking-wider font-extrabold">// PHYSICAL COMPONENT STREAK</span>
            </div>

            <div className="flex flex-col items-center my-3">
              <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-4">WEEKLY KINETIC SYNC ARRAY</p>
              
              <div className="flex gap-2 w-full justify-between px-1">
                {Object.keys(exerciseDays).map((day) => {
                  const active = exerciseDays[day];
                  return (
                    <button key={day} type="button" onClick={() => toggleExerciseDay(day)} className="flex flex-col items-center gap-2 group focus:outline-none">
                      <span className={`text-[10px] font-mono font-black transition-colors ${active ? 'text-[#5AA371]' : 'text-zinc-600'}`}>{day}</span>
                      <svg className={`w-8 h-8 transition-all duration-300 transform group-hover:scale-110 ${active ? 'text-[#5AA371] filter drop-shadow-[0_0_6px_#5AA371]' : 'text-zinc-800 fill-zinc-800'}`} viewBox="0 0 32 32">
                        <path d="M16 6c-2.2 0-4 1.8-4 4 0 1 .4 1.9 1 2.6-2.3.9-4 3.1-4 5.7 0 3.9 4 5.7 8 5.7s8-1.8 8-5.7c0-2.6-1.7-4.8-4-5.7.6-.7 1-1.6 1-2.6 0-2.2-1.8-4-4-4zm-2 4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm2 12c-3.1 0-5.5-1-5.9-3.2.7-.5 1.6-.8 2.6-.8 1.4 0 2.6.7 3.3 1.8l.5.7.5-.7c.7-1.1 1.9-1.8 3.3-1.8 1 0 1.9.3 2.6.8-.4 2.2-2.8 3.2-5.9 3.2z"/>
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-zinc-900 font-mono text-[11px] text-zinc-500 flex justify-between font-bold">
              <span>WEEK ENGAGEMENT VALUE</span>
              <span className="text-[#5AA371] font-black">{workoutsCompleted} / 7 DAYS</span>
            </div>
          </div>

        </div>

        {/* CUSTOM INJECTED MODULAR LIST (WITH CHECKBOXES) */}
        {customTrackers.length > 0 && (
          <div className="mt-6 bg-zinc-950 border border-[#105666]/40 p-4">
            <div className="text-[10px] font-mono text-[#D3968C] font-black tracking-widest uppercase w-full border-b border-zinc-900 pb-2 mb-4">
              // EXPANSION PARADIGMS (CUSTOM MODULES)
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customTrackers.map(tracker => {
                const completedCount = tracker.progress.filter(Boolean).length;
                const isFullyComplete = completedCount === tracker.limit;

                return (
                  <div key={tracker.id} className={`p-4 border-2 flex flex-col justify-between transition-colors ${isFullyComplete ? 'bg-[#5AA371]/10 border-[#5AA371]' : 'bg-black border-zinc-800'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">{tracker.name}</h3>
                        <p className="text-[10px] font-mono text-zinc-500 mt-0.5">TARGET: {tracker.limit} {tracker.unit.toUpperCase()}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black font-mono ${isFullyComplete ? 'text-[#5AA371]' : 'text-[#D3968C]'}`}>
                          {completedCount} / {tracker.limit}
                        </span>
                        <button 
                          onClick={() => deleteCustomTracker(tracker.id)}
                          className="text-zinc-600 hover:text-red-500 font-mono text-[10px] font-bold tracking-widest"
                        >
                          [X]
                        </button>
                      </div>
                    </div>

                    {/* Interactive Array of Checkboxes */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tracker.progress.map((isDone, index) => (
                        <button
                          key={`${tracker.id}-day-${index}`}
                          type="button"
                          onClick={() => toggleCustomTaskDay(tracker.id, index)}
                          className={`w-6 h-6 flex items-center justify-center text-[11px] font-black transition-all border ${
                            isDone 
                              ? 'bg-[#5AA371] border-[#5AA371] text-zinc-950 shadow-[1px_1px_0px_0px_#D9F5F0]' 
                              : 'bg-zinc-900 border-zinc-700 text-transparent hover:border-[#D3968C]'
                          }`}
                        >
                          ✓
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER METRIC GENERATOR SHARDS */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 border-t-2 border-zinc-900 pt-6">
        
        <div className="bg-zinc-950 border-l-4 border-[#D3968C] p-4 clip-p5-report-shard">
          <div className="text-[11px] font-mono font-black text-[#D3968C] tracking-wider mb-1 uppercase">// REAL-TIME WEEKLY REPORT</div>
          <div className="text-xs text-zinc-400 uppercase font-black">
            Current Score Rating: <span className="text-white text-sm font-mono ml-1">{calculatedWeeklyScore}%</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono italic">
            {calculatedWeeklyScore >= 75 ? "RANK S // INTEGRATION EXCEEDS BASIC LIMITS. KEEP PRESSING." : "RANK C // RESOURCE COGNITION SLUGGISH. EXECUTE MISSIONS."}
          </p>
        </div>

        <div className="bg-zinc-950 border-l-4 border-[#5AA371] p-4 clip-p5-report-shard">
          <div className="text-[11px] font-mono font-black text-[#5AA371] tracking-wider mb-1 uppercase">// ESTIMATED MONTHLY MATRIX</div>
          <div className="text-xs text-zinc-400 uppercase font-black">
            System Core Stability: <span className="text-[#D3968C] text-sm font-mono ml-1">{calculatedWeeklyScore >= 50 ? "STABLE" : "DIVERGENT"}</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono italic">
            Monthly processing algorithms reset at intervals. Keep compliance continuous.
          </p>
        </div>

      </div>

      {/* LOWER RIGHT FLOATING FAB TARGET BUTTON */}
      <div className="absolute bottom-4 right-4 z-40">
        <button 
          type="button"
          onClick={() => setShowAddModal(true)} 
          className="bg-[#D3968C] hover:bg-[#D9F5F0] text-zinc-950 font-black w-12 h-12 flex items-center justify-center text-2xl shadow-[3px_3px_0px_0px_#105666] transform -rotate-3 transition-all active:scale-95 border-2 border-zinc-950"
        >
          ＋
        </button>
      </div>

      {/* EXPANSION METRIC MODAL POPUP ENTRY */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateTracker}
            className="bg-zinc-950 border-4 border-[#105666] p-6 w-full max-w-sm relative transform rotate-1 shadow-[6px_6px_0px_0px_#D3968C]"
          >
            <div className="bg-[#D3968C] text-zinc-950 font-mono font-black text-[10px] px-2 py-0.5 uppercase tracking-widest mb-4 inline-block">
              // INITIALIZE EXPANSION PROTOCOL
            </div>
            
            <label className="block text-[10px] font-mono tracking-wider uppercase text-zinc-400 mb-1">TARGET MANIFEST NAME</label>
            <input 
              type="text" 
              value={newTrackerName}
              onChange={(e) => setNewTrackerName(e.target.value)}
              placeholder="E.g., READING CYCLES" 
              className="w-full bg-zinc-900 border-2 border-zinc-800 text-white p-2 text-xs uppercase font-black tracking-tight mb-4 focus:outline-none focus:border-[#D3968C]"
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-[10px] font-mono tracking-wider uppercase text-zinc-400 mb-1">CHECKBOX LIMIT</label>
                <input 
                  type="number" 
                  value={newTrackerLimit}
                  onChange={(e) => setNewTrackerLimit(e.target.value)}
                  min="1"
                  max="100"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 text-white p-2 text-xs font-mono font-bold focus:outline-none focus:border-[#D3968C]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono tracking-wider uppercase text-zinc-400 mb-1">TIME METRIC</label>
                <select 
                  value={newTrackerUnit}
                  onChange={(e) => setNewTrackerUnit(e.target.value)}
                  className="w-full bg-zinc-900 border-2 border-zinc-800 text-white p-2 text-xs font-black tracking-tight focus:outline-none focus:border-[#D3968C]"
                >
                  <option>Days</option>
                  <option>Sessions</option>
                  <option>Months</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end text-xs font-black uppercase tracking-tight">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-zinc-900 text-zinc-500 hover:text-white transform -skew-x-12 border border-zinc-800"
              >
                ABORT
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-[#D3968C] text-zinc-950 hover:bg-[#D9F5F0] transform -skew-x-12 border border-zinc-950"
              >
                DEPLOY
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}