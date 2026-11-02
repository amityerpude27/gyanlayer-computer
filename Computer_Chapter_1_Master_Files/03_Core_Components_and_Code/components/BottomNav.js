// ================================================================
//  BottomNav.js — Mobile Bottom Navigation
//
//  ✅ EDIT THIS FILE FOR: Bottom nav appearance, tab icons
//  ✅ Fixed bottom, only visible on mobile (sm: hidden)
//  ✅ Safe area padding for iOS home bar + Android nav bar
//  ✅ Active indicator line at top of active tab
//  ✅ Solid background (no blur/bleed-through) so cards hide underneath cleanly
//  ❌ NO Eye Shield icon here
//  ❌ DO NOT add content rendering here
// ================================================================

const BottomNav = ({ tabs, activeTab, setActiveTab, theme, mistakeCount, isTestActive }) => {
  if (isTestActive) return null;

  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';

  // 100% Solid background color (no transparency / no blur) to cover content behind it
  const navBg = isDark
    ? 'bg-slate-950 border-slate-800'
    : isWarm
    ? 'bg-[#faf8f2] border-[#e8dcb5]'
    : 'bg-white border-slate-200';

  return (
    <nav
      className={`sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t bottom-nav-safe ${navBg}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch h-14">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          
          // Icon active color styling matching desktop
          const iconActiveCls = isActive && !isDark && !isWarm
            ? 'bg-gradient-to-tr from-violet-500 to-pink-500 text-transparent bg-clip-text'
            : isActive && isDark
            ? 'text-amber-400'
            : isActive && isWarm
            ? 'text-amber-800'
            : isDark
            ? 'text-slate-500'
            : 'text-slate-400';

          // Label text active color
          const labelCls = isActive
            ? isDark
              ? 'text-amber-400 font-bold'
              : isWarm
              ? 'text-[#b45309] font-bold' // Amber-700
              : 'text-pink-600 font-bold'    // Pink active color matching the gradient
            : isDark
            ? 'text-slate-500'
            : 'text-slate-400';

          // Top active indicator line
          const indicatorBg = isDark
            ? 'bg-amber-400'
            : isWarm
            ? 'bg-[#b45309]'
            : 'bg-gradient-to-r from-violet-500 to-pink-500';

          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
              className="flex-1 relative flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95"
            >
              {/* Active indicator — top line */}
              {isActive && (
                <span className={`absolute top-0 left-3 right-3 h-0.5 rounded-full ${indicatorBg}`} />
              )}

              {/* Icon */}
              <i className={`fa-solid ${tab.icon} text-[15px] transition-transform ${isActive ? 'scale-110' : ''} ${iconActiveCls}`}></i>

              {/* Label */}
              <span className={`text-[10px] font-semibold leading-none ${labelCls}`}>
                {tab.mLabel}
              </span>

              {/* Mistake count badge */}
              {tab.id === 'mistakes' && mistakeCount > 0 && (
                <span className="absolute top-1 right-[18%] bg-rose-500 text-white text-[9px] font-black rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                  {mistakeCount > 9 ? '9+' : mistakeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
