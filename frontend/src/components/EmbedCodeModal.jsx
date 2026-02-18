import React, { useState, useEffect } from 'react';
import { X, Code, Copy, Check, Sparkles, FlaskConical, History, RotateCcw, RefreshCw, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import WidgetTemplates from './WidgetTemplates';
import WidgetCustomizer from './WidgetCustomizer';
import { botsService } from '../services/api';

/* ─── helpers ─── */
const CopyBtn = ({ text, id, copied, onCopy, color = 'bg-nb-yellow' }) => (
  <button onClick={() => onCopy(text, id)}
    className={`nb-btn px-3 py-1.5 text-xs flex items-center gap-1 flex-shrink-0 ${copied === id ? 'bg-green-200 border-green-600' : `${color} border-black`}`}>
    {copied === id ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy</>}
  </button>
);

const POSITIONS = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
const MAX_HISTORY = 10;

const EmbedCodeModal = ({ bot, setShowModal }) => {
  const botId = bot?._id || bot?.id;

  const [embedCode, setEmbedCode]           = useState('');
  const [iframeCode, setIframeCode]         = useState('');
  const [copied, setCopied]                 = useState('');
  const [activeTab, setActiveTab]           = useState('templates');
  const [showCustomizer, setShowCustomizer] = useState(false);

  // A/B Test
  const [abA, setAbA]       = useState({ color: bot?.color || '#4D9FFF', greeting: 'Hello! How can I help you?', position: 'bottom-right' });
  const [abB, setAbB]       = useState({ color: '#FF6B9D', greeting: 'Need help? Ask me anything!', position: 'bottom-left' });
  const [copiedAb, setCopiedAb] = useState('');

  // Version History (cloud)
  const [history, setHistory]               = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError]     = useState(null);
  const [restoredSnap, setRestoredSnap]     = useState(null);
  const [deletingId, setDeletingId]         = useState(null);

  /* ESC to close */
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setShowModal(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [setShowModal]);

  /* Generate embed code */
  useEffect(() => {
    if (!bot) return;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const widgetUrl = window.location.origin;
    setEmbedCode(`<!-- RAGhost Chat Widget -->
<script>
  (function() {
    window.raghostConfig = {
      botId: '${botId}',
      apiUrl: '${apiUrl}',
      botName: '${bot.name}',
      botType: '${bot.type}',
      color: '${bot.color}',
    };
    var script = document.createElement('script');
    script.src = '${widgetUrl}/widget.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`);
    setIframeCode(`<!-- RAGhost Chat Widget (iframe) -->
<iframe 
  src="${widgetUrl}/chat/${botId}" 
  width="400" 
  height="600" 
  frameborder="0"
  style="position: fixed; bottom: 20px; right: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 9999;"
></iframe>`);
  }, [bot]);

  /* Auto-save snapshot + load history on open */
  useEffect(() => {
    if (!botId) return;
    const init = async () => {
      setHistoryLoading(true); setHistoryError(null);
      try {
        await botsService.addEmbedSnapshot(botId, { color: bot.color, name: bot.name, type: bot.type });
        const res = await botsService.getEmbedHistory(botId);
        setHistory(res.data || []);
      } catch { setHistoryError('Could not load history from server.'); }
      finally { setHistoryLoading(false); }
    };
    init();
  }, []);

  /* Reload history when switching to history tab */
  useEffect(() => {
    if (activeTab !== 'history' || historyLoading) return;
    const reload = async () => {
      setHistoryLoading(true); setHistoryError(null);
      try { const r = await botsService.getEmbedHistory(botId); setHistory(r.data || []); }
      catch { setHistoryError('Could not load history from server.'); }
      finally { setHistoryLoading(false); }
    };
    reload();
  }, [activeTab]);

  /* Handlers */
  const handleBackdropClick = (e) => { if (e.target === e.currentTarget) setShowModal(false); };

  const copyToClipboard = async (text, id) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 2000); } catch {}
  };

  const copyAb = async (text, id) => {
    try { await navigator.clipboard.writeText(text); setCopiedAb(id); setTimeout(() => setCopiedAb(''), 2000); } catch {}
  };

  const genAbCode = (variant, label) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const widgetUrl = window.location.origin;
    return `<!-- RAGhost Widget – Variant ${label} -->
<script>
  (function() {
    window.raghostConfig = {
      botId: '${botId}',
      apiUrl: '${apiUrl}',
      botName: '${bot.name}',
      color: '${variant.color}',
      position: '${variant.position}',
      greeting: '${variant.greeting}',
      abVariant: '${label}',
    };
    var s = document.createElement('script');
    s.src = '${widgetUrl}/widget.js';
    s.async = true;
    document.body.appendChild(s);
  })();
</script>`;
  };

  const snapCode = (snap) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const widgetUrl = window.location.origin;
    return `<!-- RAGhost Widget – snapshot ${new Date(snap.savedAt).toLocaleString()} -->
<script>
  (function() {
    window.raghostConfig = {
      botId: '${botId}',
      apiUrl: '${apiUrl}',
      botName: '${snap.name}',
      botType: '${snap.type}',
      color: '${snap.color}',
    };
    var s = document.createElement('script');
    s.src = '${widgetUrl}/widget.js';
    s.async = true;
    document.body.appendChild(s);
  })();
</script>`;
  };

  const restoreSnapshot = async (snap) => {
    try { await navigator.clipboard.writeText(snapCode(snap)); } catch {}
    setRestoredSnap(snap);
    setTimeout(() => setRestoredSnap(null), 3000);
  };

  const deleteSnapshot = async (snap) => {
    setDeletingId(snap._id);
    try { const res = await botsService.deleteEmbedSnapshot(botId, snap._id); setHistory(res.data || []); }
    catch {} finally { setDeletingId(null); }
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 bg-black/60 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-nb-bg border-2 border-black shadow-nb-xl w-full max-w-4xl my-2 sm:my-4">

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-black bg-nb-blue/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center"><Code size={20} /></div>
            <div>
              <h2 className="text-xl font-bold text-nb-text">Embed Your Bot</h2>
              <p className="text-sm text-nb-muted">Add {bot?.name} to your website</p>
            </div>
          </div>
          <button onClick={() => setShowModal(false)} className="nb-btn bg-white p-2"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b-2 border-black bg-white">
          {[
            { id: 'templates',  label: 'Widget Templates' },
            { id: 'customizer', label: '✨ Live Customizer' },
            { id: 'custom',     label: 'Custom Embed' },
            { id: 'ab',         label: '🧪 A/B Test' },
            { id: 'history',    label: '🕑 History' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`px-4 py-2.5 font-bold text-xs border-r border-b border-black/20 transition-colors whitespace-nowrap ${activeTab === id ? 'bg-nb-yellow text-black border-b-transparent' : 'text-nb-muted hover:bg-gray-50 hover:text-black'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="p-3 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>

          {/* Templates */}
          {activeTab === 'templates' && <WidgetTemplates bot={bot} />}

          {/* Live Customizer */}
          {activeTab === 'customizer' && (
            <div className="bg-white border-2 border-black shadow-nb p-8 text-center">
              <div className="w-16 h-16 border-2 border-black bg-nb-yellow mx-auto mb-4 flex items-center justify-center"><Sparkles size={28} /></div>
              <h3 className="text-xl font-bold mb-2">Build Your Custom Widget</h3>
              <p className="text-nb-muted text-sm mb-6 max-w-md mx-auto">Adjust colors, sizes, positions, and more with instant preview.</p>
              <button onClick={() => setShowCustomizer(true)} className="nb-btn bg-black text-white border-black px-6 py-3">Open Live Customizer</button>
            </div>
          )}

          {/* Custom Embed */}
          {activeTab === 'custom' && (
            <div className="space-y-5">
              <div className="bg-white border-2 border-black shadow-nb-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div><h3 className="font-bold">Method 1: Script Tag (Recommended)</h3><p className="text-xs text-nb-muted mt-0.5">Add before the closing &lt;/body&gt; tag</p></div>
                  <CopyBtn text={embedCode} id="script" copied={copied} onCopy={copyToClipboard} color="bg-nb-yellow" />
                </div>
                <pre className="border-2 border-black bg-gray-900 text-green-400 font-mono text-xs p-4 overflow-x-auto"><code>{embedCode}</code></pre>
              </div>
              <div className="bg-white border-2 border-black shadow-nb-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div><h3 className="font-bold">Method 2: iFrame</h3><p className="text-xs text-nb-muted mt-0.5">Simple iframe embed</p></div>
                  <CopyBtn text={iframeCode} id="iframe" copied={copied} onCopy={copyToClipboard} color="bg-nb-pink" />
                </div>
                <pre className="border-2 border-black bg-gray-900 text-blue-400 font-mono text-xs p-4 overflow-x-auto"><code>{iframeCode}</code></pre>
              </div>
              <div className="bg-white border-2 border-black shadow-nb-sm p-5">
                <h3 className="font-bold mb-3">Setup Instructions</h3>
                <ol className="space-y-2 text-sm text-nb-text">
                  {['Copy the embed code above', "Paste into your website's HTML, before </body>", 'Save and publish your changes', 'The chat widget will appear on your site!'].map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-6 h-6 border-2 border-black bg-nb-yellow flex items-center justify-center font-bold text-xs flex-shrink-0">{i+1}</div>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* A/B Test Generator */}
          {activeTab === 'ab' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-lg">A/B Test Generator</h3>
                <p className="text-xs text-nb-muted mt-0.5">Two embed variants with different configs to split-test on your site.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{ label: 'A', state: abA, setState: setAbA, bg: 'bg-nb-blue' }, { label: 'B', state: abB, setState: setAbB, bg: 'bg-nb-pink' }].map(({ label, state, setState, bg }) => (
                  <div key={label} className={`${bg} border-2 border-black shadow-nb p-4 space-y-3`}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 border-2 border-black bg-white font-black flex items-center justify-center text-sm">{label}</div>
                      <span className="font-bold">Variant {label}</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-bold block mb-1">Widget Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={state.color} onChange={e => setState(s => ({ ...s, color: e.target.value }))} className="w-10 h-8 border-2 border-black cursor-pointer bg-white" />
                          <input type="text" value={state.color} onChange={e => setState(s => ({ ...s, color: e.target.value }))} className="nb-input text-xs py-1.5 flex-1 bg-white" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">Greeting Message</label>
                        <input type="text" value={state.greeting} onChange={e => setState(s => ({ ...s, greeting: e.target.value }))} className="nb-input text-xs py-1.5 w-full bg-white" placeholder="Hello! How can I help?" />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">Position</label>
                        <select value={state.position} onChange={e => setState(s => ({ ...s, position: e.target.value }))} className="nb-input text-xs py-1.5 w-full bg-white">
                          {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold">Generated Code</span>
                        <CopyBtn text={genAbCode(state, label)} id={`ab-${label}`} copied={copiedAb} onCopy={copyAb} color="bg-white" />
                      </div>
                      <pre className="border-2 border-black bg-gray-900 text-green-400 font-mono text-xs p-3 overflow-x-auto max-h-36"><code>{genAbCode(state, label)}</code></pre>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white border-2 border-black shadow-nb-sm p-4">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><FlaskConical size={15} />How to use A/B testing</h4>
                <ol className="space-y-1.5 text-sm text-nb-muted">
                  {['Copy Variant A → paste into 50% of your pages (server-side logic or feature flag)', 'Copy Variant B → paste into the other 50%', 'Track engagement via your analytics tool (GA4, Mixpanel, etc.)', 'The abVariant field lets you filter events by variant'].map((s, i) => (
                    <li key={i} className="flex gap-2"><span className="font-bold text-black flex-shrink-0">{i+1}.</span>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Version History (cloud) */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Version History</h3>
                  <p className="text-xs text-nb-muted mt-0.5">Embed config snapshots for <span className="font-bold text-black">{bot?.name}</span> — stored in the cloud ☁️</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-nb-muted border-2 border-black px-2 py-1 bg-white">{history.length} / {MAX_HISTORY}</span>
                  <button onClick={async () => {
                    setHistoryLoading(true); setHistoryError(null);
                    try { const r = await botsService.getEmbedHistory(botId); setHistory(r.data || []); }
                    catch { setHistoryError('Failed to reload.'); } finally { setHistoryLoading(false); }
                  }} className="nb-btn bg-white border-black px-3 py-1.5 text-xs flex items-center gap-1">
                    <RefreshCw size={12} />Refresh
                  </button>
                </div>
              </div>

              {restoredSnap && (
                <div className="bg-green-100 border-2 border-green-500 p-3 flex items-center gap-2 text-sm font-bold text-green-800">
                  <Check size={15} />Snapshot from {new Date(restoredSnap.savedAt).toLocaleString()} copied to clipboard!
                </div>
              )}

              {historyLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={22} className="animate-spin mr-2 text-nb-muted" />
                  <span className="font-bold text-nb-muted">Loading history…</span>
                </div>
              )}

              {historyError && (
                <div className="bg-red-50 border-2 border-red-400 p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{historyError}</p>
                </div>
              )}

              {!historyLoading && !historyError && history.length === 0 && (
                <div className="text-center py-12 text-nb-muted">
                  <History size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="font-bold">No history yet.</p>
                  <p className="text-xs mt-1">Snapshots are auto-saved each time you open this modal.</p>
                </div>
              )}

              {!historyLoading && history.length > 0 && (
                <div className="space-y-3">
                  {history.map((snap, i) => (
                    <div key={snap._id} className={`bg-white border-2 border-black shadow-nb-sm p-4 ${i === 0 ? 'ring-2 ring-nb-yellow ring-offset-1' : ''}`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black bg-nb-yellow border border-black px-1.5 py-0.5">{i === 0 ? 'CURRENT' : `v${history.length - i}`}</span>
                            <span className="text-xs font-bold text-nb-muted">{new Date(snap.savedAt).toLocaleString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-nb-muted">
                            <span>Color: <span className="font-bold" style={{ color: snap.color }}>{snap.color || '—'}</span></span>
                            <span>Type: <span className="font-bold text-black">{snap.type || '—'}</span></span>
                            <span>Name: <span className="font-bold text-black">{snap.name}</span></span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <CopyBtn text={snapCode(snap)} id={`snap-${snap._id}`} copied={copied} onCopy={copyToClipboard} color="bg-nb-yellow" />
                          {i !== 0 && (
                            <button onClick={() => restoreSnapshot(snap)} className="nb-btn bg-nb-blue border-black px-3 py-1.5 text-xs flex items-center gap-1">
                              <RotateCcw size={12} />Restore
                            </button>
                          )}
                          {i !== 0 && (
                            <button onClick={() => deleteSnapshot(snap)} disabled={deletingId === snap._id}
                              className="nb-btn bg-red-100 border-red-400 text-red-600 px-2 py-1.5 text-xs flex items-center disabled:opacity-50">
                              {deletingId === snap._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            </button>
                          )}
                        </div>
                      </div>
                      <pre className="border border-gray-200 bg-gray-900 text-green-400 font-mono text-xs p-3 overflow-x-auto max-h-28"><code>{snapCode(snap)}</code></pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {showCustomizer && <WidgetCustomizer bot={bot} onClose={() => setShowCustomizer(false)} />}
    </div>
  );
};

export default EmbedCodeModal;

