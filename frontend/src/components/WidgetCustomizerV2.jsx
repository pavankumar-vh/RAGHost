import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Copy, Check, Palette, Layout, Type, Sparkles,
  Eye, Code2, Download, RotateCcw, Maximize2, Minimize2,
  Monitor, Tablet, Smartphone, Sun, Moon, ChevronDown,
  ChevronRight, Sliders, MessageSquare, Zap, Shield, Globe,
  PaintBucket, LayoutDashboard, Settings2, Play, Layers,
} from 'lucide-react';

/* ─── defaults ────────────────────────────────────────────────────── */
const DEFAULT_CONFIG = {
  // Theme preset
  theme: 'custom',

  // Colors
  primaryColor: '#6750A4',
  secondaryColor: '#9C7AEB',
  accentColor: '#FFE500',
  backgroundColor: '#ffffff',
  textColor: '#111111',
  userBubbleColor: '#6750A4',
  botBubbleColor: '#F3F0FF',
  headerTextColor: '#ffffff',
  inputBorderColor: '#cccccc',
  sendButtonColor: '#6750A4',

  // Layout
  width: 380,
  height: 580,
  position: 'bottom-right',
  offsetX: 20,
  offsetY: 20,
  zIndex: 9999,

  // Button
  buttonSize: 60,
  buttonStyle: 'circle',
  buttonIcon: 'chat',
  buttonLabel: '',
  showButtonLabel: false,

  // Chat window
  borderRadius: 16,
  headerStyle: 'gradient',    // gradient | solid | minimal
  showAvatar: true,
  avatarEmoji: '🤖',
  showOnlineStatus: true,
  showTypingIndicator: true,
  showTimestamps: false,
  showWatermark: true,
  messageBubbleStyle: 'rounded', // rounded | sharp | pill

  // Typography
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,

  // Content
  welcomeMessage: 'Hi! How can I help you today? 👋',
  botName: '',
  placeholder: 'Type your message...',
  suggestedReplies: ['Tell me more', 'Get started', 'Contact support'],
  showSuggestedReplies: true,

  // Animation
  openAnimation: 'slide-up',  // slide-up | fade | zoom | bounce
  animationSpeed: 'normal',

  // Advanced
  showShadow: true,
  shadowIntensity: 'medium',
  showBorder: false,
  borderColor: '#e5e7eb',
  backdropBlur: false,
  compactMode: false,
};

/* ─── theme presets ───────────────────────────────────────────────── */
const THEME_PRESETS = {
  'material-purple': {
    label: 'Material Purple', emoji: '🟣',
    primaryColor: '#6750A4', secondaryColor: '#9C7AEB', accentColor: '#FFE500',
    backgroundColor: '#ffffff', botBubbleColor: '#F3F0FF', userBubbleColor: '#6750A4',
    headerTextColor: '#ffffff', headerStyle: 'gradient', buttonStyle: 'circle',
  },
  'neo-brutalism': {
    label: 'Neo-Brutalism', emoji: '⬛',
    primaryColor: '#000000', secondaryColor: '#333333', accentColor: '#FFE500',
    backgroundColor: '#FFFEF0', botBubbleColor: '#f5f5f5', userBubbleColor: '#000000',
    headerTextColor: '#FFE500', headerStyle: 'solid', buttonStyle: 'square',
    borderRadius: 0, showBorder: true, borderColor: '#000000',
  },
  'ocean-blue': {
    label: 'Ocean Blue', emoji: '🌊',
    primaryColor: '#0078D4', secondaryColor: '#00BCF2', accentColor: '#00CC6A',
    backgroundColor: '#F0F6FF', botBubbleColor: '#E3F2FD', userBubbleColor: '#0078D4',
    headerTextColor: '#ffffff', headerStyle: 'gradient', buttonStyle: 'circle',
  },
  'forest-green': {
    label: 'Forest Green', emoji: '🌿',
    primaryColor: '#2D6A4F', secondaryColor: '#52B788', accentColor: '#D8F3DC',
    backgroundColor: '#F7FBF8', botBubbleColor: '#D8F3DC', userBubbleColor: '#2D6A4F',
    headerTextColor: '#ffffff', headerStyle: 'gradient', buttonStyle: 'rounded-square',
  },
  'dark-saas': {
    label: 'Dark SaaS', emoji: '🌑',
    primaryColor: '#7C3AED', secondaryColor: '#EC4899', accentColor: '#06B6D4',
    backgroundColor: '#0F0F1A', botBubbleColor: '#1E1E2E', userBubbleColor: '#7C3AED',
    textColor: '#E2E8F0', headerTextColor: '#ffffff', headerStyle: 'gradient',
    buttonStyle: 'circle',
  },
  'minimal-white': {
    label: 'Minimal White', emoji: '⬜',
    primaryColor: '#111111', secondaryColor: '#444444', accentColor: '#111111',
    backgroundColor: '#ffffff', botBubbleColor: '#F5F5F5', userBubbleColor: '#111111',
    headerTextColor: '#ffffff', headerStyle: 'solid', buttonStyle: 'circle',
    borderRadius: 8,
  },
  'rose-gold': {
    label: 'Rose Gold', emoji: '🌸',
    primaryColor: '#B5536A', secondaryColor: '#FABAC5', accentColor: '#FFE8ED',
    backgroundColor: '#FFF9FB', botBubbleColor: '#FFE8ED', userBubbleColor: '#B5536A',
    headerTextColor: '#ffffff', headerStyle: 'gradient', buttonStyle: 'circle',
  },
  'corporate': {
    label: 'Corporate', emoji: '🏢',
    primaryColor: '#003087', secondaryColor: '#0050C8', accentColor: '#E8EDFF',
    backgroundColor: '#F8F9FA', botBubbleColor: '#E8EDFF', userBubbleColor: '#003087',
    headerTextColor: '#ffffff', headerStyle: 'solid', buttonStyle: 'rounded-square',
    borderRadius: 6,
  },
};

/* ─── helpers ─────────────────────────────────────────────────────── */
const hex2rgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};
const hexAlpha = (hex, a) => {
  const { r, g, b } = hex2rgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

/* ─── sub-components ─────────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, label, open, onToggle }) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center justify-between py-2.5 px-3 border-2 border-black bg-nb-bg font-bold text-sm hover:bg-nb-yellow/40 transition-colors"
  >
    <span className="flex items-center gap-2">
      <Icon size={14} />
      {label}
    </span>
    {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
  </button>
);

const ColorRow = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-3">
    <label className="text-xs text-nb-muted font-medium flex-1 truncate">{label}</label>
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 border-2 border-black cursor-pointer"
        style={{ padding: 0 }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => /^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) && onChange(e.target.value)}
        className="w-20 h-8 border-2 border-black px-1.5 font-mono text-xs"
      />
    </div>
  </div>
);

const SliderRow = ({ label, value, min, max, unit = 'px', onChange }) => (
  <div>
    <div className="flex justify-between mb-1">
      <label className="text-xs font-medium text-nb-muted">{label}</label>
      <span className="text-xs font-bold">{value}{unit}</span>
    </div>
    <input
      type="range" min={min} max={max} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-black h-1.5"
    />
  </div>
);

const ToggleRow = ({ label, value, onChange, description }) => (
  <div className="flex items-center justify-between gap-3">
    <div>
      <div className="text-xs font-medium">{label}</div>
      {description && <div className="text-xs text-nb-muted">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 border-2 border-black transition-colors flex-shrink-0 ${
        value ? 'bg-black' : 'bg-white'
      }`}
    >
      <span
        className={`absolute top-0.5 w-3 h-3 bg-nb-yellow border border-black transition-all ${
          value ? 'left-5' : 'left-0.5'
        }`}
      />
    </button>
  </div>
);

const ChipGroup = ({ options, value, onChange, color = 'yellow' }) => {
  const colors = {
    yellow: 'bg-nb-yellow',
    pink: 'bg-nb-pink',
    blue: 'bg-nb-blue',
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 border-2 border-black text-xs font-bold transition-all ${
            value === o.value
              ? `${colors[color]} shadow-[1px_1px_0_0_#000]`
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                     */
/* ═══════════════════════════════════════════════════════════════════ */
const WidgetCustomizerV2 = ({ bot, onClose }) => {
  const [config, setConfig] = useState(() => ({
    ...DEFAULT_CONFIG,
    welcomeMessage: bot?.welcomeMessage || DEFAULT_CONFIG.welcomeMessage,
    botName: bot?.name || '',
  }));
  const [openSections, setOpenSections] = useState({
    themes: true, colors: true, layout: false, button: false,
    content: false, typography: false, animation: false, advanced: false,
  });
  const [activeTab, setActiveTab] = useState('design'); // design | code | export
  const [viewMode, setViewMode] = useState('desktop'); // desktop | tablet | mobile
  const [darkBg, setDarkBg] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [copied, setCopied] = useState('');
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [history, setHistory] = useState([DEFAULT_CONFIG]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const iframeRef = useRef(null);
  const updateTimer = useRef(null);

  const set = useCallback((patch) => {
    setConfig((prev) => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      setHistory((h) => {
        const trimmed = h.slice(0, historyIdx + 1);
        const last = [...trimmed, next];
        if (last.length > 30) last.shift();
        setHistoryIdx(last.length - 1);
        return last;
      });
      return next;
    });
  }, [historyIdx]);

  const undo = () => {
    if (historyIdx > 0) {
      const idx = historyIdx - 1;
      setHistoryIdx(idx);
      setConfig(history[idx]);
    }
  };

  const applyTheme = (themeKey) => {
    const preset = THEME_PRESETS[themeKey];
    if (preset) set({ ...config, ...preset, theme: themeKey });
  };

  const resetConfig = () => {
    const fresh = { ...DEFAULT_CONFIG, welcomeMessage: bot?.welcomeMessage || DEFAULT_CONFIG.welcomeMessage, botName: bot?.name || '' };
    setConfig(fresh);
    setHistory([fresh]);
    setHistoryIdx(0);
  };

  const toggleSection = (key) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  /* ── preview HTML generator ── */
  const generatePreviewHTML = useCallback(() => {
    const animMs = { slow: 500, normal: 300, fast: 150 }[config.animationSpeed];
    const btnRadius = { circle: '50%', 'rounded-square': '14px', square: '4px' }[config.buttonStyle];
    const bubbleRadius = { rounded: '16px', sharp: '4px', pill: '24px' }[config.messageBubbleStyle];

    const posMap = {
      'bottom-right': `bottom:${config.offsetY}px;right:${config.offsetX}px;`,
      'bottom-left': `bottom:${config.offsetY}px;left:${config.offsetX}px;`,
      'bottom-center': `bottom:${config.offsetY}px;left:50%;transform:translateX(-50%);`,
      'top-right': `top:${config.offsetY}px;right:${config.offsetX}px;`,
      'top-left': `top:${config.offsetY}px;left:${config.offsetX}px;`,
    };
    const pos = posMap[config.position] || posMap['bottom-right'];

    const headerBg = config.headerStyle === 'gradient'
      ? `background:linear-gradient(135deg,${config.primaryColor},${config.secondaryColor});`
      : config.headerStyle === 'solid'
        ? `background:${config.primaryColor};`
        : `background:${config.backgroundColor};border-bottom:2px solid ${hexAlpha(config.primaryColor, 0.15)};`;

    const shadow = config.showShadow ? {
      light: '0 4px 20px rgba(0,0,0,0.1)',
      medium: '0 8px 40px rgba(0,0,0,0.18)',
      strong: '0 16px 64px rgba(0,0,0,0.28)',
    }[config.shadowIntensity] : 'none';

    const openAnim = {
      'slide-up': `@keyframes openAnim{from{opacity:0;transform:translateY(24px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}`,
      'fade': `@keyframes openAnim{from{opacity:0}to{opacity:1}}`,
      'zoom': `@keyframes openAnim{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}`,
      'bounce': `@keyframes openAnim{0%{opacity:0;transform:scale(0.7)}70%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}`,
    }[config.openAnimation];

    const suggestHtml = config.showSuggestedReplies && config.suggestedReplies?.length
      ? `<div style="display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 12px;">
          ${config.suggestedReplies.map(s =>
            `<button style="background:transparent;border:1.5px solid ${config.primaryColor};color:${config.primaryColor};border-radius:${bubbleRadius};padding:5px 12px;font-size:12px;font-family:inherit;cursor:pointer;">${s}</button>`
          ).join('')}
        </div>`
      : '';

    const btnIconSvg = {
      chat: `<svg viewBox="0 0 24 24" fill="currentColor" width="${config.buttonSize * 0.45}" height="${config.buttonSize * 0.45}"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/><circle cx="9" cy="12" r="1" fill="white"/><circle cx="12" cy="12" r="1" fill="white"/><circle cx="15" cy="12" r="1" fill="white"/></svg>`,
      sparkle: `<svg viewBox="0 0 24 24" fill="currentColor" width="${config.buttonSize * 0.45}" height="${config.buttonSize * 0.45}"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg>`,
      bot: `<svg viewBox="0 0 24 24" fill="currentColor" width="${config.buttonSize * 0.45}" height="${config.buttonSize * 0.45}"><rect x="3" y="8" width="18" height="12" rx="3"/><circle cx="9" cy="14" r="1.5"/><circle cx="15" cy="14" r="1.5"/><path d="M12 2v4M9 8l-2-2M15 8l2-2" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`,
    }[config.buttonIcon] || '';

    return `<!DOCTYPE html><html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:${config.fontFamily};font-size:${config.fontSize}px;background:${darkBg?'#1a1a2e':'#f0f0f0'};height:100vh;transition:background .3s;}
.bg-label{position:fixed;top:10px;left:50%;transform:translateX(-50%);font-size:11px;color:${darkBg?'#666':'#999'};font-family:system-ui;}
.raghost-widget{position:fixed;${pos}z-index:${config.zIndex};}
.raghost-btn{width:${config.buttonSize}px;height:${config.buttonSize}px;background:linear-gradient(135deg,${config.primaryColor},${config.secondaryColor});border:none;border-radius:${btnRadius};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:${config.showShadow?shadow:'none'};transition:transform ${animMs}ms,box-shadow ${animMs}ms;color:#fff;${config.showBorder?`outline:2px solid ${config.borderColor};outline-offset:2px;`:''}}
.raghost-btn:hover{transform:scale(1.08);}
.raghost-btn-label{font-size:13px;font-weight:600;white-space:nowrap;font-family:${config.fontFamily};}
.raghost-window{position:absolute;${config.position.includes('right')||config.position==='bottom-center'?'right:0;':'left:0;'}${config.position.includes('top')?`top:${config.buttonSize+10}px;`:`bottom:${config.buttonSize+10}px;`}width:${config.width}px;height:${config.height}px;background:${config.backgroundColor};border-radius:${config.borderRadius}px;box-shadow:${shadow};overflow:hidden;display:none;flex-direction:column;${config.backdropBlur?'backdrop-filter:blur(20px);':''} ${config.showBorder?`border:1.5px solid ${config.borderColor};`:''}}
.raghost-window.open{display:flex;animation:openAnim ${animMs}ms ease forwards;}
${openAnim}
.raghost-header{${headerBg}padding:${config.compactMode?'10px 14px':'14px 16px'};display:flex;align-items:center;justify-content:space-between;color:${config.headerStyle==='minimal'?config.textColor:config.headerTextColor};}
.raghost-hinfo{display:flex;align-items:center;gap:10px;}
.raghost-avatar{width:${config.compactMode?30:38}px;height:${config.compactMode?30:38}px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:${config.compactMode?16:20}px;}
.raghost-name{font-weight:700;font-size:${config.compactMode?13:15}px;}
.raghost-status{font-size:11px;opacity:.75;display:flex;align-items:center;gap:4px;}
.raghost-status::before{content:'';width:6px;height:6px;border-radius:50%;background:#4ade80;display:${config.showOnlineStatus?'block':'none'};}
.raghost-close{width:30px;height:30px;border:1.5px solid rgba(255,255,255,0.35);border-radius:6px;background:rgba(255,255,255,0.18);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform ${animMs}ms;}
.raghost-close:hover{transform:rotate(90deg);}
.raghost-messages{flex:1;padding:${config.compactMode?'10px':'16px'};overflow-y:auto;display:flex;flex-direction:column;gap:${config.compactMode?'8px':'12px'};}
.msg{display:flex;gap:8px;}
.msg.bot{align-self:flex-start;}
.msg.user{align-self:flex-end;flex-direction:row-reverse;}
.bubble{max-width:75%;padding:${config.compactMode?'7px 11px':'10px 14px'};line-height:1.45;}
.msg.bot .bubble{background:${config.botBubbleColor};color:${config.textColor};border-radius:${bubbleRadius};border-bottom-left-radius:4px;}
.msg.user .bubble{background:${config.userBubbleColor};color:#fff;border-radius:${bubbleRadius};border-bottom-right-radius:4px;}
.ts{font-size:10px;opacity:.4;margin-top:3px;display:${config.showTimestamps?'block':'none'};}
.typing{display:flex;align-items:center;gap:4px;padding:10px 14px;background:${config.botBubbleColor};border-radius:${bubbleRadius};border-bottom-left-radius:4px;width:fit-content;}
.dot{width:6px;height:6px;border-radius:50%;background:${config.primaryColor};animation:typing 1.2s infinite;}
.dot:nth-child(2){animation-delay:.2s;}
.dot:nth-child(3){animation-delay:.4s;}
@keyframes typing{0%,80%,100%{transform:scale(0.7);opacity:.4}40%{transform:scale(1);opacity:1}}
.raghost-input-area{padding:${config.compactMode?'8px 12px':'12px 16px'};border-top:1px solid ${hexAlpha(config.inputBorderColor, 0.4)};display:flex;gap:8px;align-items:flex-end;}
.raghost-input{flex:1;padding:9px 12px;border:1.5px solid ${config.inputBorderColor};border-radius:${Math.min(config.borderRadius, 12)}px;font-family:inherit;font-size:${config.fontSize}px;resize:none;outline:none;background:${config.backgroundColor};color:${config.textColor};transition:border-color ${animMs}ms;}
.raghost-input:focus{border-color:${config.primaryColor};}
.raghost-send{width:38px;height:38px;border:none;border-radius:${Math.min(config.borderRadius,10)}px;background:${config.sendButtonColor};color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform ${animMs}ms,filter ${animMs}ms;flex-shrink:0;}
.raghost-send:hover{transform:scale(1.08);filter:brightness(1.1);}
.raghost-wm{padding:6px 16px;text-align:center;font-size:10px;color:#aaa;border-top:1px solid ${hexAlpha(config.inputBorderColor,0.2)};display:${config.showWatermark?'flex':'none'};align-items:center;justify-content:center;gap:4px;}
.raghost-wm a{color:${config.primaryColor};text-decoration:none;font-weight:700;}
</style>
</head>
<body>
<div class="bg-label">${darkBg?'Dark background':'Light background'} — preview mode</div>
<div class="raghost-widget">
  <button class="raghost-btn" onclick="toggleChat()" id="mainBtn">
    ${btnIconSvg}
    ${config.showButtonLabel && config.buttonLabel ? `<span class="raghost-btn-label">${config.buttonLabel}</span>` : ''}
  </button>
  <div class="raghost-window open" id="chatWindow">
    <div class="raghost-header">
      <div class="raghost-hinfo">
        ${config.showAvatar ? `<div class="raghost-avatar">${config.avatarEmoji}</div>` : ''}
        <div>
          <div class="raghost-name">${config.botName || bot?.name || 'AI Assistant'}</div>
          <div class="raghost-status">Online • Ready to help</div>
        </div>
      </div>
      <button class="raghost-close" onclick="toggleChat()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="raghost-messages" id="msgs">
      <div class="msg bot">
        <div>
          <div class="bubble">${config.welcomeMessage}</div>
          <div class="ts">Now</div>
        </div>
      </div>
      ${config.showTypingIndicator ? `
      <div class="msg bot" id="typing">
        <div class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      </div>` : ''}
    </div>
    ${suggestHtml}
    <div class="raghost-input-area">
      <textarea class="raghost-input" rows="1" placeholder="${config.placeholder}" id="inp" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMsg();}"></textarea>
      <button class="raghost-send" onclick="sendMsg()">
        <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
      </button>
    </div>
    <div class="raghost-wm">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="${config.primaryColor}"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg>
      Powered by <a href="https://rag-host.vercel.app" target="_blank">RAGhost</a>
    </div>
  </div>
</div>
<script>
let open=true;
function toggleChat(){open=!open;document.getElementById('chatWindow').classList.toggle('open',open);}
function sendMsg(){
  const inp=document.getElementById('inp');
  const val=inp.value.trim();if(!val)return;
  const msgs=document.getElementById('msgs');
  const now=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const userDiv=document.createElement('div');userDiv.className='msg user';
  userDiv.innerHTML='<div><div class="bubble">'+val+'</div><div class="ts">'+now+'</div></div>';
  const typing=document.getElementById('typing');
  if(typing)msgs.insertBefore(userDiv,typing);else msgs.appendChild(userDiv);
  inp.value='';msgs.scrollTop=msgs.scrollHeight;
  setTimeout(()=>{
    const botDiv=document.createElement('div');botDiv.className='msg bot';
    botDiv.innerHTML='<div><div class="bubble">Thanks for your message! This is a preview response.</div><div class="ts">'+now+'</div></div>';
    if(typing)msgs.insertBefore(botDiv,typing);else msgs.appendChild(botDiv);
    msgs.scrollTop=msgs.scrollHeight;
  },800);
}
</script>
</body></html>`;
  }, [config, darkBg, bot]);

  /* ── refresh iframe ── */
  useEffect(() => {
    clearTimeout(updateTimer.current);
    updateTimer.current = setTimeout(() => {
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        doc.open(); doc.write(generatePreviewHTML()); doc.close();
      }
    }, 80);
    return () => clearTimeout(updateTimer.current);
  }, [generatePreviewHTML]);

  /* ── embed code ── */
  const embedCode = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://raghost-pcgw.onrender.com';
    const widgetUrl = 'https://rag-host.vercel.app';
    return `<!-- RAGhost Widget v2 —— ${config.botName || bot?.name || 'AI Assistant'} -->
<script>
  window.RAGhostConfig = {
    botId: '${bot?.id || 'YOUR_BOT_ID'}',
    apiUrl: '${apiUrl}',
    botName: '${config.botName || bot?.name || 'AI Assistant'}',

    // Appearance
    primaryColor: '${config.primaryColor}',
    secondaryColor: '${config.secondaryColor}',
    backgroundColor: '${config.backgroundColor}',
    textColor: '${config.textColor}',
    headerStyle: '${config.headerStyle}',
    borderRadius: ${config.borderRadius},
    fontFamily: '${config.fontFamily}',
    fontSize: ${config.fontSize},
    messageBubbleStyle: '${config.messageBubbleStyle}',

    // Button
    position: '${config.position}',
    offsetX: ${config.offsetX},
    offsetY: ${config.offsetY},
    buttonSize: ${config.buttonSize},
    buttonStyle: '${config.buttonStyle}',
    buttonIcon: '${config.buttonIcon}',

    // Window
    width: ${config.width},
    height: ${config.height},
    showAvatar: ${config.showAvatar},
    avatarEmoji: '${config.avatarEmoji}',
    showOnlineStatus: ${config.showOnlineStatus},
    showTypingIndicator: ${config.showTypingIndicator},
    showTimestamps: ${config.showTimestamps},
    showSuggestedReplies: ${config.showSuggestedReplies},
    suggestedReplies: ${JSON.stringify(config.suggestedReplies)},
    showWatermark: ${config.showWatermark},

    // Content
    welcomeMessage: '${config.welcomeMessage.replace(/'/g, "\\'")}',
    placeholder: '${config.placeholder}',

    // Animation
    openAnimation: '${config.openAnimation}',
    animationSpeed: '${config.animationSpeed}',

    // Advanced
    showShadow: ${config.showShadow},
    compactMode: ${config.compactMode},
    zIndex: ${config.zIndex},
  };
<\/script>
<script src="${widgetUrl}/widget/widget-new.js" async defer><\/script>`;
  };

  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const downloadConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `raghost-widget-config-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── viewport widths ── */
  const previewWidth = { desktop: '100%', tablet: '768px', mobile: '375px' };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
      <div className="bg-nb-bg border-2 border-black shadow-[6px_6px_0_0_#000] w-full max-w-[1300px] max-h-[96vh] overflow-hidden flex flex-col">

        {/* ── TOP BAR ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-black bg-nb-yellow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-nb-yellow flex items-center justify-center font-black text-lg">2</div>
            <div>
              <h2 className="font-black text-base leading-tight">Widget Customizer v2</h2>
              <p className="text-xs text-black/60 leading-none">Live preview • {Object.keys(THEME_PRESETS).length} theme presets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={undo} disabled={historyIdx === 0}
              title="Undo"
              className="nb-btn p-2 bg-white border-black disabled:opacity-30 disabled:cursor-not-allowed">
              <RotateCcw size={14} />
            </button>
            <button onClick={resetConfig} title="Reset to defaults"
              className="nb-btn px-3 py-1.5 bg-white border-black text-xs font-bold">
              Reset
            </button>
            <button onClick={onClose} className="nb-btn p-2 bg-black text-white border-black">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ══ LEFT PANEL ══ */}
          <div className="w-[300px] flex-shrink-0 border-r-2 border-black overflow-y-auto bg-white">

            {/* Tab nav */}
            <div className="flex border-b-2 border-black">
              {[
                { id: 'design', icon: Palette, label: 'Design' },
                { id: 'content', icon: MessageSquare, label: 'Content' },
                { id: 'advanced', icon: Settings2, label: 'Advanced' },
              ].map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-r last:border-r-0 border-black transition-colors ${
                    activeTab === id ? 'bg-nb-yellow' : 'bg-white hover:bg-gray-50'
                  }`}>
                  <Icon size={13} />{label}
                </button>
              ))}
            </div>

            <div className="p-3 space-y-2">

              {/* ─── DESIGN TAB ─── */}
              {activeTab === 'design' && <>

                {/* Theme Presets */}
                <SectionHeader icon={Sparkles} label="Theme Presets" open={openSections.themes} onToggle={() => toggleSection('themes')} />
                {openSections.themes && (
                  <div className="grid grid-cols-2 gap-1.5 px-1 pb-2">
                    {Object.entries(THEME_PRESETS).map(([key, t]) => (
                      <button key={key} onClick={() => applyTheme(key)}
                        className={`flex items-center gap-2 px-2.5 py-2 border-2 text-left text-xs font-bold transition-all ${
                          config.theme === key
                            ? 'border-black bg-nb-yellow shadow-[2px_2px_0_0_#000]'
                            : 'border-black bg-white hover:bg-gray-50'
                        }`}>
                        <span className="text-base leading-none">{t.emoji}</span>
                        <span className="leading-tight">{t.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Colors */}
                <SectionHeader icon={PaintBucket} label="Colors" open={openSections.colors} onToggle={() => toggleSection('colors')} />
                {openSections.colors && (
                  <div className="space-y-2 px-1 pb-2">
                    {[
                      { label: 'Primary', key: 'primaryColor' },
                      { label: 'Secondary', key: 'secondaryColor' },
                      { label: 'Accent', key: 'accentColor' },
                      { label: 'Chat Background', key: 'backgroundColor' },
                      { label: 'Text Color', key: 'textColor' },
                      { label: 'Bot Bubble', key: 'botBubbleColor' },
                      { label: 'User Bubble', key: 'userBubbleColor' },
                      { label: 'Header Text', key: 'headerTextColor' },
                      { label: 'Send Button', key: 'sendButtonColor' },
                    ].map(({ label, key }) => (
                      <ColorRow key={key} label={label} value={config[key]}
                        onChange={(v) => set({ [key]: v, theme: 'custom' })} />
                    ))}
                  </div>
                )}

                {/* Layout */}
                <SectionHeader icon={LayoutDashboard} label="Window Layout" open={openSections.layout} onToggle={() => toggleSection('layout')} />
                {openSections.layout && (
                  <div className="space-y-3 px-1 pb-2">
                    <SliderRow label="Width" value={config.width} min={300} max={500} onChange={(v) => set({ width: v })} />
                    <SliderRow label="Height" value={config.height} min={400} max={750} onChange={(v) => set({ height: v })} />
                    <SliderRow label="Border Radius" value={config.borderRadius} min={0} max={32} onChange={(v) => set({ borderRadius: v })} />
                    <div>
                      <label className="text-xs font-medium text-nb-muted block mb-1.5">Position</label>
                      <ChipGroup
                        options={[
                          { value: 'bottom-right', label: '↘ BR' },
                          { value: 'bottom-left', label: '↙ BL' },
                          { value: 'bottom-center', label: '↓ BC' },
                          { value: 'top-right', label: '↗ TR' },
                          { value: 'top-left', label: '↖ TL' },
                        ]}
                        value={config.position} onChange={(v) => set({ position: v })} />
                    </div>
                    <SliderRow label="Offset X" value={config.offsetX} min={0} max={60} onChange={(v) => set({ offsetX: v })} />
                    <SliderRow label="Offset Y" value={config.offsetY} min={0} max={60} onChange={(v) => set({ offsetY: v })} />
                    <div>
                      <label className="text-xs font-medium text-nb-muted block mb-1.5">Header Style</label>
                      <ChipGroup
                        options={[
                          { value: 'gradient', label: 'Gradient' },
                          { value: 'solid', label: 'Solid' },
                          { value: 'minimal', label: 'Minimal' },
                        ]}
                        value={config.headerStyle} onChange={(v) => set({ headerStyle: v, theme: 'custom' })} color="blue" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-nb-muted block mb-1.5">Bubble Style</label>
                      <ChipGroup
                        options={[
                          { value: 'rounded', label: 'Rounded' },
                          { value: 'sharp', label: 'Sharp' },
                          { value: 'pill', label: 'Pill' },
                        ]}
                        value={config.messageBubbleStyle} onChange={(v) => set({ messageBubbleStyle: v })} color="pink" />
                    </div>
                  </div>
                )}

                {/* Button */}
                <SectionHeader icon={Layers} label="Launcher Button" open={openSections.button} onToggle={() => toggleSection('button')} />
                {openSections.button && (
                  <div className="space-y-3 px-1 pb-2">
                    <SliderRow label="Button Size" value={config.buttonSize} min={44} max={90} onChange={(v) => set({ buttonSize: v })} />
                    <div>
                      <label className="text-xs font-medium text-nb-muted block mb-1.5">Button Shape</label>
                      <ChipGroup
                        options={[
                          { value: 'circle', label: 'Circle' },
                          { value: 'rounded-square', label: 'Rounded' },
                          { value: 'square', label: 'Square' },
                        ]}
                        value={config.buttonStyle} onChange={(v) => set({ buttonStyle: v })} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-nb-muted block mb-1.5">Button Icon</label>
                      <ChipGroup
                        options={[
                          { value: 'chat', label: '💬 Chat' },
                          { value: 'sparkle', label: '✦ AI' },
                          { value: 'bot', label: '🤖 Bot' },
                        ]}
                        value={config.buttonIcon} onChange={(v) => set({ buttonIcon: v })} color="blue" />
                    </div>
                    <ToggleRow label="Show text label" value={config.showButtonLabel} onChange={(v) => set({ showButtonLabel: v })} />
                    {config.showButtonLabel && (
                      <input value={config.buttonLabel}
                        onChange={(e) => set({ buttonLabel: e.target.value })}
                        className="nb-input w-full text-xs" placeholder="e.g. Chat with us" />
                    )}
                  </div>
                )}

                {/* Typography */}
                <SectionHeader icon={Type} label="Typography" open={openSections.typography} onToggle={() => toggleSection('typography')} />
                {openSections.typography && (
                  <div className="space-y-3 px-1 pb-2">
                    <div>
                      <label className="text-xs font-medium text-nb-muted block mb-1.5">Font Family</label>
                      <select value={config.fontFamily} onChange={(e) => set({ fontFamily: e.target.value })}
                        className="nb-input w-full text-xs">
                        {[
                          ['Inter, sans-serif', 'Inter'],
                          ['Roboto, sans-serif', 'Roboto'],
                          ["'Poppins', sans-serif", 'Poppins'],
                          ["'DM Sans', sans-serif", 'DM Sans'],
                          ["'Space Grotesk', sans-serif", 'Space Grotesk'],
                          ["'Outfit', sans-serif", 'Outfit'],
                          ["'Courier New', monospace", 'Courier New'],
                          ['system-ui, sans-serif', 'System Default'],
                        ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <SliderRow label="Font Size" value={config.fontSize} min={11} max={18} unit="px" onChange={(v) => set({ fontSize: v })} />
                  </div>
                )}

                {/* Animation */}
                <SectionHeader icon={Zap} label="Animation" open={openSections.animation} onToggle={() => toggleSection('animation')} />
                {openSections.animation && (
                  <div className="space-y-3 px-1 pb-2">
                    <div>
                      <label className="text-xs font-medium text-nb-muted block mb-1.5">Open Animation</label>
                      <ChipGroup
                        options={[
                          { value: 'slide-up', label: 'Slide' },
                          { value: 'fade', label: 'Fade' },
                          { value: 'zoom', label: 'Zoom' },
                          { value: 'bounce', label: 'Bounce' },
                        ]}
                        value={config.openAnimation} onChange={(v) => set({ openAnimation: v })} color="pink" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-nb-muted block mb-1.5">Speed</label>
                      <ChipGroup
                        options={[
                          { value: 'slow', label: 'Slow' },
                          { value: 'normal', label: 'Normal' },
                          { value: 'fast', label: 'Fast' },
                        ]}
                        value={config.animationSpeed} onChange={(v) => set({ animationSpeed: v })} />
                    </div>
                  </div>
                )}
              </>}

              {/* ─── CONTENT TAB ─── */}
              {activeTab === 'content' && (
                <div className="space-y-4 px-1 py-1">
                  <div>
                    <label className="text-xs font-bold text-nb-muted block mb-1.5">Bot Display Name</label>
                    <input value={config.botName} onChange={(e) => set({ botName: e.target.value })}
                      className="nb-input w-full text-sm" placeholder={bot?.name || 'AI Assistant'} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-nb-muted block mb-1.5">Avatar Emoji</label>
                    <div className="flex gap-2 flex-wrap">
                      {['🤖', '🧠', '✦', '💬', '🦾', '🌟', '🎯', '⚡'].map(e => (
                        <button key={e} onClick={() => set({ avatarEmoji: e })}
                          className={`w-9 h-9 border-2 text-lg flex items-center justify-center transition-all ${
                            config.avatarEmoji === e ? 'border-black bg-nb-yellow shadow-[2px_2px_0_0_#000]' : 'border-gray-300 hover:border-black'
                          }`}>{e}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-nb-muted block mb-1.5">Welcome Message</label>
                    <textarea value={config.welcomeMessage} onChange={(e) => set({ welcomeMessage: e.target.value })}
                      rows={3} className="nb-input w-full text-sm resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-nb-muted block mb-1.5">Input Placeholder</label>
                    <input value={config.placeholder} onChange={(e) => set({ placeholder: e.target.value })}
                      className="nb-input w-full text-sm" />
                  </div>
                  <ToggleRow label="Suggested Replies" value={config.showSuggestedReplies} onChange={(v) => set({ showSuggestedReplies: v })}
                    description="Quick-reply chips below messages" />
                  {config.showSuggestedReplies && (
                    <div className="space-y-1.5">
                      {config.suggestedReplies.map((r, i) => (
                        <div key={i} className="flex gap-1.5">
                          <input value={r}
                            onChange={(e) => {
                              const arr = [...config.suggestedReplies];
                              arr[i] = e.target.value;
                              set({ suggestedReplies: arr });
                            }}
                            className="nb-input flex-1 text-xs py-1" />
                          <button onClick={() => set({ suggestedReplies: config.suggestedReplies.filter((_, j) => j !== i) })}
                            className="nb-btn px-2 py-1 bg-white border-black text-xs font-bold">✕</button>
                        </div>
                      ))}
                      {config.suggestedReplies.length < 5 && (
                        <button onClick={() => set({ suggestedReplies: [...config.suggestedReplies, 'New reply'] })}
                          className="nb-btn w-full py-1.5 bg-white border-black text-xs font-bold">+ Add Reply</button>
                      )}
                    </div>
                  )}
                  <ToggleRow label="Show Timestamps" value={config.showTimestamps} onChange={(v) => set({ showTimestamps: v })} />
                  <ToggleRow label="Show Online Status" value={config.showOnlineStatus} onChange={(v) => set({ showOnlineStatus: v })} />
                  <ToggleRow label="Typing Indicator" value={config.showTypingIndicator} onChange={(v) => set({ showTypingIndicator: v })} />
                  <ToggleRow label="Show Avatar" value={config.showAvatar} onChange={(v) => set({ showAvatar: v })} />
                  <ToggleRow label="Show Watermark" value={config.showWatermark} onChange={(v) => set({ showWatermark: v })}
                    description="Required on free plan" />
                </div>
              )}

              {/* ─── ADVANCED TAB ─── */}
              {activeTab === 'advanced' && (
                <div className="space-y-4 px-1 py-1">
                  <ToggleRow label="Drop Shadow" value={config.showShadow} onChange={(v) => set({ showShadow: v })} />
                  {config.showShadow && (
                    <div>
                      <label className="text-xs font-medium text-nb-muted block mb-1.5">Shadow Intensity</label>
                      <ChipGroup
                        options={[
                          { value: 'light', label: 'Light' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'strong', label: 'Strong' },
                        ]}
                        value={config.shadowIntensity} onChange={(v) => set({ shadowIntensity: v })} />
                    </div>
                  )}
                  <ToggleRow label="Show Border" value={config.showBorder} onChange={(v) => set({ showBorder: v })} />
                  {config.showBorder && (
                    <ColorRow label="Border Color" value={config.borderColor} onChange={(v) => set({ borderColor: v })} />
                  )}
                  <ToggleRow label="Backdrop Blur" value={config.backdropBlur} onChange={(v) => set({ backdropBlur: v })}
                    description="Glassmorphism effect on the window" />
                  <ToggleRow label="Compact Mode" value={config.compactMode} onChange={(v) => set({ compactMode: v })}
                    description="Reduced padding for embedded spaces" />
                  <div>
                    <label className="text-xs font-bold text-nb-muted block mb-1.5">Z-Index</label>
                    <input type="number" value={config.zIndex} min={100} max={99999}
                      onChange={(e) => set({ zIndex: Number(e.target.value) })}
                      className="nb-input w-full text-sm" />
                  </div>
                  <ColorRow label="Input Border Color" value={config.inputBorderColor} onChange={(v) => set({ inputBorderColor: v })} />
                  {/* Export config JSON */}
                  <button onClick={downloadConfig}
                    className="nb-btn w-full py-2.5 bg-white border-black text-xs font-bold flex items-center justify-center gap-2">
                    <Download size={13} /> Export Config JSON
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* ══ RIGHT PANEL ══ */}
          <div className="flex-1 flex flex-col overflow-hidden bg-nb-bg/40">

            {/* Preview toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-black bg-white">
              <div className="flex items-center gap-1">
                {[
                  { id: 'desktop', icon: Monitor, label: 'Desktop' },
                  { id: 'tablet', icon: Tablet, label: 'Tablet' },
                  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                ].map(({ id, icon: Icon }) => (
                  <button key={id} onClick={() => setViewMode(id)}
                    className={`p-1.5 border-2 border-black transition-all ${viewMode === id ? 'bg-nb-yellow shadow-[1px_1px_0_0_#000]' : 'bg-white hover:bg-gray-50'}`}
                    title={id}>
                    <Icon size={14} />
                  </button>
                ))}
                <div className="w-px h-5 bg-black/20 mx-1" />
                <button onClick={() => setDarkBg(!darkBg)}
                  className="p-1.5 border-2 border-black bg-white hover:bg-gray-50 transition-all" title="Toggle preview background">
                  {darkBg ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                <button onClick={() => setPreviewOpen(!previewOpen)}
                  className="p-1.5 border-2 border-black bg-white hover:bg-gray-50 transition-all" title="Toggle widget open/close">
                  {previewOpen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>

              {/* Right: code tab + copy */}
              <div className="flex items-center gap-2">
                {['preview', 'code'].map((t) => (
                  <button key={t} onClick={() => setFullscreenPreview(t === 'preview')}
                    className={`px-3 py-1.5 border-2 border-black text-xs font-bold flex items-center gap-1.5 transition-all ${
                      (t === 'preview' && fullscreenPreview) || (t === 'code' && !fullscreenPreview)
                        ? 'bg-nb-yellow shadow-[1px_1px_0_0_#000]'
                        : 'bg-white hover:bg-gray-50'
                    }`}>
                    {t === 'preview' ? <><Eye size={12} />Preview</> : <><Code2 size={12} />Embed Code</>}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview / Code pane */}
            {fullscreenPreview !== false && fullscreenPreview !== 'code' ? (
              /* ── iframe preview ── */
              <div className="flex-1 flex items-start justify-center overflow-auto p-4">
                <div
                  className="border-2 border-black shadow-[4px_4px_0_0_#000] overflow-hidden flex-shrink-0 transition-all duration-200"
                  style={{ width: previewWidth[viewMode], height: '100%', minHeight: 480, maxWidth: '100%' }}
                >
                  <iframe ref={iframeRef} className="w-full h-full" title="Widget Preview v2" />
                </div>
              </div>
            ) : (
              /* ── code view ── */
              <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2"><Code2 size={14} /> Embed Code</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={downloadConfig}
                      className="nb-btn px-3 py-1.5 text-xs font-bold bg-white border-black flex items-center gap-1.5">
                      <Download size={12} /> Config
                    </button>
                    <button onClick={() => copy(embedCode(), 'embed')}
                      className={`nb-btn px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 ${
                        copied === 'embed' ? 'bg-green-200 border-green-600' : 'bg-black text-white border-black'
                      }`}>
                      {copied === 'embed' ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy Code</>}
                    </button>
                  </div>
                </div>
                <pre className="flex-1 overflow-auto bg-gray-900 text-green-400 font-mono text-xs p-5 border-2 border-black leading-relaxed">
                  <code>{embedCode()}</code>
                </pre>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Paste before', value: '</body>', sublabel: 'closing body tag' },
                    { label: 'Config options', value: `${Object.keys(config).length} props`, sublabel: 'fully configurable' },
                    { label: 'Size', value: '~14KB', sublabel: 'gzipped widget' },
                    { label: 'Version', value: 'v2.0', sublabel: 'latest release' },
                  ].map(({ label, value, sublabel }) => (
                    <div key={label} className="border-2 border-black p-3 bg-white text-center">
                      <div className="font-black text-base font-mono">{value}</div>
                      <div className="text-xs font-bold mt-0.5">{label}</div>
                      <div className="text-xs text-nb-muted">{sublabel}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetCustomizerV2;
