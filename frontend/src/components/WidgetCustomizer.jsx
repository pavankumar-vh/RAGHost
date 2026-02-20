import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Copy, Check, Palette, Layout, Type, Sparkles, Settings,
  MessageSquare, Zap, RotateCcw, Monitor, Smartphone,
  Download, Bell, FileText, Brush
} from 'lucide-react';
import { botsService, setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────── Constants ─────────────────────────── */

const THEME_PRESETS = [
  { name: 'Midnight',   primary: '#667eea', secondary: '#764ba2', bg: '#ffffff', text: '#1a1a2e', user: '#667eea', bot: '#f0f0ff', botText: '#1a1a2e' },
  { name: 'Ocean',      primary: '#0891b2', secondary: '#0e7490', bg: '#ffffff', text: '#0b2340', user: '#0891b2', bot: '#e0f7fa', botText: '#0b2340' },
  { name: 'Ember',      primary: '#f97316', secondary: '#dc2626', bg: '#ffffff', text: '#1c0a00', user: '#f97316', bot: '#fff3e0', botText: '#1c0a00' },
  { name: 'Forest',     primary: '#059669', secondary: '#0d9488', bg: '#ffffff', text: '#0a2010', user: '#059669', bot: '#e8f5e9', botText: '#0a2010' },
  { name: 'Cotton',     primary: '#ec4899', secondary: '#8b5cf6', bg: '#ffffff', text: '#2d0028', user: '#ec4899', bot: '#fce4ec', botText: '#2d0028' },
  { name: 'Noir',       primary: '#e5e7eb', secondary: '#9ca3af', bg: '#111827', text: '#f9fafb', user: '#374151', bot: '#1f2937', botText: '#f9fafb' },
  { name: 'Neon',       primary: '#10b981', secondary: '#06b6d4', bg: '#0f172a', text: '#e2e8f0', user: '#10b981', bot: '#1e293b', botText: '#e2e8f0' },
  { name: 'Warm Sand',  primary: '#d97706', secondary: '#b45309', bg: '#fffbeb', text: '#1c1917', user: '#d97706', bot: '#fef3c7', botText: '#1c1917' },
  { name: 'Royal',      primary: '#7c3aed', secondary: '#4f46e5', bg: '#ffffff', text: '#1e0a40', user: '#7c3aed', bot: '#ede9fe', botText: '#1e0a40' },
  { name: 'Rose Gold',  primary: '#e11d48', secondary: '#f43f5e', bg: '#fff1f2', text: '#1a0010', user: '#e11d48', bot: '#ffe4e6', botText: '#1a0010' },
];

const BUTTON_ICONS = [
  { id: 'chat',       label: 'Chat',      svg: '<path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/><circle cx="9" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>' },
  { id: 'sparkles',   label: 'AI Spark',  svg: '<path d="M12 1L9.5 9.5 1 12l8.5 2.5 2.5 8.5 2.5-8.5 8.5-2.5-8.5-2.5L12 1z"/>' },
  { id: 'headphones', label: 'Support',   svg: '<path d="M12 1a9 9 0 0 0-9 9v5.5A3.5 3.5 0 0 0 6.5 19h.5v-7H6a6 6 0 1 1 12 0h-1v7h.5a3.5 3.5 0 0 0 3.5-3.5V10a9 9 0 0 0-9-9z"/>' },
  { id: 'zap',        label: 'Lightning', svg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
  { id: 'heart',      label: 'Friendly',  svg: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' },
  { id: 'star',       label: 'Star',      svg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
];

const AVATAR_EMOJIS = [
  '🤖','🧠','💬','✨','🎯','💡','🚀','🌟','👋','🎪',
  '🦾','🦉','🐬','🦊','🎭','🔮','💎','🌈','🏆','⚡',
  '🛸','🎀','🎓','🌸','🍀','🦋','🎵','🌊','🔥','🧩',
];

const FONT_OPTIONS = [
  { value: 'Inter',       label: 'Inter'         },
  { value: 'Roboto',      label: 'Roboto'        },
  { value: 'Open Sans',   label: 'Open Sans'     },
  { value: 'Poppins',     label: 'Poppins'       },
  { value: 'Lato',        label: 'Lato'          },
  { value: 'Nunito',      label: 'Nunito'        },
  { value: 'DM Sans',     label: 'DM Sans'       },
  { value: 'system-ui',   label: 'System Default'},
];

const DEFAULT_CONFIG = {
  primaryColor:       '#667eea',
  secondaryColor:     '#764ba2',
  gradientAngle:      135,
  backgroundColor:    '#ffffff',
  textColor:          '#1a1a2e',
  userBubbleColor:    '#667eea',
  botBubbleColor:     '#f0f0ff',
  botBubbleTextColor: '#1a1a2e',
  width:              400,
  height:             600,
  position:           'bottom-right',
  borderRadius:       16,
  shadowIntensity:    2,
  edgePadding:        24,
  buttonSize:         60,
  buttonStyle:        'circle',
  buttonIcon:         'chat',
  buttonPulse:        false,
  buttonLabel:        '',
  avatarEmoji:        '🤖',
  headerBotName:      '',
  headerStatus:       'Online',
  showAvatar:         true,
  showStatusDot:      true,
  bubbleRadius:       16,
  showTimestamps:     false,
  showUserAvatar:     false,
  showBotAvatar:      true,
  messageSpacing:     12,
  fontFamily:         'Inter',
  fontSize:           'medium',
  lineHeight:         'normal',
  autoOpen:           false,
  autoOpenDelay:      3,
  notificationBadge:  false,
  notificationCount:  1,
  welcomeMessage:     'Hi! How can I help you today? 👋',
  inputPlaceholder:   'Type your message...',
  offlineMessage:     "We're currently offline. Leave a message and we'll get back to you!",
  animationSpeed:     'normal',
};

/* ─────────────────────────── Helpers ─────────────────────────── */

const hexToRgb = (hex) => {
  const h = (hex || '#000').replace('#', '').padEnd(6, '0');
  return { r: parseInt(h.slice(0,2),16)||0, g: parseInt(h.slice(2,4),16)||0, b: parseInt(h.slice(4,6),16)||0 };
};

const SHADOWS = {
  0: 'none',
  1: '0 4px 16px rgba(0,0,0,.10)',
  2: '0 8px 32px rgba(0,0,0,.18)',
  3: '0 20px 60px rgba(0,0,0,.30)',
};

const FS_MAP  = { small:'13px', medium:'14px', large:'15px'   };
const LH_MAP  = { compact:'1.3', normal:'1.5', relaxed:'1.8' };
const ANI_MAP = { slow:500, normal:300, fast:150             };

/* ─────────────────────────── Mini-components ─────────────────────── */

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold text-nb-muted uppercase tracking-widest mb-2">{children}</p>
);

const Divider = () => <div className="border-t-2 border-black/10 my-4" />;

const TabBtn = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-[9px] text-xs font-bold border-b border-black/10 transition-all text-left leading-none
      ${active ? 'bg-nb-yellow text-black border-l-2 border-l-black' : 'bg-white text-nb-muted hover:bg-nb-yellow/30 border-l-2 border-l-transparent'}`}>
    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
    <span>{label}</span>
  </button>
);

const ToggleSwitch = ({ checked, onChange, label, sub }) => (
  <div className="flex items-center justify-between py-1.5 gap-3">
    <div className="min-w-0">
      <p className="text-xs font-bold text-nb-text leading-tight">{label}</p>
      {sub && <p className="text-[10px] text-nb-muted mt-0.5">{sub}</p>}
    </div>
    <button onClick={() => onChange(!checked)}
      className={`w-10 h-5 border-2 border-black flex-shrink-0 relative transition-colors ${checked ? 'bg-black' : 'bg-white'}`}>
      <div className={`absolute top-0.5 w-3 h-3 border border-black bg-white transition-all ${checked ? 'left-[22px] bg-nb-yellow' : 'left-0.5'}`} />
    </button>
  </div>
);

const SliderRow = ({ label, value, min, max, unit = 'px', onChange, step = 1 }) => (
  <div>
    <div className="flex justify-between mb-1">
      <p className="text-xs font-bold text-nb-muted">{label}</p>
      <p className="text-xs font-bold text-nb-text tabular-nums">{value}{unit}</p>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-black" style={{ height: '4px' }} />
  </div>
);

const ColorRow = ({ label, value, onChange }) => {
  const isValid = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <div className="flex items-center gap-2 py-0.5">
      <input type="color" value={isValid ? value : '#000000'} onChange={e => onChange(e.target.value)}
        className="w-8 h-8 border-2 border-black cursor-pointer p-0 flex-shrink-0" />
      <input type="text" value={value}
        onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value); }}
        maxLength={7}
        className={`nb-input flex-1 text-xs font-mono py-1.5 h-8 ${!isValid ? 'border-red-400' : ''}`} />
      <span className="text-[10px] font-bold text-nb-muted w-[90px] flex-shrink-0 text-right">{label}</span>
    </div>
  );
};

const ChipGroup = ({ options, value, onChange, color = 'bg-nb-yellow' }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map(o => {
      const v = (typeof o === 'object' ? o.value : o);
      const l = (typeof o === 'object' ? o.label : o);
      return (
        <button key={v} onClick={() => onChange(v)}
          className={`px-2.5 py-1 border-2 border-black text-[11px] font-bold capitalize transition-all
            ${v === value ? `${color} shadow-nb-sm` : 'bg-white hover:bg-nb-yellow/20'}`}>
          {l}
        </button>
      );
    })}
  </div>
);

/* ─────────────────────────── Main Component ─────────────────────── */

const WidgetCustomizer = ({ bot, onClose }) => {
  const { getIdToken } = useAuth();
  const iframeRef      = useRef(null);
  const syncTimer      = useRef(null);

  const [config, setConfig]         = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab]   = useState('theme');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [previewBg, setPreviewBg]   = useState('light');
  const [copied, setCopied]         = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [saveState, setSaveState]   = useState('idle'); // idle|saving|saved|error

  /* inject scrollbar CSS */
  useEffect(() => {
    const s = document.createElement('style');
    s.id = 'wcv2-scroll';
    s.textContent = `.wcv2-scroll::-webkit-scrollbar{width:4px}.wcv2-scroll::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}`;
    document.head.appendChild(s);
    return () => document.getElementById('wcv2-scroll')?.remove();
  }, []);

  /* load saved config */
  useEffect(() => {
    const load = async () => {
      try {
        const botId = bot?._id || bot?.id;
        if (!botId) return;
        const token = await getIdToken();
        if (!token) return;
        setAuthToken(token);
        const res = await botsService.getWidgetConfig(botId);
        if (res.data && Object.keys(res.data).length) {
          setConfig(prev => ({ ...DEFAULT_CONFIG, ...res.data }));
        } else if (bot?.welcomeMessage) {
          setConfig(prev => ({ ...prev, welcomeMessage: bot.welcomeMessage }));
        }
      } catch {}
    };
    load();
  }, []);

  /* debounced save */
  const updateConfig = useCallback((patch) => {
    setConfig(prev => {
      const next = { ...prev, ...patch };
      clearTimeout(syncTimer.current);
      setSaveState('saving');
      syncTimer.current = setTimeout(async () => {
        try {
          const botId = bot?._id || bot?.id;
          if (!botId) return;
          const token = await getIdToken();
          setAuthToken(token);
          await botsService.saveWidgetConfig(botId, next);
          setSaveState('saved');
          setTimeout(() => setSaveState('idle'), 2000);
        } catch {
          setSaveState('error');
          setTimeout(() => setSaveState('idle'), 3000);
        }
      }, 700);
      return next;
    });
  }, [bot]);

  /* apply theme preset */
  const applyPreset = (p) => updateConfig({
    primaryColor: p.primary, secondaryColor: p.secondary,
    backgroundColor: p.bg,  textColor: p.text,
    userBubbleColor: p.user, botBubbleColor: p.bot,
    botBubbleTextColor: p.botText,
  });

  /* reset */
  const resetConfig = () => {
    const base = { ...DEFAULT_CONFIG, welcomeMessage: bot?.welcomeMessage || DEFAULT_CONFIG.welcomeMessage };
    setConfig(base);
    clearTimeout(syncTimer.current);
    setSaveState('saving');
    syncTimer.current = setTimeout(async () => {
      try {
        const botId = bot?._id || bot?.id;
        const token = await getIdToken();
        setAuthToken(token);
        await botsService.saveWidgetConfig(botId, base);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      } catch { setSaveState('error'); }
    }, 300);
  };

  /* export config JSON */
  const exportJSON = () => {
    const data = JSON.stringify({ botId: bot?._id || bot?.id, widgetConfig: config }, null, 2);
    navigator.clipboard.writeText(data);
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2500);
  };

  /* copy embed code */
  const handleCopyCode = () => {
    const apiUrl    = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const widgetUrl = window.location.origin;
    const botId     = bot?._id || bot?.id;
    const wm        = (config.welcomeMessage || '').replace(/'/g, "\\'").replace(/\n/g, '\\n');
    const code = `<!-- RAGhost Chat Widget v2 -->
<script>
  (function() {
    window.RAGhostConfig = {
      botId: '${botId}',
      apiUrl: '${apiUrl}',
      botName: '${(bot?.name || 'AI Assistant').replace(/'/g, "\\'")}',
      botType: '${bot?.type || 'Support'}',
      welcomeMessage: '${wm}',
      // Colors & gradient
      primaryColor: '${config.primaryColor}',
      secondaryColor: '${config.secondaryColor}',
      gradientAngle: ${config.gradientAngle ?? 135},
      backgroundColor: '${config.backgroundColor}',
      textColor: '${config.textColor}',
      userBubbleColor: '${config.userBubbleColor}',
      botBubbleColor: '${config.botBubbleColor}',
      botBubbleTextColor: '${config.botBubbleTextColor}',
      // Layout
      width: ${config.width},
      height: ${config.height},
      position: '${config.position}',
      borderRadius: ${config.borderRadius},
      shadowIntensity: ${config.shadowIntensity ?? 2},
      edgePadding: ${config.edgePadding ?? 24},
      // Button
      buttonSize: ${config.buttonSize},
      buttonStyle: '${config.buttonStyle}',
      // Messages
      bubbleRadius: ${config.bubbleRadius ?? 16},
      messageSpacing: ${config.messageSpacing ?? 12},
      // Typography
      fontFamily: '${config.fontFamily}',
      animationSpeed: '${config.animationSpeed}',
    };
    var s = document.createElement('script');
    s.src = '${widgetUrl}/widget/widget-new.js';
    s.async = true;
    document.body.appendChild(s);
  })();
<\/script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  /* ─── Preview HTML ─── */
  const generatePreviewHTML = useCallback(() => {
    const pc    = config.primaryColor       || '#667eea';
    const sc    = config.secondaryColor     || '#764ba2';
    const bg    = config.backgroundColor    || '#ffffff';
    const tc    = config.textColor          || '#1a1a2e';
    const uc    = config.userBubbleColor    || pc;
    const bbc   = config.botBubbleColor     || '#f0f0ff';
    const bbtc  = config.botBubbleTextColor || tc;
    const angle = config.gradientAngle ?? 135;
    const grad  = `linear-gradient(${angle}deg,${pc},${sc})`;
    const animMs = ANI_MAP[config.animationSpeed] ?? 300;
    const fs    = FS_MAP[config.fontSize]    || '14px';
    const lh    = LH_MAP[config.lineHeight]  || '1.5';
    const shad  = SHADOWS[config.shadowIntensity ?? 2];
    const btnR  = { circle:'50%', rounded:'16px', square:'0px' }[config.buttonStyle] || '50%';
    const bsz   = config.buttonSize         || 60;
    const br    = config.borderRadius       ?? 16;
    const msgR  = config.bubbleRadius       ?? 16;
    const msgGap = config.messageSpacing    ?? 12;
    const ep    = config.edgePadding        ?? 24;
    const ff    = config.fontFamily         || 'Inter';
    const { r, g, b }   = hexToRgb(pc);
    const { r:ur, g:ug, b:ub } = hexToRgb(uc);
    const iconSVG     = BUTTON_ICONS.find(i => i.id === config.buttonIcon)?.svg || BUTTON_ICONS[0].svg;
    const posIsLeft   = config.position?.includes('left');
    const posIsTop    = config.position?.includes('top');
    const winBottom   = posIsTop ? '' : `bottom:${bsz + 14}px;`;
    const winTop      = posIsTop ? `top:${bsz + 14}px;` : '';
    const winSide     = posIsLeft ? 'left:0;' : 'right:0;';
    const bgCanvas    = previewBg === 'dark'  ? '#1a1a2e'
                      : previewBg === 'check' ? 'repeating-conic-gradient(#ddd 0% 25%,#f5f5f5 0% 50%) 0/20px 20px'
                      : '#eef2f7';

    const pulseCSS = config.buttonPulse ? `
      @keyframes rh-pulse { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.7);opacity:0} }
      .rh-btn::before{content:'';position:absolute;inset:0;border-radius:${btnR};background:${grad};animation:rh-pulse 1.8s ease-out infinite;z-index:-1;}
    ` : '';

    const tsVisible   = config.showTimestamps   ? 'display:block;' : 'display:none;';
    const badgeHTML   = config.notificationBadge
      ? `<div class="rh-badge">${Math.min(config.notificationCount||1,99)}</div>` : '';
    const labelHTML   = config.buttonLabel
      ? `<div class="rh-btn-label">${config.buttonLabel}</div>` : '';
    const botAv       = config.showBotAvatar  ? `<div class="rh-av rh-av-bot">${config.avatarEmoji||'🤖'}</div>` : '';
    const userAv      = config.showUserAvatar ? `<div class="rh-av rh-av-user">👤</div>` : '';
    const headerName  = config.headerBotName  || bot?.name || 'AI Assistant';
    const statusText  = config.headerStatus   || 'Online';
    const dotColor    = { Online:'#22c55e', Away:'#f59e0b', Busy:'#ef4444', Offline:'#9ca3af' }[statusText] || '#22c55e';

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=${ff.replace(' ','+')}:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'${ff}',system-ui,sans-serif;font-size:${fs};line-height:${lh};background:${bgCanvas};height:100vh;width:100vw;overflow:hidden}
.rh-wrap{position:fixed;${posIsLeft?`left:${ep}px;`:`right:${ep}px;`}${posIsTop?`top:${ep}px;`:`bottom:${ep}px;`}z-index:9999;display:flex;flex-direction:column;align-items:${posIsLeft?'flex-start':'flex-end'};gap:8px}
.rh-btn-label-wrap{order:${posIsTop?2:0}}
.rh-btn-label{font-size:11px;font-weight:700;background:${grad};color:white;padding:5px 11px;border-radius:6px;white-space:nowrap;box-shadow:${shad}}
.rh-btn-row{display:flex;align-items:center;gap:8px;flex-direction:${posIsLeft?'row':'row-reverse'};order:${posIsTop?1:0}}
.rh-btn{width:${bsz}px;height:${bsz}px;border:none;border-radius:${btnR};background:${grad};cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:${shad};transition:transform ${animMs}ms,box-shadow ${animMs}ms;position:relative;color:white;flex-shrink:0}
.rh-btn:hover{transform:scale(1.08)}
.rh-btn svg{width:${Math.round(bsz*0.42)}px;height:${Math.round(bsz*0.42)}px;fill:currentColor}
.rh-badge{position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;border-radius:99px;background:#ef4444;color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid white}
${pulseCSS}
.rh-window{position:fixed;width:${config.width}px;height:${config.height}px;max-width:calc(100vw - ${ep*2}px);max-height:calc(100vh - ${ep + bsz + 20}px);background:${bg};border-radius:${br}px;box-shadow:${shad};display:flex;flex-direction:column;overflow:hidden;transition:all ${animMs}ms cubic-bezier(.4,0,.2,1);transform:scale(0.9) translateY(8px);opacity:0;pointer-events:none;${winSide}${winBottom}${winTop}}
.rh-window.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
.rh-header{background:${grad};padding:14px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;color:white;gap:8px}
.rh-header-info{display:flex;align-items:center;gap:10px;flex:1;min-width:0}
.rh-av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0}
.rh-av-bot{background:rgba(255,255,255,.2)}
.rh-av-user{background:rgba(${ur},${ug},${ub},.15);font-size:16px}
.rh-htext{flex:1;min-width:0}
.rh-name{font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px}
.rh-dot{width:8px;height:8px;border-radius:50%;background:${dotColor};flex-shrink:0;display:${config.showStatusDot?'block':'none'}}
.rh-status{font-size:11px;opacity:.72;margin-top:1px}
.rh-hbtn{width:28px;height:28px;border:none;border-radius:6px;cursor:pointer;background:rgba(255,255,255,.2);color:white;display:flex;align-items:center;justify-content:center;font-size:14px;transition:background ${animMs}ms}
.rh-hbtn:hover{background:rgba(255,255,255,.35)}
.rh-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:${msgGap}px;scroll-behavior:smooth}
.rh-msgs::-webkit-scrollbar{width:4px}.rh-msgs::-webkit-scrollbar-thumb{background:rgba(${r},${g},${b},.2);border-radius:4px}
.rh-row{display:flex;gap:8px;align-items:flex-end;animation:rh-msg ${animMs}ms ease}
@keyframes rh-msg{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.rh-row.user{flex-direction:row-reverse}
.rh-msg-wrap{display:flex;flex-direction:column;gap:3px;max-width:76%}
.rh-row.user .rh-msg-wrap{align-items:flex-end}
.rh-bubble{padding:10px 14px;word-wrap:break-word;font-size:${fs};line-height:${lh}}
.rh-row.bot  .rh-bubble{background:${bbc};color:${bbtc};border-radius:${msgR}px ${msgR}px ${msgR}px 4px}
.rh-row.user .rh-bubble{background:${grad};color:white;border-radius:${msgR}px ${msgR}px 4px ${msgR}px}
.rh-ts{font-size:10px;opacity:.45;font-weight:500;padding:0 2px;${tsVisible}}
.rh-input-area{padding:12px 14px;border-top:1px solid rgba(${r},${g},${b},.1);display:flex;gap:8px;align-items:flex-end;background:${bg};flex-shrink:0}
.rh-input{flex:1;padding:9px 12px;border:2px solid rgba(${r},${g},${b},.2);border-radius:10px;font-family:inherit;font-size:${fs};resize:none;outline:none;background:${bg};color:${tc};transition:border-color ${animMs}ms;max-height:80px}
.rh-input:focus{border-color:${pc}}
.rh-input::placeholder{color:rgba(0,0,0,.35);font-size:13px}
.rh-send{width:36px;height:36px;border:none;border-radius:9px;background:${grad};color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform ${animMs}ms,opacity ${animMs}ms}
.rh-send:hover{transform:scale(1.08)}
.rh-send svg{width:15px;height:15px;fill:currentColor}
.rh-watermark{text-align:center;font-size:10px;color:#bbb;padding:7px;border-top:1px solid rgba(${r},${g},${b},.07);flex-shrink:0;background:${bg}}
.rh-watermark a{color:${pc};font-weight:700;text-decoration:none}
.rh-typing{display:flex;gap:4px;padding:10px 14px;background:${bbc};border-radius:${msgR}px ${msgR}px ${msgR}px 4px;width:fit-content}
.rh-typing span{width:7px;height:7px;background:rgba(${r},${g},${b},.45);border-radius:50%;animation:rh-tk 1.2s infinite}
.rh-typing span:nth-child(2){animation-delay:.2s}.rh-typing span:nth-child(3){animation-delay:.4s}
@keyframes rh-tk{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
</style></head><body>
<div class="rh-wrap">
  ${config.buttonLabel ? `<div class="rh-btn-label-wrap"><div class="rh-btn-label">${config.buttonLabel}</div></div>` : ''}
  <div class="rh-btn-row">
    <div class="rh-btn" id="rhBtn" onclick="toggleChat()">
      <svg viewBox="0 0 24 24">${iconSVG}</svg>
      ${badgeHTML}
    </div>
  </div>
  <div class="rh-window open" id="rhWin">
    <div class="rh-header">
      <div class="rh-header-info">
        ${config.showAvatar ? `<div class="rh-av rh-av-bot">${config.avatarEmoji||'🤖'}</div>` : ''}
        <div class="rh-htext">
          <div class="rh-name">
            <span>${headerName}</span>
            <div class="rh-dot"></div>
          </div>
          <div class="rh-status">${statusText} · Replies instantly</div>
        </div>
      </div>
      <button class="rh-hbtn" onclick="toggleChat()">✕</button>
    </div>
    <div class="rh-msgs" id="rhMsgs">
      <div class="rh-row bot">
        ${botAv}
        <div class="rh-msg-wrap">
          <div class="rh-bubble">${config.welcomeMessage || 'Hi! How can I help you today? 👋'}</div>
          <div class="rh-ts">Just now</div>
        </div>
      </div>
      <div class="rh-row user">
        <div class="rh-msg-wrap">
          <div class="rh-bubble">Hello! I'd like to learn more about your product.</div>
          <div class="rh-ts">Just now</div>
        </div>
        ${userAv}
      </div>
      <div class="rh-row bot">
        ${botAv}
        <div class="rh-msg-wrap">
          <div class="rh-bubble">Of course! I'd be happy to help. What would you like to know? 😊</div>
          <div class="rh-ts">Just now</div>
        </div>
      </div>
      <div class="rh-row bot">
        ${botAv}
        <div class="rh-typing"><span></span><span></span><span></span></div>
      </div>
    </div>
    <div class="rh-input-area">
      <textarea class="rh-input" rows="1" placeholder="${config.inputPlaceholder||'Type your message...'}"></textarea>
      <button class="rh-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
    </div>
    <div class="rh-watermark">Powered by <a href="https://rag-host.vercel.app" target="_blank">RAGhost</a></div>
  </div>
</div>
<script>
var rhOpen = true;
function toggleChat() {
  rhOpen = !rhOpen;
  document.getElementById('rhWin').classList.toggle('open', rhOpen);
}
</script>
</body></html>`;
  }, [config, bot, previewBg]);

  /* refresh iframe on any change */
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(generatePreviewHTML());
    doc.close();
  }, [generatePreviewHTML]);

  /* ─── Tab definitions ─── */
  const TABS = [
    { id: 'theme',    icon: Brush,        label: 'Themes'     },
    { id: 'colors',   icon: Palette,      label: 'Colors'     },
    { id: 'layout',   icon: Layout,       label: 'Layout'     },
    { id: 'button',   icon: Zap,          label: 'Button'     },
    { id: 'header',   icon: MessageSquare,label: 'Header'     },
    { id: 'messages', icon: MessageSquare,label: 'Messages'   },
    { id: 'typo',     icon: Type,         label: 'Typography' },
    { id: 'behavior', icon: Settings,     label: 'Behavior'   },
    { id: 'content',  icon: FileText,     label: 'Content'    },
  ];

  /* ─── Tab content renderer ─── */
  const renderTab = () => {
    switch (activeTab) {

      /* ── THEMES ── */
      case 'theme': return (
        <div className="space-y-5">
          <div>
            <SectionLabel>Color Themes</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {THEME_PRESETS.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className="border-2 border-black p-2.5 flex items-center gap-2 bg-white hover:shadow-nb-sm hover:scale-[1.02] transition-all active:scale-100 text-left">
                  <div className="flex gap-0.5 flex-shrink-0">
                    <div className="w-4 h-8 rounded-l-sm" style={{ background: `linear-gradient(180deg,${p.primary},${p.secondary})` }} />
                    <div className="w-4 h-8 border-l rounded-r-sm" style={{ background: p.bot }} />
                  </div>
                  <span className="text-[11px] font-bold text-nb-text leading-tight">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Gradient Direction</SectionLabel>
            <div className="grid grid-cols-4 gap-1.5">
              {[0,45,90,135,180,225,270,315].map(deg => (
                <button key={deg} onClick={() => updateConfig({ gradientAngle: deg })}
                  className={`h-10 border-2 border-black flex flex-col items-center justify-center gap-0.5 transition-all text-xs font-bold
                    ${config.gradientAngle === deg ? 'bg-nb-yellow shadow-nb-sm' : 'bg-white hover:bg-nb-yellow/30'}`}>
                  <span style={{ transform:`rotate(${deg}deg)`, display:'inline-block', lineHeight:1 }}>↑</span>
                  <span className="text-[9px]">{deg}°</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      );

      /* ── COLORS ── */
      case 'colors': return (
        <div className="space-y-5">
          <div>
            <SectionLabel>Gradient</SectionLabel>
            <div className="space-y-1.5">
              <ColorRow label="Primary"    value={config.primaryColor}   onChange={v => updateConfig({ primaryColor: v })}   />
              <ColorRow label="Secondary"  value={config.secondaryColor} onChange={v => updateConfig({ secondaryColor: v })} />
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Window</SectionLabel>
            <div className="space-y-1.5">
              <ColorRow label="Background" value={config.backgroundColor}    onChange={v => updateConfig({ backgroundColor: v })}    />
              <ColorRow label="Text"       value={config.textColor}          onChange={v => updateConfig({ textColor: v })}          />
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Message Bubbles</SectionLabel>
            <div className="space-y-1.5">
              <ColorRow label="User bubble"   value={config.userBubbleColor}    onChange={v => updateConfig({ userBubbleColor: v })}    />
              <ColorRow label="Bot bubble"    value={config.botBubbleColor}     onChange={v => updateConfig({ botBubbleColor: v })}     />
              <ColorRow label="Bot text"      value={config.botBubbleTextColor} onChange={v => updateConfig({ botBubbleTextColor: v })} />
            </div>
          </div>
        </div>
      );

      /* ── LAYOUT ── */
      case 'layout': return (
        <div className="space-y-5">
          <div>
            <SectionLabel>Window Size</SectionLabel>
            <div className="space-y-3">
              <SliderRow label="Width"  value={config.width}  min={280} max={520} onChange={v => updateConfig({ width: v })} />
              <SliderRow label="Height" value={config.height} min={400} max={720} onChange={v => updateConfig({ height: v })} />
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Position on Screen</SectionLabel>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { v:'bottom-right', label:'↘ Bottom Right' },
                { v:'bottom-left',  label:'↙ Bottom Left'  },
                { v:'top-right',    label:'↗ Top Right'    },
                { v:'top-left',     label:'↖ Top Left'     },
              ].map(o => (
                <button key={o.v} onClick={() => updateConfig({ position: o.v })}
                  className={`py-2 border-2 border-black text-xs font-bold transition-all ${config.position === o.v ? 'bg-nb-yellow shadow-nb-sm' : 'bg-white hover:bg-nb-yellow/20'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Decoration</SectionLabel>
            <div className="space-y-3">
              <SliderRow label="Corner Radius" value={config.borderRadius}  min={0}  max={32} onChange={v => updateConfig({ borderRadius: v })} />
              <SliderRow label="Edge Padding"  value={config.edgePadding}   min={12} max={48} onChange={v => updateConfig({ edgePadding: v })}  />
              <div>
                <p className="text-xs font-bold text-nb-muted mb-1.5">Shadow Intensity</p>
                <ChipGroup
                  options={[{label:'None',value:0},{label:'Soft',value:1},{label:'Med',value:2},{label:'Heavy',value:3}]}
                  value={config.shadowIntensity} color="bg-nb-blue"
                  onChange={v => updateConfig({ shadowIntensity: v })} />
              </div>
            </div>
          </div>
        </div>
      );

      /* ── BUTTON ── */
      case 'button': return (
        <div className="space-y-5">
          <div>
            <SectionLabel>Size &amp; Shape</SectionLabel>
            <div className="space-y-3">
              <SliderRow label="Button Size" value={config.buttonSize} min={44} max={80} onChange={v => updateConfig({ buttonSize: v })} />
              <div>
                <p className="text-xs font-bold text-nb-muted mb-1.5">Shape</p>
                <ChipGroup
                  options={[{label:'Circle',value:'circle'},{label:'Rounded',value:'rounded'},{label:'Square',value:'square'}]}
                  value={config.buttonStyle}
                  onChange={v => updateConfig({ buttonStyle: v })} />
              </div>
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Button Icon</SectionLabel>
            <div className="grid grid-cols-3 gap-1.5">
              {BUTTON_ICONS.map(ic => (
                <button key={ic.id} onClick={() => updateConfig({ buttonIcon: ic.id })}
                  className={`p-2.5 border-2 border-black flex flex-col items-center gap-1.5 transition-all
                    ${config.buttonIcon === ic.id ? 'bg-nb-pink shadow-nb-sm' : 'bg-white hover:bg-nb-pink/20'}`}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"
                    dangerouslySetInnerHTML={{ __html: ic.svg }} />
                  <span className="text-[10px] font-bold">{ic.label}</span>
                </button>
              ))}
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Effects</SectionLabel>
            <ToggleSwitch label="Pulse animation" sub="Ripple ring on the button"
              checked={config.buttonPulse} onChange={v => updateConfig({ buttonPulse: v })} />
          </div>
          <Divider />
          <div>
            <SectionLabel>Button Label</SectionLabel>
            <input type="text" value={config.buttonLabel}
              onChange={e => updateConfig({ buttonLabel: e.target.value })}
              placeholder='e.g. "Chat with us"'
              maxLength={30}
              className="nb-input w-full text-sm" />
            <p className="text-[10px] text-nb-muted mt-1">Shown as a pill chip next to the button</p>
          </div>
        </div>
      );

      /* ── HEADER ── */
      case 'header': return (
        <div className="space-y-5">
          <div>
            <SectionLabel>Avatar Emoji</SectionLabel>
            <div className="grid grid-cols-6 gap-1 bg-white border-2 border-black p-2">
              {AVATAR_EMOJIS.map(em => (
                <button key={em} onClick={() => updateConfig({ avatarEmoji: em })}
                  className={`h-9 text-xl flex items-center justify-center border-2 transition-all
                    ${config.avatarEmoji === em ? 'border-black bg-nb-yellow' : 'border-transparent hover:bg-nb-yellow/30 hover:border-black/20'}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Display Name</SectionLabel>
            <input type="text" value={config.headerBotName}
              onChange={e => updateConfig({ headerBotName: e.target.value })}
              placeholder={bot?.name || 'AI Assistant'}
              className="nb-input w-full text-sm" />
            <p className="text-[10px] text-nb-muted mt-1">Leave blank to use the bot's actual name</p>
          </div>
          <Divider />
          <div>
            <SectionLabel>Status Badge</SectionLabel>
            <ChipGroup color="bg-nb-yellow"
              options={['Online','Away','Busy','Offline']}
              value={config.headerStatus}
              onChange={v => updateConfig({ headerStatus: v })} />
          </div>
          <Divider />
          <div>
            <SectionLabel>Visibility</SectionLabel>
            <ToggleSwitch label="Show avatar"     checked={config.showAvatar}    onChange={v => updateConfig({ showAvatar: v })}    />
            <ToggleSwitch label="Show status dot" checked={config.showStatusDot} onChange={v => updateConfig({ showStatusDot: v })} />
          </div>
        </div>
      );

      /* ── MESSAGES ── */
      case 'messages': return (
        <div className="space-y-5">
          <div>
            <SectionLabel>Bubble Style</SectionLabel>
            <div className="space-y-3">
              <SliderRow label="Bubble Radius" value={config.bubbleRadius}   min={4}  max={24} onChange={v => updateConfig({ bubbleRadius: v })} />
              <SliderRow label="Message Gap"   value={config.messageSpacing} min={4}  max={28} onChange={v => updateConfig({ messageSpacing: v })} />
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Visibility</SectionLabel>
            <ToggleSwitch label="Show timestamps"  checked={config.showTimestamps} onChange={v => updateConfig({ showTimestamps: v })} />
            <ToggleSwitch label="Show bot avatar"  checked={config.showBotAvatar}  onChange={v => updateConfig({ showBotAvatar: v })}  />
            <ToggleSwitch label="Show user avatar" checked={config.showUserAvatar} onChange={v => updateConfig({ showUserAvatar: v })} />
          </div>
        </div>
      );

      /* ── TYPOGRAPHY ── */
      case 'typo': return (
        <div className="space-y-5">
          <div>
            <SectionLabel>Font Family</SectionLabel>
            <div className="space-y-1">
              {FONT_OPTIONS.map(f => (
                <button key={f.value} onClick={() => updateConfig({ fontFamily: f.value })}
                  className={`w-full px-3 py-2 border-2 border-black text-sm text-left transition-all
                    ${config.fontFamily === f.value ? 'bg-nb-yellow shadow-nb-sm font-bold' : 'bg-white hover:bg-nb-yellow/20'}`}
                  style={{ fontFamily: f.value }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <Divider />
          <div>
            <SectionLabel>Font Size</SectionLabel>
            <ChipGroup color="bg-nb-blue"
              options={[{label:'Small',value:'small'},{label:'Medium',value:'medium'},{label:'Large',value:'large'}]}
              value={config.fontSize} onChange={v => updateConfig({ fontSize: v })} />
          </div>
          <Divider />
          <div>
            <SectionLabel>Line Height</SectionLabel>
            <ChipGroup color="bg-nb-blue"
              options={[{label:'Compact',value:'compact'},{label:'Normal',value:'normal'},{label:'Relaxed',value:'relaxed'}]}
              value={config.lineHeight} onChange={v => updateConfig({ lineHeight: v })} />
          </div>
          <Divider />
          <div>
            <SectionLabel>Animation Speed</SectionLabel>
            <ChipGroup
              options={['slow','normal','fast']}
              value={config.animationSpeed} onChange={v => updateConfig({ animationSpeed: v })} />
          </div>
        </div>
      );

      /* ── BEHAVIOR ── */
      case 'behavior': return (
        <div className="space-y-5">
          <div>
            <SectionLabel>Auto-open</SectionLabel>
            <ToggleSwitch label="Open widget on page load"
              sub="Widget expands automatically when the page loads"
              checked={config.autoOpen} onChange={v => updateConfig({ autoOpen: v })} />
            {config.autoOpen && (
              <div className="mt-3">
                <SliderRow label="Open after" value={config.autoOpenDelay} min={0} max={15} unit="s"
                  onChange={v => updateConfig({ autoOpenDelay: v })} />
              </div>
            )}
          </div>
          <Divider />
          <div>
            <SectionLabel>Notification Badge</SectionLabel>
            <ToggleSwitch label="Show notification count badge"
              sub="Red badge on the button to attract attention"
              checked={config.notificationBadge} onChange={v => updateConfig({ notificationBadge: v })} />
            {config.notificationBadge && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-bold text-nb-muted">Count:</span>
                <input type="number" min={1} max={99} value={config.notificationCount}
                  onChange={e => updateConfig({ notificationCount: Math.max(1,Math.min(99,parseInt(e.target.value)||1)) })}
                  className="nb-input w-20 text-sm text-center" />
              </div>
            )}
          </div>
        </div>
      );

      /* ── CONTENT ── */
      case 'content': return (
        <div className="space-y-5">
          <div>
            <SectionLabel>Welcome Message</SectionLabel>
            <textarea value={config.welcomeMessage}
              onChange={e => updateConfig({ welcomeMessage: e.target.value })}
              rows={3} className="nb-input w-full text-sm resize-none"
              placeholder="Hi! How can I help you today? 👋" />
          </div>
          <Divider />
          <div>
            <SectionLabel>Input Placeholder</SectionLabel>
            <input type="text" value={config.inputPlaceholder}
              onChange={e => updateConfig({ inputPlaceholder: e.target.value })}
              className="nb-input w-full text-sm" placeholder="Type your message..." />
          </div>
          <Divider />
          <div>
            <SectionLabel>Offline Message</SectionLabel>
            <textarea value={config.offlineMessage}
              onChange={e => updateConfig({ offlineMessage: e.target.value })}
              rows={2} className="nb-input w-full text-sm resize-none"
              placeholder="We're currently offline..." />
          </div>
          <Divider />
          <div className="bg-nb-yellow/40 border-2 border-black p-3">
            <p className="text-xs font-bold text-nb-text mb-1">✨ RAGhost Watermark</p>
            <p className="text-[11px] text-nb-muted leading-relaxed">
              The "Powered by RAGhost" watermark is required on the free plan and cannot be removed.
            </p>
          </div>
        </div>
      );

      default: return null;
    }
  };

  /* ─── Save indicator ─── */
  const SaveBadge = () => {
    if (saveState === 'idle')   return null;
    if (saveState === 'saving') return (
      <span className="text-[11px] text-white/60 flex items-center gap-1.5">
        <span className="w-3 h-3 border border-white/50 border-t-transparent rounded-full animate-spin inline-block" />
        Saving…
      </span>
    );
    if (saveState === 'saved')  return <span className="text-[11px] text-green-400 font-bold flex items-center gap-1"><Check className="w-3 h-3" />Saved</span>;
    if (saveState === 'error')  return <span className="text-[11px] text-red-400 font-bold">Save failed</span>;
    return null;
  };

  /* ─── Render ─── */
  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3"
      onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-nb-bg border-2 border-black shadow-nb w-full max-w-[1220px] h-[92vh] flex flex-col overflow-hidden">

        {/* ── Top bar ── */}
        <div className="px-5 h-11 bg-black flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-nb-yellow flex-shrink-0" />
            <span className="text-sm font-bold text-white">Widget Customizer</span>
            <span className="text-xs text-white/30">v2</span>
            {bot?.name && <span className="text-xs text-white/40">— {bot.name}</span>}
          </div>
          <div className="flex items-center gap-3">
            <SaveBadge />
            <button onClick={onClose}
              className="w-7 h-7 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-hidden flex min-h-0">

          {/* ── Tab sidebar ── */}
          <div className="w-[128px] border-r-2 border-black bg-white flex-shrink-0 flex flex-col overflow-y-auto wcv2-scroll">
            {TABS.map(t => (
              <TabBtn key={t.id} active={activeTab === t.id}
                onClick={() => setActiveTab(t.id)} icon={t.icon} label={t.label} />
            ))}
            <div className="mt-auto p-2">
              <button onClick={resetConfig}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-2 border-2 border-black text-[10px] font-bold text-red-600 hover:bg-red-50 transition-colors">
                <RotateCcw className="w-3 h-3" /> Reset All
              </button>
            </div>
          </div>

          {/* ── Controls panel ── */}
          <div className="w-[280px] border-r-2 border-black bg-nb-bg overflow-y-auto p-4 wcv2-scroll flex-shrink-0">
            {renderTab()}
          </div>

          {/* ── Preview panel ── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

            {/* preview toolbar */}
            <div className="px-4 py-2 border-b-2 border-black bg-white flex items-center gap-2 flex-shrink-0 flex-wrap">
              {/* device toggle */}
              <div className="flex border-2 border-black overflow-hidden flex-shrink-0">
                {[{v:'desktop',icon:Monitor},{v:'mobile',icon:Smartphone}].map(({v,icon:Icon}) => (
                  <button key={v} onClick={() => setPreviewMode(v)}
                    className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold transition-colors
                      ${previewMode === v ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}>
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline capitalize">{v}</span>
                  </button>
                ))}
              </div>

              {/* background toggle */}
              <div className="flex border-2 border-black overflow-hidden flex-shrink-0">
                {[{v:'light',label:'☀️ Light'},{v:'dark',label:'🌙 Dark'},{v:'check',label:'⬜ Grid'}].map(({v,label}) => (
                  <button key={v} onClick={() => setPreviewBg(v)}
                    className={`px-2.5 py-1.5 text-[11px] font-bold transition-colors
                      ${previewBg === v ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex-1" />

              {/* actions */}
              <button onClick={exportJSON}
                className={`nb-btn px-3 py-1.5 text-xs flex items-center gap-1.5 flex-shrink-0
                  ${jsonCopied ? 'bg-green-200 border-green-600' : 'bg-white border-black'}`}>
                <Download className="w-3 h-3" />
                {jsonCopied ? 'Copied!' : 'Export JSON'}
              </button>
              <button onClick={handleCopyCode}
                className={`nb-btn px-3 py-1.5 text-xs flex items-center gap-1.5 flex-shrink-0
                  ${copied ? 'bg-green-200 border-green-600' : 'bg-nb-yellow border-black'}`}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy Embed'}
              </button>
            </div>

            {/* iframe area */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-100/50">
              <div
                style={{
                  width:     previewMode === 'mobile' ? 393 : '100%',
                  height:    previewMode === 'mobile' ? 720 : '100%',
                  maxWidth:  previewMode === 'mobile' ? 393 : undefined,
                  flexShrink: 0,
                }}
                className="border-2 border-black shadow-nb bg-white overflow-hidden flex flex-col">
                {previewMode === 'mobile' && (
                  <div className="h-7 bg-black flex items-center justify-center flex-shrink-0">
                    <div className="w-24 h-2 bg-white/15 rounded-full" />
                  </div>
                )}
                <iframe ref={iframeRef} title="Widget Preview"
                  style={{ width:'100%', height: previewMode === 'mobile' ? 'calc(100% - 28px)' : '100%',  border:'none', display:'block' }} />
              </div>
            </div>

            <p className="text-[10px] text-nb-muted text-center py-1.5 flex-shrink-0 bg-white border-t border-black/10">
              💡 Preview updates live · Click the chat button in the preview to toggle the window
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WidgetCustomizer;
