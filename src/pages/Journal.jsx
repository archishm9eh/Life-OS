import React, { useState, useEffect, useRef } from 'react';

// Helper to convert date object to local YYYY-MM-DD string
const getLocalDateString = (date) => {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
};

export default function Journal() {
  const dateInputRef = useRef(null);

  // --- CORE STATE ARCHITECTURE ---
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
  const [isArchiveOpen, setIsArchiveOpen] = useState(false); // Controls the Starred Archive modal
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('journal_entries');
      const parsed = saved ? JSON.parse(saved) : {};
      
      // AUTO-RETENTION FILTERING: Deletes logs older than 7 days unless starred
      const updated = { ...parsed };
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thresholdStr = getLocalDateString(oneWeekAgo);

      Object.keys(updated).forEach((dateStr) => {
        if (dateStr < thresholdStr && !updated[dateStr]?.starred) {
          delete updated[dateStr];
        }
      });
      
      localStorage.setItem('journal_entries', JSON.stringify(updated));
      return updated;
    } catch (e) {
      return {};
    }
  });

  // Persist modifications to localStorage
  useEffect(() => {
    localStorage.setItem('journal_entries', JSON.stringify(entries));
  }, [entries]);

  // Derived Values for UI Header
  const dateObj = new Date(selectedDate + 'T00:00:00');
  const localizedDay = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const localizedDateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Gather all dates currently marked as starred for the Archive Dropdown
  const starredDates = Object.keys(entries)
    .filter((dateStr) => entries[dateStr]?.starred)
    .sort((a, b) => b.localeCompare(a)); // Sort latest first

  // Safe accessor for current entry attributes
  const currentEntry = entries[selectedDate] || {
    well: '',
    wrong: '',
    learned: '',
    tomorrow: '',
    starred: false,
  };

  // --- WRITE MUTATION HANDLERS ---
  const updateField = (field, value) => {
    setEntries((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [field]: value,
      },
    }));
  };

  const toggleStar = () => {
    setEntries((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentEntry,
        starred: !currentEntry.starred,
      },
    }));
  };

  const openCalendarDropdown = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (err) {
        dateInputRef.current.click();
      }
    }
  };

  return (
    // DESKTOP WORKSPACE: Soft Blush Pink Gingham / Binder background
    <div className="bg-[#F7C8D3]/40 min-h-screen w-full p-4 md:p-8 flex items-center justify-center font-sans relative overflow-hidden subpixel-antialiased select-none">
      
      {/* Decorative background ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-white/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-[#F7C8D3]/60 rounded-full blur-[100px] pointer-events-none"></div>

      {/* MAIN BINDER COVER BASE */}
      <div className="w-full max-w-5xl bg-[#B46A72]/20 p-2 md:p-4 rounded-[2.5rem] shadow-[0_25px_60px_rgba(180,106,114,0.15)] flex relative items-stretch">
        
        {/* DECORATIVE SIDE TABS */}
        <div className="hidden lg:flex flex-col gap-3 pt-16 pr-1 z-0 -mr-1 select-none">
          <div className="bg-[#B46A72] text-[#FFF7E6] font-bold text-[11px] tracking-widest uppercase py-4 px-2 rounded-l-xl shadow-md [writing-mode:vertical-lr] rotate-180 cursor-default">
            SCHEDULE
          </div>
          <div className="bg-[#FFF7E6] text-[#B46A72] font-black text-[11px] tracking-widest uppercase py-5 px-2 rounded-l-xl shadow-sm border-y border-l border-[#B46A72]/20 [writing-mode:vertical-lr] rotate-180 cursor-default">
            DIARY
          </div>
          <div className="bg-[#A8B58A] text-[#FFF7E6] font-bold text-[11px] tracking-widest uppercase py-4 px-2 rounded-l-xl shadow-md [writing-mode:vertical-lr] rotate-180 cursor-default">
            TRACKER
          </div>
        </div>

        {/* DIARY PAGE: Cream Sheet Base (#FFF7E6) */}
        <div className="bg-[#FFF7E6] border border-white/80 w-full rounded-[2rem] p-6 md:p-10 shadow-inner relative z-10 flex flex-col justify-between overflow-hidden">
          
          {/* Subtle horizontal soft guidelines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(45,58,71,0.02)_1px,transparent_1px)] bg-[size:100%_28px] pointer-events-none top-32"></div>

          {/* TOP HEADER MODULE */}
          <header className="relative z-30 flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b-2 border-dashed border-[#F7C8D3] pb-6 mb-8">
            
            <div>
              <span className="font-serif italic text-lg text-[#B46A72] block md:ml-1 -mb-1 opacity-80">Everyday</span>
              <h2 className="font-serif text-3xl md:text-4xl font-black tracking-tight text-[#2D3A47] flex items-center gap-2">
                Our Journal
                <span className="text-[#F7C8D3] text-2xl animate-pulse">✦</span>
              </h2>
            </div>

            {/* ACTION CONTAINER STAMPS */}
            <div className="flex items-center gap-3 relative select-none">
              
              {/* NEW Feature: STARRED ARCHIVE BUTTON STAMP */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                  className={`px-4 py-2 rounded-2xl border text-xs font-mono font-black tracking-wider uppercase flex items-center gap-2 shadow-sm transition-all duration-200 transform active:scale-95 ${
                    isArchiveOpen
                      ? 'bg-[#B46A72] border-[#B46A72] text-[#FFF7E6]'
                      : 'bg-white/70 border-[#F7C8D3] text-[#B46A72] hover:bg-white'
                  }`}
                >
                  <span>★</span> ARCHIVE ({starredDates.length})
                </button>

                {/* ARCHIVE POPUP PANEL (Styled like a cute torn-out index card) */}
                {isArchiveOpen && (
                  <>
                    {/* Invisible click-away overlay backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsArchiveOpen(false)}></div>
                    
                    <div className="absolute right-0 mt-3 w-64 bg-[#FFF7E6] border-2 border-[#F7C8D3] rounded-2xl shadow-[0_15px_35px_rgba(180,106,114,0.25)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between border-b border-[#F7C8D3] pb-2 mb-2">
                        <span className="font-serif font-black text-xs text-[#B46A72] tracking-tight">★ Starred Memories</span>
                        <span className="text-[9px] font-mono font-bold text-[#2D3A47]/40 uppercase">Immune Days</span>
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                        {starredDates.length === 0 ? (
                          <div className="text-center py-6 text-xs italic font-serif text-[#2D3A47]/40">
                            No starred entries found yet! Stamp a day to keep it forever.
                          </div>
                        ) : (
                          starredDates.map((dateStr) => {
                            const dateItem = new Date(dateStr + 'T00:00:00');
                            const formattedItemDate = dateItem.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            const isActiveSelection = dateStr === selectedDate;

                            return (
                              <button
                                key={dateStr}
                                type="button"
                                onClick={() => {
                                  setSelectedDate(dateStr);
                                  setIsArchiveOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium font-serif flex items-center justify-between transition-colors ${
                                  isActiveSelection 
                                    ? 'bg-[#F7C8D3] text-[#B46A72] font-bold' 
                                    : 'hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
                                }`}
                              >
                                <span>{formattedItemDate}</span>
                                <span className="text-[10px] text-[#B46A72]">✦</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Star Sticker Ribbon Switch */}
              <button
                type="button"
                onClick={toggleStar}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 relative group transform hover:scale-110 active:scale-95 ${
                  currentEntry.starred
                    ? 'bg-gradient-to-b from-white to-[#F7C8D3] border-[#F7C8D3] text-yellow-500 drop-shadow-[0_4px_10px_rgba(247,200,211,0.8)]'
                    : 'bg-white/60 border-[#2D3A47]/10 text-[#2D3A47]/20 hover:text-yellow-400 hover:border-yellow-200'
                }`}
              >
                <span className={`text-xl font-sans ${currentEntry.starred ? 'scale-125 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]' : ''}`}>
                  ★
                </span>
                <span className="absolute bottom-[-1.5rem] left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold tracking-wider uppercase opacity-0 group-hover:opacity-60 transition-opacity whitespace-nowrap text-[#2D3A47]">
                  {currentEntry.starred ? 'KEEP' : 'STAR'}
                </span>
              </button>

              {/* Date Box Picker Strip Container */}
              <div 
                onClick={openCalendarDropdown}
                className="relative bg-white/70 border border-[#F7C8D3] rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm hover:bg-white transition-all cursor-pointer"
              >
                <div className="text-right">
                  <span className="block text-[9px] font-mono font-black uppercase text-[#B46A72] tracking-widest leading-none">DATE STAMP</span>
                  <span className="text-sm font-serif font-black text-[#2D3A47] whitespace-nowrap">
                    {localizedDateStr}, <span className="text-[#B46A72]">{localizedDay.substring(0, 3)}</span>
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-[#F7C8D3]/40 flex items-center justify-center text-[#B46A72] text-xs">
                  ▼
                </div>
                <input 
                  ref={dateInputRef}
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => { if (e.target.value) setSelectedDate(e.target.value); }}
                  className="absolute pointer-events-none opacity-0 w-0 h-0 bottom-0 left-0"
                />
              </div>

            </div>
          </header>

          {/* MAIN DIARY GRID CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 flex-1">
            
            {/* CARD 01: WELL */}
            <div className="bg-white/40 border border-[#F7C8D3]/40 p-5 rounded-2xl flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#A8B58A]/5 rounded-bl-full pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-[#A8B58A] text-white text-xs font-mono font-black flex items-center justify-center shadow-sm">
                  01
                </span>
                <h4 className="font-serif font-black text-[15px] text-[#2D3A47] tracking-tight">
                  What did you do well today?
                </h4>
              </div>
              <textarea
                value={currentEntry.well || ''}
                onChange={(e) => updateField('well', e.target.value)}
                placeholder="Write your beautiful highlights here..."
                className="w-full flex-1 min-h-[110px] bg-transparent text-sm font-medium leading-relaxed outline-none resize-none text-[#2D3A47] placeholder-[#2D3A47]/30"
              />
            </div>

            {/* CARD 02: WRONG */}
            <div className="bg-white/40 border border-[#F7C8D3]/40 p-5 rounded-2xl flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#B46A72]/5 rounded-bl-full pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-[#B46A72] text-white text-xs font-mono font-black flex items-center justify-center shadow-sm">
                  02
                </span>
                <h4 className="font-serif font-black text-[15px] text-[#2D3A47] tracking-tight">
                  What did you do wrong today?
                </h4>
              </div>
              <textarea
                value={currentEntry.wrong || ''}
                onChange={(e) => updateField('wrong', e.target.value)}
                placeholder="Note down any struggles or friction areas..."
                className="w-full flex-1 min-h-[110px] bg-transparent text-sm font-medium leading-relaxed outline-none resize-none text-[#2D3A47] placeholder-[#2D3A47]/30"
              />
            </div>

            {/* CARD 03: LEARNED */}
            <div className="bg-white/40 border border-[#F7C8D3]/40 p-5 rounded-2xl flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#A9B7C6]/5 rounded-bl-full pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-[#A9B7C6] text-white text-xs font-mono font-black flex items-center justify-center shadow-sm">
                  03
                </span>
                <h4 className="font-serif font-black text-[15px] text-[#2D3A47] tracking-tight">
                  What did you learn?
                </h4>
              </div>
              <textarea
                value={currentEntry.learned || ''}
                onChange={(e) => updateField('learned', e.target.value)}
                placeholder="Any new thoughts, lessons, or realizations?..."
                className="w-full flex-1 min-h-[110px] bg-transparent text-sm font-medium leading-relaxed outline-none resize-none text-[#2D3A47] placeholder-[#2D3A47]/30"
              />
            </div>

            {/* CARD 04: TOMORROW */}
            <div className="bg-white/40 border border-[#F7C8D3]/40 p-5 rounded-2xl flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#F7C8D3]/10 rounded-bl-full pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-[#F7C8D3] text-[#B46A72] text-xs font-mono font-black flex items-center justify-center shadow-sm">
                  04
                </span>
                <h4 className="font-serif font-black text-[15px] text-[#2D3A47] tracking-tight">
                  What will you do good tomorrow?
                </h4>
              </div>
              <textarea
                value={currentEntry.tomorrow || ''}
                onChange={(e) => updateField('tomorrow', e.target.value)}
                placeholder="Plan minor daily adaptations or warm intentions..."
                className="w-full flex-1 min-h-[110px] bg-transparent text-sm font-medium leading-relaxed outline-none resize-none text-[#2D3A47] placeholder-[#2D3A47]/30"
              />
            </div>

          </div>

          {/* LOWER RETENTION SYSTEM TICKER BANNER */}
          <footer className="mt-8 pt-4 border-t border-[#F7C8D3]/60 relative z-10 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-[9px] font-black tracking-widest text-[#2D3A47]/40">
            <div>★ BINDER REGISTRY SYSTEM PROTOCOLS</div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${currentEntry.starred ? 'bg-[#B46A72] animate-ping' : 'bg-[#A8B58A]'}`}></span>
              {currentEntry.starred ? 'PROTECTED STAMP ACTIVE // EXEMPT FROM ROTATION' : 'TEMPORARY CACHE BUFFER // 7 DAY CYCLING'}
            </div>
          </footer>

        </div>

        {/* METALLIC BINDER RINGS */}
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 flex flex-col gap-14 z-20 select-none pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="w-7 h-4 bg-gradient-to-b from-gray-300 via-white to-gray-400 rounded-full shadow-[2px_4px_6px_rgba(0,0,0,0.15)] border-r border-white"></div>
              <div className="w-7 h-4 bg-gradient-to-b from-gray-300 via-white to-gray-400 rounded-full shadow-[2px_4px_6px_rgba(0,0,0,0.15)] border-r border-white"></div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}