// ================================================================
//  EyeCareModal.js — Theme & Blue Light Filter Control
// ================================================================

const EyeCareModal = ({ isOpen, onClose, currentTheme, setTheme, blueLight, setBlueLight }) => {
  if (!isOpen) return null;

  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-2 pb-16 sm:p-4 backdrop-blur-xs transition-opacity duration-300">
      <div 
        className={`w-full sm:max-w-md overflow-y-auto rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 shadow-2xl border animate-in slide-in-from-bottom duration-300
        ${currentTheme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-[#faf8f2] border-[#ebdcb9] text-[#4a3b32]'}`}
        style={{ maxHeight: viewportHeight ? `${viewportHeight * 0.85}px` : '85vh' }}
      >
        
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-500/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <div>
              <h3 className="font-extrabold text-base">Eye Protection</h3>
              <p className="text-[10px] opacity-75">Make reading comfortable day & night</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center hover:bg-slate-500/20">
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="mb-6">
          <label className="text-xs font-bold block mb-2 opacity-80">1. Screen Mode:</label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setTheme('light')}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all
                ${currentTheme === 'light' 
                  ? 'bg-white border-indigo-500 text-indigo-600 shadow-sm scale-[1.02]' 
                  : 'bg-white border-slate-200 text-slate-600'}`}
            >
              <i className="fa-solid fa-sun text-lg text-amber-500"></i>
              <span>Day Mode</span>
            </button>
            
            <button 
              onClick={() => setTheme('warm')}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all
                ${currentTheme === 'warm' 
                  ? 'bg-[#fcf8ee] border-amber-600 text-amber-800 shadow-sm scale-[1.02]' 
                  : 'bg-white/50 border-slate-300/60 text-slate-600'}`}
            >
              <i className="fa-solid fa-book-open text-lg text-yellow-600"></i>
              <span>Paper Mode</span>
            </button>

            <button 
              onClick={() => setTheme('dark')}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all
                ${currentTheme === 'dark' 
                  ? 'bg-slate-950 border-amber-500 text-amber-400 shadow-sm scale-[1.02]' 
                  : 'bg-slate-800 border-slate-700 text-slate-300'}`}
            >
              <i className="fa-solid fa-moon text-lg text-purple-400"></i>
              <span>Night Mode</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold opacity-80">2. Blue Light Shield:</label>
            <span className="text-xs font-extrabold text-amber-500">{blueLight}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="70" 
            value={blueLight}
            onChange={(e) => setBlueLight(Number(e.target.value))}
            className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-[9px] opacity-70 block mt-1"><i className="fa-solid fa-circle-info mr-1"></i> Amber tint blocks harmful blue light.</span>
        </div>

        <div className="p-3.5 rounded-xl text-xs bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div>
            <span className="font-bold">Student Eye Care Tip:</span>
            <p className="mt-0.5 opacity-90 leading-relaxed">After studying for every 20 minutes, look at an object 20 feet away for 20 seconds.</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-5 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all text-xs"
        >
          Apply & Close
        </button>
      </div>
    </div>
  );
};
