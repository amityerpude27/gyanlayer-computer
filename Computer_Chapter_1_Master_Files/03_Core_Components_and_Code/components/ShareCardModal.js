// ================================================================
//  ShareCardModal.js — 1-Click HD Question Card Image & Share Engine
//  ✅ 100% Native HTML5 2D Canvas Engine (0 CDN dependency, 0 CORS issues, 100% offline file:/// safe)
//  ✅ 1-Click Save HD PNG (1080x1080 Crisp Retina Resolution)
//  ✅ 1-Click Native Mobile Share (WhatsApp / Telegram / Instagram)
//  ✅ 1-Click Text Copy with bulletproof clipboard & textarea fallbacks
// ================================================================

const ShareCardModal = ({ isOpen, onClose, item, theme, catMeta }) => {
  if (!isOpen || !item) return null;

  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef(null);

  const isDark = theme === 'dark';
  const cleanTrick = (item.memoryTrick || "").replace(/^(?:💡|🧠|🎯)\s*/, '');
  const catLabel = (catMeta && catMeta.label) || item.category || "Current Affairs";
  const examTag = item.examTag || "EXAM FOCUS";

  // 1-Click Bulletproof Copy Text
  const handleCopyText = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const textToCopy = `🎯 ${examTag} • ${catLabel}\n\n❓ प्रश्न: ${item.question}\n\n✅ सही उत्तर: ${item.answer}\n\n💡 मेमोरी ट्रिक: ${item.memoryTrick || "N/A"}\n\n📲 ज्ञानलेयर ऐप पर पूरी 360° व्याख्या और मॉक टेस्ट लगाएं:\n👉 https://www.gyanlayer.in`;

    let success = false;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2500);
        })
        .catch(() => {
          fallbackCopy(textToCopy);
        });
      return;
    }
    fallbackCopy(textToCopy);
  };

  const fallbackCopy = (text) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const res = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (res) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      }
    } catch (err) {
      console.warn("Copy failed:", err);
    }
  };

  // Helper to wrap text on 2D Canvas
  const wrapCanvasText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let currY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currY);
        line = words[n] + ' ';
        currY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currY);
    return currY + lineHeight;
  };

  // Generate High-Res 1080x1080 2D Canvas Image (100% Native & Instant)
  const generateHDCanvas = () => {
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(0.5, '#0A0F1C');
    bgGrad.addColorStop(1, '#1E1B4B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative Outer Border
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // 3. Header Badges
    // Exam Focus Tag
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.roundRect(60, 60, 220, 50, 12);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`🎯 ${examTag}`, 80, 93);

    // Category Tag
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.beginPath();
    ctx.roundRect(295, 60, 420, 50, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText(`📂 ${catLabel}`, 315, 93);

    // Brand Watermark
    ctx.fillStyle = '#38BDF8';
    ctx.font = '900 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('⚡ GYANLAYER', width - 60, 93);
    ctx.textAlign = 'left';

    // Divider Line
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 140);
    ctx.lineTo(width - 60, 140);
    ctx.stroke();

    // 4. Question Text
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    const qStartY = 200;
    const qEnd = wrapCanvasText(ctx, `Q.${item.id}  ${item.question}`, 60, qStartY, width - 120, 52);

    // 5. Correct Answer Box
    const ansY = Math.max(qEnd + 20, 440);
    ctx.fillStyle = 'rgba(6, 78, 59, 0.7)';
    ctx.beginPath();
    ctx.roundRect(60, ansY, width - 120, 110, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('✓ CORRECT ANSWER (सही उत्तर):', 90, ansY + 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 34px system-ui, -apple-system, sans-serif';
    ctx.fillText(item.answer, 90, ansY + 85);

    // 6. Memory Trick Box
    if (item.memoryTrick) {
      const trickY = ansY + 140;
      ctx.fillStyle = 'rgba(120, 53, 15, 0.4)';
      ctx.beginPath();
      ctx.roundRect(60, trickY, width - 120, 240, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#FBBF24';
      ctx.font = '900 22px system-ui, -apple-system, sans-serif';
      ctx.fillText('💡 SMART MEMORY TRICK (याद रखने की ट्रिक):', 90, trickY + 45);

      ctx.fillStyle = '#FEF3C7';
      ctx.font = '600 28px system-ui, -apple-system, sans-serif';
      wrapCanvasText(ctx, cleanTrick, 90, trickY + 95, width - 180, 42);
    }

    // 7. Footer Branding & Call to Action
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, height - 100);
    ctx.lineTo(width - 60, height - 100);
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('📲 GyanLayer App • 360° Explanation & Mock Tests', 60, height - 50);

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'mono 22px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('www.gyanlayer.in', width - 60, height - 50);
    ctx.textAlign = 'left';

    return canvas;
  };

  // 1-Click Download HD Image
  const handleDownloadImage = () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const canvas = generateHDCanvas();
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `GyanLayer_CurrentAffairs_Q${item.id || 'Card'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error("Error generating image:", err);
      handleCopyText();
    } finally {
      setIsGenerating(false);
    }
  };

  // 1-Click Universal Share (Native Mobile Sheet on Phone / 1-Click WhatsApp on PC)
  const handleNativeShare = () => {
    if (isGenerating) return;
    setIsGenerating(true);

    const shareText = `🎯 ${examTag} • ${catLabel}\n\n❓ प्रश्न: ${item.question}\n\n✅ सही उत्तर: ${item.answer}\n\n💡 मेमोरी ट्रिक: ${cleanTrick}\n\n📲 ज्ञानलेयर ऐप डाउनलोड करें:\n👉 https://www.gyanlayer.in`;

    const openWhatsAppFallback = (text) => {
      handleCopyText();
      const waUrl = "https://api.whatsapp.com/send?text=" + encodeURIComponent(text);
      try {
        window.open(waUrl, "_blank", "noopener,noreferrer");
      } catch (e) {
        window.location.href = waUrl;
      }
    };

    // Layer 1: Mobile Native Share Sheet (Android/iOS)
    if (navigator.share) {
      try {
        const canvas = generateHDCanvas();
        if (canvas.toBlob && navigator.canShare) {
          canvas.toBlob((blob) => {
            let shared = false;
            try {
              if (blob && navigator.canShare({ files: [new File([blob], `GyanLayer_Q${item.id}.png`, { type: 'image/png' })] })) {
                const file = new File([blob], `GyanLayer_CA_Q${item.id}.png`, { type: 'image/png' });
                navigator.share({
                  title: (window.caConfig && window.caConfig.title) || 'GyanLayer Computer Awareness',
                  text: shareText,
                  files: [file]
                }).then(() => {
                  shared = true;
                  setIsGenerating(false);
                }).catch(() => {
                  if (!shared) {
                    navigator.share({
                      title: (window.caConfig && window.caConfig.title) || 'GyanLayer Computer Awareness',
                      text: shareText,
                      url: 'https://www.gyanlayer.in'
                    }).then(() => {
                      shared = true;
                      setIsGenerating(false);
                    }).catch(() => {
                      openWhatsAppFallback(shareText);
                      setIsGenerating(false);
                    });
                  }
                });
                return;
              }
            } catch (err) {}

            if (!shared) {
              navigator.share({
                title: (window.caConfig && window.caConfig.title) || 'GyanLayer Computer Awareness',
                text: shareText,
                url: 'https://www.gyanlayer.in'
              }).then(() => {
                setIsGenerating(false);
              }).catch(() => {
                openWhatsAppFallback(shareText);
                setIsGenerating(false);
              });
            }
          }, 'image/png');
          return;
        }

        navigator.share({
          title: (window.caConfig && window.caConfig.title) || 'GyanLayer Computer Awareness',
          text: shareText,
          url: 'https://www.gyanlayer.in'
        }).then(() => {
          setIsGenerating(false);
        }).catch(() => {
          openWhatsAppFallback(shareText);
          setIsGenerating(false);
        });
        return;
      } catch (e) {
        openWhatsAppFallback(shareText);
      }
    } else {
      // Layer 2: Desktop / Laptop (Open WhatsApp Web + Copy Text)
      openWhatsAppFallback(shareText);
    }
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in-app">
      <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-4 sm:p-5 flex flex-col gap-3 text-slate-100 max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <i className="fa-solid fa-share-nodes text-sm"></i>
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight text-white">Share HD Infographic Card</h3>
              <p className="text-[10px] text-slate-400 font-medium">1-Click Share & Save</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* ── HD Card Preview Container ── */}
        <div 
          ref={cardRef}
          className="w-full rounded-2xl p-4 sm:p-5 border border-slate-700/80 bg-gradient-to-br from-[#0F172A] via-[#0A0F1C] to-[#1E1B4B] shadow-inner relative overflow-hidden shrink-0"
        >
          {/* Card Top Meta Badges */}
          <div className="flex items-center justify-between gap-1.5 mb-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[9px] font-black uppercase tracking-wider">
                🎯 {examTag}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[9px] font-bold truncate max-w-[140px]">
                {catLabel}
              </span>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-[9px] font-black tracking-wider flex items-center gap-1">
              <span>⚡</span> GYANLAYER
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-3">
            <p className="text-xs sm:text-sm font-bold leading-relaxed text-slate-100 text-left">
              <span className="font-black text-violet-400 mr-1.5">Q.{item.id}</span>
              {item.question}
            </p>
          </div>

          {/* Correct Answer Box */}
          <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/60 mb-2.5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <i className="fa-solid fa-circle-check"></i> सही उत्तर:
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-200">
              {item.answer}
            </span>
          </div>

          {/* Memory Trick Box */}
          {item.memoryTrick && (
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-950/60 via-yellow-950/40 to-orange-950/60 border border-amber-500/60 mb-2.5">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
                <span>💡 MEMORY TRICK</span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-amber-200">{cleanTrick}</p>
            </div>
          )}

          {/* Card Watermark Footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1 text-cyan-400">
              <i className="fa-solid fa-mobile-screen"></i> GyanLayer App
            </span>
            <span className="font-mono text-slate-400">www.gyanlayer.in</span>
          </div>
        </div>

        {/* ── Modal Action Buttons ── */}
        <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2 shrink-0">
          
          {/* Share Button */}
          <button
            onClick={handleNativeShare}
            disabled={isGenerating}
            className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <i className="fa-solid fa-share text-xs"></i>
            <span>{isGenerating ? 'Sharing...' : 'Share'}</span>
          </button>

          {/* Save Image Button */}
          <button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[11px] font-black flex items-center justify-center gap-1.5 shadow-md shadow-violet-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <i className={`fa-solid ${downloadSuccess ? 'fa-check text-emerald-300' : 'fa-download'} text-xs`}></i>
            <span>{downloadSuccess ? 'Saved!' : 'Save Image'}</span>
          </button>

          {/* Copy Text Button */}
          <button
            onClick={handleCopyText}
            className={`py-2.5 px-2 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
              copySuccess 
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <i className={`fa-solid ${copySuccess ? 'fa-check text-emerald-400' : 'fa-copy'} text-xs`}></i>
            <span>{copySuccess ? 'Copied!' : 'Copy Text'}</span>
          </button>

        </div>
      </div>
    </div>
  );
};

window.ShareCardModal = ShareCardModal;
