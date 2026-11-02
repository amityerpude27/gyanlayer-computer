// components/mock/Instructions.js — Pre-Test Examination Guidelines & Instructions

// ════════════════════════════════════════════════════════
//  SCREEN 2: Instructions
// ════════════════════════════════════════════════════════
const Instructions = ({test, onBegin, onBack, dk, wm}) => {
  const [ok, setOk] = useState(false);
  const card = dk ? 'bg-slate-800 border-slate-700' : wm ? 'bg-[#faf7ef] border-[#e0d5b0]' : 'bg-white border-slate-200';
  const tm = dk ? 'text-slate-100' : 'text-slate-800';
  const ts = dk ? 'text-slate-400' : 'text-slate-500';
  const rules = [
    `Total Questions: ${test.qs.length} | Duration: ${test.mins} Minutes | Total Marks: ${test.qs.length * test.mark}.`,
    `Each question has 4 options with only one correct answer.`,
    `Marking: +${test.mark} for correct answer, -1/3 (${test.neg}) for incorrect answer (No penalty for unattempted).`,
    `Mark for Review: You can flag questions to revisit them before final submission.`,
    `Auto-Submit: The test automatically submits when the timer reaches 00:00 or when you click Submit.`
  ];
  const legend = [
    [QS.NV,'Not Visited'],
    [QS.NA,'Not Answered'],
    [QS.ANS,'Answered'],
    [QS.MRK,'Marked for Review'],
    [QS.MA,'Marked + Answered'],
  ];

  return (
    <div className={`flex flex-col w-full h-full overflow-hidden pb-16 sm:pb-0 ${dk ? 'bg-slate-950' : 'bg-white'}`}>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 w-full max-w-3xl mx-auto min-h-0">
        
        {/* Header Section (Title & Stats) */}
        <div className="shrink-0">
          <h2 className={`font-black mb-1.5 text-base sm:text-lg ${tm}`}>{test.name}</h2>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className={`font-bold text-xs sm:text-sm px-2.5 py-0.5 rounded-md border ${dk ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>⏱ {test.mins} Min</span>
            <span className={`font-bold text-xs sm:text-sm px-2.5 py-0.5 rounded-md border ${dk ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>📊 Max: {test.qs.length * test.mark} Marks</span>
            <span className="text-xs sm:text-sm text-rose-500 font-bold px-2.5 py-0.5 rounded-md border border-rose-500/20 bg-rose-500/10">❌ -1/3 ({test.neg}) Negative</span>
          </div>
        </div>

        {/* Instructions list */}
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col ${card}`}>
          <p className={`font-black uppercase tracking-wider mb-3 shrink-0 text-xs sm:text-sm ${(dk?'text-violet-400':'text-violet-700')}`}>
            <i className="fa-solid fa-circle-info mr-1.5"></i> GENERAL INSTRUCTIONS
          </p>
          <ol className="flex flex-col gap-2.5 min-h-0">
            {rules.map((r,i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span className={`shrink-0 rounded-full flex items-center justify-center font-black w-5 h-5 text-[11px] mt-0.5 ${(dk?'bg-violet-950/80 text-violet-300 border border-violet-800/60':'bg-violet-100 text-violet-700 border border-violet-200')}`}>{i+1}</span>
                <span className={`font-medium text-xs sm:text-sm leading-relaxed ${(dk?'text-slate-300':'text-slate-600')}`}>{r}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Palette Legend */}
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-xs shrink-0 ${card}`}>
          <p className={`font-black uppercase tracking-wider mb-3 text-xs sm:text-sm ${(dk?'text-slate-400':'text-slate-500')}`}>
            <i className="fa-solid fa-palette mr-1.5"></i> QUESTION PALETTE COLORS
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {legend.map(([s,lbl]) => {
              const pc = palColor(s,dk);
              return (
                <div key={s} className="flex items-center gap-2">
                  <div style={{
                    width: '22px',
                    height: '22px',
                    background: pc.bg, color: pc.fg, border: '1.5px solid '+pc.br,
                    borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '900', flexShrink: 0
                  }}>
                    {s===QS.MA?'✓':'1'}
                  </div>
                  <span className={`font-semibold text-xs sm:text-sm leading-tight ${(dk?'text-slate-300':'text-slate-600')}`}>{lbl}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Footer */}
      <div className={`shrink-0 w-full mt-auto border-t ${dk ? 'border-slate-800 bg-slate-950/90' : 'border-slate-100 bg-white/90'} backdrop-blur-md`}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 sm:p-4">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input type="checkbox" checked={ok} onChange={e=>setOk(e.target.checked)} className="w-4 h-4 accent-violet-600 cursor-pointer rounded border-gray-300"/>
            <span className={`font-semibold transition-colors text-xs sm:text-sm ${ok ? (dk ? 'text-violet-400' : 'text-violet-700') : (dk ? 'text-slate-400' : 'text-slate-600')} group-hover:text-violet-600`}>
              I have read and understood all the instructions.
            </span>
          </label>
          <div className="flex gap-2.5 h-11 w-full sm:w-auto">
            <button onClick={onBack}
              className={`px-5 font-bold rounded-xl border-2 transition-all active:scale-95 text-xs sm:text-sm ${dk?'border-slate-700 text-slate-300 hover:bg-slate-800':'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              ← Back
            </button>
            <button onClick={onBegin} disabled={!ok}
              className={`flex-1 sm:flex-none sm:px-6 font-black rounded-xl transition-all text-xs sm:text-sm ${ok ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500 opacity-60'}`}>
              I am ready to begin →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

if (typeof window !== 'undefined') {
  window.Instructions = Instructions;
}
