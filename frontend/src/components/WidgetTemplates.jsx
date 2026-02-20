import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const WidgetTemplates = ({ bot }) => {
  const [copied, setCopied] = useState('');
  const [selected, setSelected] = useState('minimal');
  const apiUrl = import.meta.env.VITE_API_URL || 'https://raghost-pcgw.onrender.com';
  const widgetUrl = window.location.origin || 'https://rag-host.vercel.app';
  const botId = bot?._id || bot?.id;

  const makeCode = (templateId) =>
    `<!-- RAGhost Chat Widget - ${templateId} -->\n<script>\n  window.RAGhostConfig = {\n    botId: '${botId || 'YOUR_BOT_ID'}',\n    apiUrl: '${apiUrl}',\n    botName: '${(bot?.name || 'AI Assistant').replace(/'/g, "\\\\'") }',\n    botType: '${bot?.type || 'Support'}',\n    template: '${templateId}',\n    welcomeMessage: 'Hi! How can I help you today? 👋'\n  };\n<\/script>\n<script src="${widgetUrl}/widget/widget-new.js" async><\/script>`;

  const templates = [
    {
      id: 'minimal',
      name: 'Minimal',
      emoji: '⬜',
      tagline: 'Pure. Clean. Invisible.',
      description: 'Zero decoration, total focus on content. White background, black type, no distractions.',
      badge: 'bg-gray-100 text-gray-800',
      features: ['Floating Bubble', 'Zero Distractions', 'Mobile Ready', 'Session Persist', 'Zero Deps'],
      preview: (
        <div style={{ fontFamily: 'system-ui', background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12, fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 8, marginBottom: 8 }}>
            <span style={{ fontWeight: 700 }}>Assistant</span>
            <span style={{ color: '#999', fontSize: 10 }}>●  Online</span>
          </div>
          <div style={{ background: '#f5f5f5', borderRadius: 4, padding: '6px 10px', marginBottom: 6, fontSize: 11 }}>How can I help you today?</div>
          <div style={{ background: '#000', color: '#fff', borderRadius: 4, padding: '6px 10px', marginBottom: 8, fontSize: 11, textAlign: 'right' }}>Tell me about pricing</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <input style={{ flex: 1, border: '1px solid #ddd', borderRadius: 4, padding: '4px 8px', fontSize: 11 }} placeholder="Type here..." readOnly />
            <button style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11 }}>→</button>
          </div>
        </div>
      ),
    },
    {
      id: 'neumorphism',
      name: 'Neumorphism',
      emoji: '🔘',
      tagline: 'Soft. Extruded. Tactile.',
      description: 'Soft light morphism — elements appear pushed out or inset from a matte surface.',
      badge: 'bg-indigo-100 text-indigo-700',
      features: ['Floating Bubble', 'Soft Shadows', 'Tactile UI', 'Mobile Ready', 'Zero Deps'],
      preview: (
        <div style={{ fontFamily: 'system-ui', background: '#E0E5EC', borderRadius: 16, padding: 14, fontSize: 12 }}>
          <div style={{ background: '#E0E5EC', boxShadow: '5px 5px 10px #b8bec7, -5px -5px 10px #fff', borderRadius: 12, padding: '8px 12px', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 11 }}>AI Assistant</span>
          </div>
          <div style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px #b8bec7, inset -3px -3px 6px #fff', borderRadius: 10, padding: '6px 10px', marginBottom: 6, fontSize: 11 }}>Hello! How can I assist?</div>
          <div style={{ background: '#6C63FF', boxShadow: '3px 3px 6px #b8bec7', borderRadius: 10, padding: '6px 10px', marginBottom: 8, fontSize: 11, color: '#fff', textAlign: 'right' }}>Show me options</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, background: '#E0E5EC', boxShadow: 'inset 2px 2px 5px #b8bec7, inset -2px -2px 5px #fff', borderRadius: 8, padding: '5px 8px', fontSize: 11, color: '#999' }}>Type a message...</div>
            <div style={{ background: '#6C63FF', boxShadow: '3px 3px 6px #b8bec7', borderRadius: 8, padding: '5px 10px', color: '#fff', fontSize: 11 }}>→</div>
          </div>
        </div>
      ),
    },
    {
      id: 'glassmorphism',
      name: 'Glassmorphism',
      emoji: '🪟',
      tagline: 'Frosted. Layered. Ethereal.',
      description: 'Translucent frosted glass panels floating over vibrant gradient backgrounds.',
      badge: 'bg-blue-100 text-blue-700',
      features: ['Floating Bubble', 'Backdrop Blur', 'Glass Effect', 'Mobile Ready', 'Zero Deps'],
      preview: (
        <div style={{ fontFamily: 'system-ui', background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: 12, padding: 12, fontSize: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 10, padding: 10 }}>
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: 6, fontSize: 11 }}>✦ AI Assistant</div>
            <div style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 8, padding: '5px 8px', color: '#fff', marginBottom: 5, fontSize: 10 }}>Hi! How can I help you?</div>
            <div style={{ background: 'rgba(0,210,255,0.5)', borderRadius: 8, padding: '5px 8px', color: '#fff', marginBottom: 8, fontSize: 10, textAlign: 'right' }}>What can you do?</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '4px 8px', fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Type here...</div>
              <div style={{ background: 'rgba(0,210,255,0.7)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 11 }}>→</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'neo-brutalism',
      name: 'Neo-Brutalism',
      emoji: '⬛',
      tagline: 'Bold. Raw. Unapologetic.',
      description: 'Hard black borders, flat shadows, and primary color blocks. Brutally honest design.',
      badge: 'bg-yellow-100 text-yellow-800',
      features: ['Floating Bubble', 'Hard Borders', 'Flat Shadows', 'Mobile Ready', 'Zero Deps'],
      preview: (
        <div style={{ fontFamily: 'Space Grotesk, system-ui', background: '#FFFEF0', border: '2px solid #000', padding: 10, fontSize: 12 }}>
          <div style={{ background: '#FFE500', border: '2px solid #000', padding: '5px 10px', marginBottom: 8, fontWeight: 900, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span>AI ASSISTANT</span><span>×</span>
          </div>
          <div style={{ border: '2px solid #000', padding: '5px 8px', marginBottom: 5, fontSize: 10, boxShadow: '2px 2px 0 #000' }}>Hello! How can I help?</div>
          <div style={{ border: '2px solid #000', background: '#000', color: '#FFE500', padding: '5px 8px', marginBottom: 8, fontSize: 10, boxShadow: '2px 2px 0 #FFE500', textAlign: 'right' }}>Tell me more</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <input style={{ flex: 1, border: '2px solid #000', padding: '4px 8px', fontSize: 10, background: '#fff' }} placeholder="Type..." readOnly />
            <button style={{ background: '#000', color: '#FFE500', border: '2px solid #000', padding: '4px 10px', fontWeight: 900, fontSize: 11, boxShadow: '2px 2px 0 #666' }}>→</button>
          </div>
        </div>
      ),
    },
    {
      id: 'material',
      name: 'Material',
      emoji: '🔵',
      tagline: 'Elevated. Systematic. Google.',
      description: 'Material Design 3 — tonal surfaces, dynamic color, and motion-ready depth system.',
      badge: 'bg-purple-100 text-purple-700',
      features: ['Floating Bubble', 'Material 3', 'Tonal Color', 'Motion Ready', 'Zero Deps'],
      preview: (
        <div style={{ fontFamily: 'Roboto, system-ui', background: '#FEF7FF', borderRadius: 28, padding: 12, fontSize: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.12),0 1px 2px rgba(0,0,0,0.08)' }}>
          <div style={{ background: '#6750A4', borderRadius: '28px 28px 4px 4px', padding: '8px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 500, fontSize: 11 }}>AI Assistant</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 10, padding: '2px 6px', fontSize: 9 }}>Online</span>
          </div>
          <div style={{ background: '#ECE6F0', borderRadius: '4px 16px 16px 16px', padding: '6px 10px', marginBottom: 5, fontSize: 10, color: '#1D1B20' }}>Hello! How can I help you?</div>
          <div style={{ background: '#6750A4', borderRadius: '16px 16px 4px 16px', padding: '6px 10px', marginBottom: 8, fontSize: 10, color: '#fff', textAlign: 'right' }}>Show me features</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ flex: 1, background: '#ECE6F0', borderRadius: 20, padding: '5px 12px', fontSize: 10, color: '#49454F' }}>Message...</div>
            <div style={{ background: '#6750A4', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>↑</div>
          </div>
        </div>
      ),
    },
    {
      id: 'fluent',
      name: 'Fluent',
      emoji: '🪁',
      tagline: 'Airy. Acrylic. Microsoft.',
      description: 'Fluent Design System — acrylic blur, reveal highlight, and connected motion.',
      badge: 'bg-sky-100 text-sky-700',
      features: ['Floating Bubble', 'Acrylic Blur', 'Reveal Highlight', 'Mobile Ready', 'Zero Deps'],
      preview: (
        <div style={{ fontFamily: 'Segoe UI, system-ui', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,120,212,0.2)', borderRadius: 8, padding: 10, fontSize: 12, boxShadow: '0 8px 32px rgba(0,120,212,0.1)' }}>
          <div style={{ borderBottom: '1px solid rgba(0,120,212,0.15)', paddingBottom: 7, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0078D4' }} />
            <span style={{ fontWeight: 600, color: '#0078D4', fontSize: 11 }}>AI Assistant</span>
          </div>
          <div style={{ background: '#F3F9FF', border: '1px solid rgba(0,120,212,0.12)', borderRadius: 6, padding: '5px 9px', marginBottom: 5, fontSize: 10, color: '#201f1e' }}>Hello! How can I assist you?</div>
          <div style={{ background: '#0078D4', borderRadius: 6, padding: '5px 9px', marginBottom: 8, fontSize: 10, color: '#fff', textAlign: 'right' }}>What do you offer?</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ flex: 1, border: '1px solid rgba(0,120,212,0.25)', borderRadius: 4, padding: '4px 8px', fontSize: 10, color: '#a19f9d', background: 'rgba(255,255,255,0.9)' }}>Ask me anything...</div>
            <div style={{ background: '#0078D4', borderRadius: 4, padding: '4px 10px', color: '#fff', fontSize: 11 }}>→</div>
          </div>
        </div>
      ),
    },
    {
      id: 'dark-saas',
      name: 'Dark SaaS',
      emoji: '🌑',
      tagline: 'Polished. Premium. Midnight.',
      description: 'The premium SaaS dark — glowing accents, subtle gradients, and refined typography.',
      badge: 'bg-violet-100 text-violet-700',
      features: ['Floating Bubble', 'Dark Mode', 'Glow Accents', 'Session Persist', 'Zero Deps'],
      preview: (
        <div style={{ fontFamily: 'Inter, system-ui', background: '#0F0F1A', borderRadius: 12, padding: 12, fontSize: 12, border: '1px solid rgba(124,58,237,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9, paddingBottom: 7, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✦</div>
            <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 11 }}>AI Assistant</span>
            <span style={{ marginLeft: 'auto', fontSize: 9, background: 'rgba(124,58,237,0.2)', color: '#7C3AED', padding: '2px 6px', borderRadius: 4 }}>PRO</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 9px', marginBottom: 5, fontSize: 10, color: '#cbd5e1' }}>Hello! How can I help?</div>
          <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.8),rgba(236,72,153,0.7))', borderRadius: 8, padding: '5px 9px', marginBottom: 8, fontSize: 10, color: '#fff', textAlign: 'right' }}>Show pricing</div>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '4px 9px', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Ask anything...</div>
            <div style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', borderRadius: 7, padding: '4px 10px', color: '#fff', fontSize: 11 }}>↑</div>
          </div>
        </div>
      ),
    },
    {
      id: 'retro-y2k',
      name: 'Retro / Y2K',
      emoji: '💾',
      tagline: 'Chunky. Chrome. 2000s.',
      description: 'Y2K era aesthetic — chrome gradients, pixel fonts, bubbly UI and nostalgic neon.',
      badge: 'bg-pink-100 text-pink-700',
      features: ['Floating Bubble', 'Y2K Aesthetic', 'Neon Effects', 'Mobile Ready', 'Zero Deps'],
      preview: (
        <div style={{ fontFamily: '"Courier New", monospace', background: 'linear-gradient(180deg,#0A0030,#1A0050)', borderRadius: 6, padding: 10, fontSize: 11, border: '2px solid #FF00FF', boxShadow: '0 0 12px rgba(255,0,255,0.4), inset 0 0 20px rgba(255,0,255,0.05)' }}>
          <div style={{ background: 'linear-gradient(90deg,#FF00FF,#00FFFF)', padding: '4px 10px', marginBottom: 8, borderRadius: 3, display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ fontWeight: 900, color: '#000' }}>✦ CHAT_BOT.EXE</span>
            <span style={{ color: '#000' }}>▪▪▪</span>
          </div>
          <div style={{ border: '1px solid rgba(0,255,255,0.4)', padding: '5px 8px', marginBottom: 5, fontSize: 10, color: '#00FFFF', background: 'rgba(0,255,255,0.05)' }}>HELLO USER. READY TO ASSIST.</div>
          <div style={{ border: '1px solid rgba(255,0,255,0.5)', padding: '5px 8px', marginBottom: 8, fontSize: 10, color: '#FF00FF', background: 'rgba(255,0,255,0.05)', textAlign: 'right' }}>ACCESS GRANTED!</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ flex: 1, border: '1px solid #FF00FF', padding: '3px 7px', fontSize: 10, color: '#FF00FF', background: 'transparent' }}>ENTER COMMAND_</div>
            <div style={{ background: 'linear-gradient(135deg,#FF00FF,#00FFFF)', color: '#000', padding: '3px 9px', fontWeight: 900, fontSize: 11 }}>OK</div>
          </div>
        </div>
      ),
    },
    {
      id: 'skeuomorphic',
      name: 'Skeuomorphic',
      emoji: '🪵',
      tagline: 'Textured. Real. Physical.',
      description: 'Real-world materials — leather stitching, paper textures, and depth that mimics objects.',
      badge: 'bg-amber-100 text-amber-800',
      features: ['Floating Bubble', 'Real Textures', 'Physical Depth', 'Classic UI', 'Zero Deps'],
      preview: (
        <div style={{ fontFamily: 'Georgia, serif', background: 'linear-gradient(145deg,#f5e6c8,#e8d5a0)', borderRadius: 8, padding: 10, fontSize: 12, border: '3px solid #8B5E3C', boxShadow: '0 4px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
          <div style={{ background: 'linear-gradient(180deg,#a0522d,#7a3f1e)', borderRadius: '6px 6px 0 0', padding: '6px 12px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            <span style={{ color: '#f5deb3', fontWeight: 700, fontSize: 11, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>AI Assistant</span>
            <span style={{ color: '#f5deb3', fontSize: 11 }}>✕</span>
          </div>
          <div style={{ background: 'linear-gradient(180deg,#fff9ee,#fdf0d5)', border: '1px solid #c8a87a', borderRadius: 5, padding: '5px 9px', marginBottom: 5, fontSize: 10, color: '#3d2b1f', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>Hello! How may I assist?</div>
          <div style={{ background: 'linear-gradient(180deg,#8B5E3C,#6b4226)', border: '1px solid #5a3520', borderRadius: 5, padding: '5px 9px', marginBottom: 8, fontSize: 10, color: '#f5deb3', textAlign: 'right', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }}>Tell me more</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ flex: 1, background: 'linear-gradient(180deg,#fdf8ee,#f5e6c8)', border: '1px solid #c8a87a', borderRadius: 4, padding: '4px 8px', fontSize: 10, color: '#999', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>Type here...</div>
            <div style={{ background: 'linear-gradient(180deg,#a0522d,#7a3f1e)', border: '1px solid #5a3520', borderRadius: 4, padding: '4px 9px', color: '#f5deb3', fontSize: 11, boxShadow: '0 2px 3px rgba(0,0,0,0.3)' }}>→</div>
          </div>
        </div>
      ),
    },
    {
      id: 'enterprise-dense',
      name: 'Enterprise Dense',
      emoji: '📊',
      tagline: 'Data-rich. Compact. Precise.',
      description: 'Maximum information density — monospace data, status indicators, and tabular precision.',
      badge: 'bg-blue-100 text-blue-800',
      features: ['Floating Bubble', 'Data Dense', 'Monospace Type', 'Enterprise Grade', 'Zero Deps'],
      preview: (
        <div style={{ fontFamily: '"Courier New", monospace', background: '#F8F9FA', borderRadius: 4, padding: 10, fontSize: 11, border: '1px solid #dee2e6' }}>
          <div style={{ background: '#0D6EFD', padding: '4px 10px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 10, letterSpacing: '0.05em' }}>SUPPORT AGENT v2.1</span>
            <span style={{ background: '#28a745', color: '#fff', fontSize: 8, padding: '1px 5px', borderRadius: 2 }}>LIVE</span>
          </div>
          <div style={{ borderLeft: '3px solid #0D6EFD', paddingLeft: 7, marginBottom: 5 }}>
            <div style={{ fontSize: 9, color: '#6c757d' }}>SYS 09:42:01</div>
            <div style={{ fontSize: 10, color: '#212529' }}>Session initialized. How may I assist?</div>
          </div>
          <div style={{ borderLeft: '3px solid #28a745', paddingLeft: 7, marginBottom: 8, textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: '#6c757d' }}>USR 09:42:10</div>
            <div style={{ fontSize: 10, color: '#212529' }}>Query: product roadmap</div>
          </div>
          <div style={{ display: 'flex', gap: 4, borderTop: '1px solid #dee2e6', paddingTop: 6 }}>
            <div style={{ flex: 1, background: '#fff', border: '1px solid #ced4da', padding: '3px 7px', fontSize: 10, color: '#6c757d' }}>Enter query...</div>
            <div style={{ background: '#0D6EFD', color: '#fff', padding: '3px 9px', fontSize: 10, fontWeight: 700 }}>SEND</div>
          </div>
        </div>
      ),
    },
  ];

  const copyToClipboard = async (id) => {
    try {
      await navigator.clipboard.writeText(makeCode(id));
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selected);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold">Widget Templates</h2>
        <p className="text-nb-muted text-sm mt-0.5">10 unique styles for every brand and website</p>
      </div>

      {/* Template picker grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`text-left border-2 p-3 transition-all duration-100 ${
              selected === t.id
                ? 'border-black shadow-nb -translate-x-0.5 -translate-y-0.5 bg-nb-yellow'
                : 'border-black bg-white hover:bg-nb-yellow/30 hover:shadow-nb-sm'
            }`}
          >
            <div className="text-2xl mb-1.5">{t.emoji}</div>
            <div className="font-bold text-xs leading-tight">{t.name}</div>
            <div className="text-nb-muted text-xs mt-0.5 leading-tight">{t.tagline}</div>
          </button>
        ))}
      </div>

      {/* Selected template detail */}
      {selectedTemplate && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Info + Code */}
          <div className="bg-white border-2 border-black shadow-nb p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-4xl">{selectedTemplate.emoji}</div>
              <div>
                <h3 className="text-xl font-bold">{selectedTemplate.name}</h3>
                <span className={`inline-block text-xs font-bold px-2 py-0.5 border border-black mt-1 ${selectedTemplate.badge}`}>
                  {selectedTemplate.tagline}
                </span>
              </div>
            </div>

            <p className="text-nb-muted text-sm leading-relaxed">{selectedTemplate.description}</p>

            <div className="flex flex-wrap gap-2">
              {(selectedTemplate.features || ['Floating Bubble', 'Markdown Support', 'Mobile Ready', 'Session Persist', 'Zero Deps']).map(f => (
                <span key={f} className="text-xs font-bold px-2 py-1 border-2 border-black bg-nb-bg">{f}</span>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-nb-muted uppercase tracking-wide">Embed Code</span>
                <button
                  onClick={() => copyToClipboard(selectedTemplate.id)}
                  className={`nb-btn px-3 py-1.5 text-xs font-bold ${
                    copied === selectedTemplate.id
                      ? 'bg-green-200 border-green-700 text-green-800'
                      : 'bg-black text-white border-black'
                  }`}
                >
                  {copied === selectedTemplate.id
                    ? <><Check size={12} className="inline mr-1" />Copied!</>
                    : <><Copy size={12} className="inline mr-1" />Copy Code</>}
                </button>
              </div>
              <pre className="border-2 border-black bg-gray-900 text-green-400 font-mono text-xs p-4 overflow-x-auto leading-relaxed">
                <code>{makeCode(selectedTemplate.id)}</code>
              </pre>
            </div>
          </div>

          {/* Right: Preview + Instructions */}
          <div className="space-y-4">
            <div className="bg-white border-2 border-black shadow-nb p-5">
              <div className="text-xs font-bold text-nb-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                Live Preview
              </div>
              {selectedTemplate.preview}
            </div>

            <div className="bg-nb-yellow border-2 border-black shadow-nb p-5">
              <h4 className="font-bold text-sm mb-3">How to install</h4>
              <ol className="space-y-2">
                {[
                  'Choose your template above',
                  'Click "Copy Code" to copy the embed snippet',
                  'Paste before the closing </body> tag on your site',
                  'Deploy — the widget appears instantly as a floating bubble',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-black text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-xs">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetTemplates;
