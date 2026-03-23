import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView as useIOView } from 'react-intersection-observer';
import {
  Bot, Zap, Shield, Upload, Code2, BarChart3, MessageSquare,
  ArrowRight, Database, Cpu, Globe, Lock, FileText, Layers,
  Terminal, Star, Menu, X, Github, Play, Hash, Braces, Box,
  Server, Flame, TreePine, Gem, CircleDot, Triangle,
  Copy, Check, ArrowUpRight, Workflow, Eye, Puzzle,
  ChevronDown, MousePointerClick, Sparkles
} from 'lucide-react';

/* ═══════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 44 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }
  })
};

const slideL = {
  hidden: { opacity: 0, x: -70 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } }
};

const slideR = {
  hidden: { opacity: 0, x: 70 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } }
};

/* ─── reveal wrapper ─── */
function Reveal({ children, className = '', variants = fadeUp, custom = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={variants} custom={custom} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── mouse-tracking tilt card ─── */
function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleMouse = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── grid bg ─── */
function GridBg({ className = '', dotted = false }) {
  if (dotted) {
    return (
      <div className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>
    );
  }
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:52px_52px]" />
    </div>
  );
}

/* ─── gradient orb ─── */
function GlowOrb({ className = '', color = 'bg-nb-yellow/20' }) {
  return <div className={`absolute rounded-full blur-3xl animate-glow-pulse pointer-events-none ${color} ${className}`} aria-hidden />;
}

/* ─── typing hook ─── */
function useTyping(text, speed = 30, delay = 0) {
  const [out, setOut] = useState('');
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!go) return;
    let i = 0;
    const iv = setInterval(() => { if (i <= text.length) { setOut(text.slice(0, i)); i++; } else clearInterval(iv); }, speed);
    return () => clearInterval(iv);
  }, [text, speed, go]);
  return { out, done: out.length === text.length && go };
}

/* ─── copy button ─── */
function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded border border-white/10 transition-colors z-10" aria-label="Copy">
      {ok ? <Check className="w-3.5 h-3.5 text-nb-green" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
    </button>
  );
}

/* ═══════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════ */
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Stack', href: '#stack' },
    { label: 'Open Source', href: '#oss' },
  ];

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-nb-bg/95 backdrop-blur-md border-b-3 border-black shadow-[0_4px_0_0_#000]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-nb-yellow border-3 border-black rounded flex items-center justify-center shadow-nb-sm group-hover:shadow-nb transition-shadow">
            <Bot className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight">RAGHost</span>
        </a>
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => <a key={l.href} href={l.href} className="px-4 py-2 text-sm font-semibold hover:bg-black/5 rounded transition-colors">{l.label}</a>)}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <a href="https://github.com/pavankumar-vh/RAGHost" target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-sm bg-white text-black"><Github className="w-4 h-4" />GitHub</a>
          <Link to="/auth" className="nb-btn nb-btn-sm bg-nb-yellow text-black">Get Started<ArrowRight className="w-4 h-4" /></Link>
        </div>
        <button className="md:hidden p-2 border-2 border-black rounded bg-white shadow-nb-sm active:shadow-none active:translate-x-0.5 active:translate-y-0.5" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-nb-bg border-b-3 border-black shadow-[0_4px_0_0_#000] overflow-hidden">
            <div className="px-4 pb-4">
              {links.map(l => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 text-sm font-semibold border-b border-gray-200 last:border-0">{l.label}</a>)}
              <div className="flex flex-col gap-2 mt-4">
                <a href="https://github.com/pavankumar-vh/RAGHost" target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-sm bg-white text-black justify-center"><Github className="w-4 h-4" />GitHub</a>
                <Link to="/auth" className="nb-btn nb-btn-sm bg-nb-yellow text-black justify-center" onClick={() => setOpen(false)}>Get Started<ArrowRight className="w-4 h-4" /></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════
   HERO
   ═══════════════════════════════════════ */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const mockupY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const mockupRotate = useTransform(scrollYProgress, [0, 0.5], [2, -1]);
  const botMsg = useTyping('Based on your docs, you can reset it from Settings > Security. Want me to walk you through it?', 22, 2000);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <GridBg />
      {/* Ambient orbs */}
      <GlowOrb className="w-72 h-72 top-20 -left-20" color="bg-nb-yellow/15" />
      <GlowOrb className="w-56 h-56 bottom-20 right-10" color="bg-nb-pink/10" />
      <GlowOrb className="w-40 h-40 top-1/2 left-1/3" color="bg-nb-blue/8" />

      {/* Floating geometry */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <motion.div className="absolute top-24 left-[7%] w-12 h-12 border-3 border-black/8 rounded rotate-12"
          animate={{ y: [0, -16, 0], rotate: [12, -4, 12] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute top-44 right-[9%] w-9 h-9 border-3 border-nb-pink/15 rounded-full"
          animate={{ y: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
        <motion.div className="absolute bottom-40 left-[14%] w-7 h-7 border-3 border-nb-blue/12 rotate-45"
          animate={{ rotate: [45, 135, 45] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
        <div className="absolute top-[38%] left-[3%] grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div key={i} className="w-1 h-1 rounded-full bg-black/6" animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
        <div className="absolute bottom-[25%] right-[4%] grid grid-cols-4 gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div key={i} className="w-1 h-1 rounded-full bg-black/5" animate={{ opacity: [0.15, 0.5, 0.15] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Copy */}
          <motion.div style={{ y: heroY }} className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded shadow-nb-sm text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-nb-green animate-pulse" />
                Open Source — MIT License
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold leading-[1.08] tracking-tight">
              Ship RAG Chatbots{' '}
              <span className="relative inline-block">
                <span className="relative z-10">That Actually</span>
                <motion.span className="absolute bottom-1 left-0 right-0 h-3 sm:h-4 bg-nb-yellow -z-0"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ originX: 0 }} />
              </span>{' '}
              <span className="text-nb-pink">Know Your Stuff</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 text-lg sm:text-xl text-nb-muted max-w-lg leading-relaxed">
              Drop in your docs. Get an embeddable chatbot grounded in your knowledge base. Self-host or deploy to Vercel in under 10 minutes.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap gap-3 mt-8">
              <Link to="/auth" className="nb-btn nb-btn-lg bg-nb-yellow text-black text-base">
                Start Building<ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="nb-btn nb-btn-lg bg-white text-black text-base">
                <Play className="w-5 h-5" />How It Works
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-10 text-sm text-nb-muted">
              {[{ icon: Lock, t: 'AES-256 encryption' }, { icon: Zap, t: '<200ms responses' }, { icon: Globe, t: 'Deploy anywhere' }].map(({ icon: I, t }) => (
                <span key={t} className="flex items-center gap-1.5"><I className="w-3.5 h-3.5" />{t}</span>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual — parallax tiltable mockup */}
          <motion.div style={{ y: mockupY, rotate: mockupRotate }}
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block perspective-[1200px]">
            <TiltCard>
              {/* Depth layers */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 bg-black/50 rounded-xl blur-sm" />
              <div className="absolute inset-0 translate-x-2 translate-y-2 bg-black rounded-xl" />

              <div className="relative bg-white border-3 border-black rounded-xl overflow-hidden" style={{ transform: 'translateZ(20px)' }}>
                {/* Chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b-3 border-black bg-nb-bg">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#DEA123]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]" />
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="flex items-center gap-2 bg-white border-2 border-black rounded px-3 py-1">
                      <Lock className="w-3 h-3 text-nb-green" />
                      <span className="text-xs font-mono text-nb-muted">rag-host.vercel.app/dashboard</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard */}
                <div className="p-4 bg-nb-bg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-nb-yellow border-2 border-black rounded flex items-center justify-center"><Bot className="w-3.5 h-3.5" /></div>
                      <span className="font-bold text-sm">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-nb-green" /><span className="text-[10px] font-bold text-nb-muted">3 bots active</span></div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[{ l: 'Messages', v: '12.4k', d: '+18%', c: 'text-nb-green' }, { l: 'Sessions', v: '3.2k', d: '+7%', c: 'text-nb-green' }, { l: 'Avg Resp', v: '142ms', d: '-12ms', c: 'text-nb-blue' }].map(m => (
                      <div key={m.l} className="bg-white border-2 border-black rounded p-2">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-nb-muted">{m.l}</p>
                        <p className="text-sm font-bold mt-0.5">{m.v}</p>
                        <p className={`text-[8px] font-bold ${m.c}`}>{m.d}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bots */}
                  <div className="space-y-1.5">
                    {[{ n: 'Support Bot', bg: 'bg-nb-blue', m: '2,418', live: true }, { n: 'Sales AI', bg: 'bg-nb-pink', m: '891', live: true }, { n: 'Internal Docs', bg: 'bg-nb-purple', m: '1,204', live: false }].map((b, i) => (
                      <motion.div key={b.n} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex items-center gap-2 p-2 bg-white border-2 border-black rounded shadow-[2px_2px_0_0_#000]">
                        <div className={`w-6 h-6 ${b.bg} border-2 border-black rounded flex items-center justify-center`}><MessageSquare className="w-3 h-3 text-white" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold truncate">{b.n}</p>
                          <p className="text-[8px] text-nb-muted">{b.m} msgs</p>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${b.live ? 'bg-nb-green/10 border-nb-green/30 text-nb-green' : 'bg-gray-50 border-gray-200 text-nb-muted'}`}>{b.live ? 'LIVE' : 'DRAFT'}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="bg-white border-2 border-black rounded p-2.5 mt-2 shadow-[2px_2px_0_0_#000]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-nb-muted">7-day trend</span>
                      <span className="text-[9px] font-bold text-nb-green">+24%</span>
                    </div>
                    <svg viewBox="0 0 200 40" className="w-full h-8" preserveAspectRatio="none">
                      <motion.path
                        d="M0,35 Q15,28 30,30 T60,22 T90,25 T120,15 T150,18 T180,8 T200,5"
                        fill="none" stroke="#FFE500" strokeWidth="2.5" strokeLinecap="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 1.2, ease: 'easeOut' }}
                      />
                      <motion.path
                        d="M0,35 Q15,28 30,30 T60,22 T90,25 T120,15 T150,18 T180,8 T200,5 L200,40 L0,40 Z"
                        fill="url(#chartGrad)" opacity="0.3"
                        initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5, duration: 0.5 }}
                      />
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FFE500" />
                          <stop offset="100%" stopColor="#FFE500" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Chat widget preview */}
            <motion.div initial={{ opacity: 0, scale: 0.85, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute -bottom-10 -left-14 w-64 z-10">
              <TiltCard>
                <div className="bg-white border-3 border-black rounded-xl shadow-nb overflow-hidden">
                  <div className="bg-gradient-to-r from-nb-blue to-[#3B82F6] px-3 py-2 border-b-3 border-black flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-white" /><span className="text-[11px] font-bold text-white">Support Bot</span></div>
                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-nb-green" /><span className="text-[8px] text-white/70">Online</span></div>
                  </div>
                  <div className="p-2.5 space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-nb-blue/8 border border-nb-blue/15 rounded-lg rounded-tr-none px-2.5 py-1.5 text-[10px] max-w-[82%]">How do I reset my password?</div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg rounded-tl-none px-2.5 py-1.5 text-[10px] max-w-[90%] leading-relaxed">
                        {botMsg.out}{!botMsg.done && <span className="inline-block w-[2px] h-3 bg-nb-blue ml-0.5 animate-pulse" />}
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 pb-2.5">
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded px-2 py-1.5">
                      <span className="text-[9px] text-gray-400 flex-1">Ask anything...</span>
                      <ArrowUpRight className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Deploy notification */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.2, duration: 0.4 }}
              className="absolute -top-4 -right-6 z-10">
              <div className="bg-white border-2 border-black rounded-lg shadow-nb-sm px-3 py-2 flex items-center gap-2">
                <div className="w-5 h-5 bg-nb-green/10 rounded flex items-center justify-center"><Check className="w-3 h-3 text-nb-green" /></div>
                <div><p className="text-[10px] font-bold">Bot deployed</p><p className="text-[8px] text-nb-muted">Widget live on 3 sites</p></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-nb-muted">
        <span className="text-[10px] font-bold uppercase tracking-widest">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ChevronDown className="w-4 h-4" /></motion.div>
      </motion.div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-nb-bg to-transparent" />
    </section>
  );
}

/* ═══════════════════════════════════════
   MARQUEE TICKER
   ═══════════════════════════════════════ */
function Ticker() {
  const items = ['React 18', 'Node.js', 'MongoDB', 'Pinecone', 'Gemini AI', 'Redis', 'Firebase Auth', 'Bull Queues', 'TailwindCSS', 'Vite', 'Express', 'Vercel'];
  const row = [...items, ...items];
  return (
    <section className="border-y-3 border-black bg-black overflow-hidden select-none">
      <div className="py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {row.map((t, i) => (
            <span key={i} className="flex items-center gap-3 px-6 text-sm font-bold text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-nb-yellow flex-shrink-0" />{t}
            </span>
          ))}
        </div>
      </div>
      <div className="py-3 border-t border-white/5">
        <div className="flex animate-marquee-reverse whitespace-nowrap">
          {[...row].reverse().map((t, i) => (
            <span key={i} className="flex items-center gap-3 px-6 text-sm font-bold text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-nb-pink/60 flex-shrink-0" />{t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   ANIMATED COUNTER STATS
   ═══════════════════════════════════════ */
function Stats() {
  const { ref, inView } = useIOView({ triggerOnce: true, threshold: 0.3 });
  const stats = [
    { end: 10, suffix: ' min', label: 'Setup to deploy', icon: Zap },
    { end: 100, suffix: 'K+', label: 'Users supported', icon: Globe },
    { end: 200, prefix: '<', suffix: 'ms', label: 'Response time', icon: Cpu },
    { end: 256, prefix: 'AES-', label: 'Key encryption', icon: Lock },
  ];
  return (
    <section ref={ref} className="py-14 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ end, suffix, prefix, label, icon: I }, i) => (
            <Reveal key={label} custom={i}>
              <div className="group p-5 bg-white border-3 border-black rounded-lg shadow-nb text-center hover:shadow-nb-lg hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200">
                <I className="w-5 h-5 mx-auto mb-2 text-nb-muted group-hover:text-black transition-colors" />
                <div className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">
                  {prefix}{inView ? <CountUp end={end} duration={2} delay={i * 0.15} /> : '0'}{suffix}
                </div>
                <div className="text-[10px] text-nb-muted mt-1 uppercase tracking-wider font-semibold">{label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   FEATURES (bento grid)
   ═══════════════════════════════════════ */
function Features() {
  const features = [
    { icon: Bot, title: 'Multi-Bot Dashboard', desc: 'Spin up as many bots as you need. Each one gets its own knowledge base, prompt, theme, and API keys.', color: 'bg-nb-yellow', span: 'sm:col-span-2 lg:col-span-1' },
    { icon: Upload, title: 'Document Ingestion', desc: 'Drag in PDFs, TXT, DOCX, Markdown. Auto-chunked, vectorized, indexed in Pinecone.', color: 'bg-nb-pink', span: '' },
    { icon: Code2, title: 'Embed Anywhere', desc: 'One script tag. Or React / Vue / vanilla JS snippets. Version history for every embed config.', color: 'bg-nb-blue', span: '' },
    { icon: BarChart3, title: 'Live Analytics', desc: 'Message volume, sessions, response times, top bots. Real-time, per-bot or global view.', color: 'bg-nb-green', span: '' },
    { icon: Shield, title: 'Security Built In', desc: 'Firebase Auth, AES-256 keys, Helmet headers, CORS whitelist, per-IP rate limits.', color: 'bg-nb-purple', span: '' },
    { icon: Layers, title: 'Scales With You', desc: 'MongoDB pooling, Redis cache, 3 Bull queues, CPU clustering. 1 user or 100,000.', color: 'bg-nb-orange', span: 'sm:col-span-2 lg:col-span-1' },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 relative">
      <GridBg dotted />
      <GlowOrb className="w-60 h-60 top-20 right-10" color="bg-nb-pink/8" />
      <GlowOrb className="w-48 h-48 bottom-10 left-20" color="bg-nb-blue/8" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="max-w-2xl mx-auto mb-14 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything to go from{' '}
            <span className="relative inline-block">
              <span className="relative z-10">idea to production</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-nb-pink/20 -z-0" />
            </span>
          </h2>
          <p className="mt-4 text-nb-muted text-lg">A full platform for RAG chatbots. No infra management needed.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {features.map(({ icon: I, title, desc, color, span }, i) => (
            <Reveal key={title} custom={i} variants={scaleIn} className={span}>
              <TiltCard className="h-full">
                <div className="group h-full p-6 bg-white border-3 border-black rounded-lg shadow-nb hover:shadow-nb-lg hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 relative overflow-hidden">
                  <div className={`absolute -top-6 -right-6 w-24 h-24 ${color} opacity-[0.06] rounded-full`} />
                  <div className={`inline-flex items-center justify-center w-11 h-11 ${color} border-2 border-black rounded-lg mb-4 group-hover:rotate-[-8deg] transition-transform duration-300`}>
                    <I className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="text-base font-bold mb-1.5">{title}</h3>
                  <p className="text-sm text-nb-muted leading-relaxed">{desc}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Create a bot', desc: 'Name it, set a system prompt, pick a theme. About 30 seconds.', icon: Bot, color: 'bg-nb-yellow' },
    { n: '02', title: 'Upload docs', desc: 'PDFs, text files, DOCX, MD. Chunked and vectorized automatically.', icon: FileText, color: 'bg-nb-pink' },
    { n: '03', title: 'Add API keys', desc: 'Pinecone + Gemini. Encrypted AES-256 at rest.', icon: Lock, color: 'bg-nb-blue' },
    { n: '04', title: 'Embed & go', desc: 'Grab the script tag. Paste on your site. Done.', icon: Code2, color: 'bg-nb-green' },
  ];
  const embedCode = `<script\n  src="https://rag-host.vercel.app/widget.js"\n  data-bot-id="your-bot-id"\n  data-color="#4D9FFF"\n  data-position="bottom-right"\n></script>`;

  return (
    <section id="how-it-works" className="py-20 lg:py-28 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-[repeating-linear-gradient(90deg,#000_0_8px,transparent_8px_16px)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mx-auto mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Zero to{' '}
            <span className="relative inline-block"><span className="relative z-10">production</span><span className="absolute bottom-1 left-0 right-0 h-3 bg-nb-blue/20 -z-0" /></span>{' '}
            in 4 steps
          </h2>
          <p className="mt-4 text-nb-muted text-lg">No DevOps team. No pipeline. Connect APIs and ship.</p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map(({ n, title, desc, icon: I, color }, i) => (
            <Reveal key={n} custom={i}>
              <div className="relative h-full">
                {i < 3 && <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-[repeating-linear-gradient(90deg,#000_0_4px,transparent_4px_8px)]" />}
                <TiltCard className="h-full">
                  <div className="relative bg-white border-3 border-black rounded-lg p-5 shadow-nb h-full">
                    <div className="absolute -top-3 -left-1 bg-black text-white text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wider">{n}</div>
                    <div className={`w-12 h-12 ${color} border-3 border-black rounded-lg flex items-center justify-center mt-2 mb-3`}><I className="w-6 h-6 text-black" /></div>
                    <h3 className="text-base font-bold mb-1">{title}</h3>
                    <p className="text-sm text-nb-muted leading-relaxed">{desc}</p>
                  </div>
                </TiltCard>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 bg-black rounded-xl" />
            <div className="relative bg-[#0f0f1a] border-3 border-black rounded-xl overflow-hidden">
              <CopyBtn text={embedCode} />
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <span className="text-[11px] text-white/25 font-mono ml-2">index.html</span>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-[13px] font-mono leading-relaxed"><code>
                  <span className="text-white/25">{'<!-- One tag. That\'s it. -->'}</span>{'\n'}
                  <span className="text-[#FF6B9D]">{'<script'}</span>{'\n'}
                  {'  '}<span className="text-[#4D9FFF]">src</span><span className="text-white/40">=</span><span className="text-[#28C840]">{'"https://rag-host.vercel.app/widget.js"'}</span>{'\n'}
                  {'  '}<span className="text-[#4D9FFF]">data-bot-id</span><span className="text-white/40">=</span><span className="text-[#28C840]">{'"your-bot-id"'}</span>{'\n'}
                  {'  '}<span className="text-[#4D9FFF]">data-color</span><span className="text-white/40">=</span><span className="text-[#28C840]">{'"#4D9FFF"'}</span>{'\n'}
                  {'  '}<span className="text-[#4D9FFF]">data-position</span><span className="text-white/40">=</span><span className="text-[#28C840]">{'"bottom-right"'}</span>{'\n'}
                  <span className="text-[#FF6B9D]">{'></script>'}</span>
                </code></pre>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   TECH STACK
   ═══════════════════════════════════════ */
function TechStackSection() {
  const stack = [
    { name: 'React 18', cat: 'Frontend', I: Braces },
    { name: 'Vite', cat: 'Build', I: Zap },
    { name: 'Tailwind', cat: 'Styling', I: Eye },
    { name: 'Node.js', cat: 'Runtime', I: Hash },
    { name: 'Express', cat: 'API', I: Server },
    { name: 'MongoDB', cat: 'Database', I: Database },
    { name: 'Firebase', cat: 'Auth', I: Flame },
    { name: 'Pinecone', cat: 'Vectors', I: TreePine },
    { name: 'Gemini AI', cat: 'LLM', I: Gem },
    { name: 'Redis', cat: 'Cache', I: CircleDot },
    { name: 'Bull MQ', cat: 'Queues', I: Workflow },
    { name: 'Vercel', cat: 'Deploy', I: Triangle },
  ];

  return (
    <section id="stack" className="py-20 lg:py-28 border-y-3 border-black bg-white relative">
      <GridBg />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="max-w-2xl mx-auto mb-14 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            The{' '}
            <span className="relative inline-block"><span className="relative z-10">stack</span><span className="absolute bottom-1 left-0 right-0 h-3 bg-nb-yellow/30 -z-0" /></span>{' '}
            under the hood
          </h2>
          <p className="mt-4 text-nb-muted text-lg">Proven tools. Battle-tested in production.</p>
        </Reveal>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {stack.map(({ name, cat, I }, i) => (
            <Reveal key={name} custom={i} variants={scaleIn}>
              <TiltCard>
                <div className="group p-3.5 bg-nb-bg border-3 border-black rounded-lg shadow-nb-sm hover:shadow-nb hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200 text-center">
                  <div className="w-8 h-8 mx-auto mb-1.5 bg-white border-2 border-black rounded flex items-center justify-center group-hover:bg-nb-yellow group-hover:rotate-[-6deg] transition-all duration-200">
                    <I className="w-4 h-4 text-black" />
                  </div>
                  <p className="text-xs font-bold leading-tight">{name}</p>
                  <p className="text-[9px] text-nb-muted uppercase tracking-wider">{cat}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* Architecture */}
        <Reveal className="mt-14">
          <div className="relative">
            <div className="absolute inset-0 translate-x-2 translate-y-2 bg-black rounded-xl" />
            <div className="relative bg-nb-bg border-3 border-black rounded-xl p-6 md:p-8">
              <h3 className="text-sm font-bold mb-6 text-center uppercase tracking-widest text-nb-muted">Architecture</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Frontend', items: ['React 18 + Vite', 'TailwindCSS + neo-brutalism', 'Code-split ~200KB gzip', 'Vercel Edge CDN'], color: 'bg-nb-blue', border: 'border-nb-blue/20' },
                  { title: 'Backend', items: ['Express + clustering', '3 Bull async queues', 'Redis cache layer', 'Rate limiting + Helmet'], color: 'bg-nb-pink', border: 'border-nb-pink/20' },
                  { title: 'Data & AI', items: ['MongoDB Atlas pooling', 'Pinecone vector search', 'Gemini LLM + embeddings', 'AES-256 encryption'], color: 'bg-nb-yellow', border: 'border-nb-yellow/30' },
                ].map(col => (
                  <div key={col.title} className={`border-3 border-black bg-white rounded-lg p-5`}>
                    <div className={`inline-flex items-center px-3 py-1 ${col.color} border-2 border-black rounded font-bold text-xs uppercase tracking-wider mb-4`}>{col.title}</div>
                    <ul className="space-y-2.5">
                      {col.items.map(item => (
                        <li key={item} className="flex items-start gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 flex-shrink-0" />{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {/* Connection lines */}
              <div className="hidden md:flex justify-center mt-4 gap-1">
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-black/10"
                    animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.06 }} />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   OPEN SOURCE
   ═══════════════════════════════════════ */
function OpenSource() {
  return (
    <section id="oss" className="py-20 lg:py-28 relative">
      <GlowOrb className="w-80 h-80 top-10 left-10" color="bg-nb-green/6" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal variants={slideL}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Fully open source.{' '}
              <span className="text-nb-green">MIT licensed.</span>
            </h2>
            <p className="mt-4 text-nb-muted text-lg leading-relaxed">Fork it, self-host it, tear it apart and rebuild. No lock-in, no limits, no surprises.</p>
            <div className="mt-8 space-y-3">
              {['Complete frontend + backend source', 'One-click Vercel + Render deploy', 'Docs, guides, and examples included', 'Active development — PRs welcome'].map(t => (
                <div key={t} className="flex items-start gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-nb-green mt-2 flex-shrink-0" /><span className="text-sm">{t}</span></div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href="https://github.com/pavankumar-vh/RAGHost" target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-lg bg-black text-white"><Github className="w-5 h-5" />View on GitHub</a>
              <a href="https://github.com/pavankumar-vh/RAGHost" target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-lg bg-white text-black"><Star className="w-5 h-5" />Star</a>
            </div>
          </Reveal>

          <Reveal variants={slideR}>
            <div className="relative">
              <div className="absolute inset-0 translate-x-3 translate-y-3 bg-black rounded-xl" />
              <div className="relative bg-[#0d1117] border-3 border-black rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-[#161b22]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                  </div>
                  <span className="text-[11px] text-white/25 font-mono ml-2">~</span>
                </div>
                <div className="p-5 font-mono text-[13px] leading-relaxed space-y-1.5">
                  <div><span className="text-[#28C840]">~</span> <span className="text-white/90">git clone https://github.com/pavankumar-vh/RAGHost.git</span></div>
                  <div className="text-white/25 pl-4">Cloning into &apos;RAGHost&apos;... done.</div>
                  <div className="mt-1"><span className="text-[#28C840]">~</span> <span className="text-white/90">cd RAGHost && npm install</span></div>
                  <div className="text-white/25 pl-4">added 573 packages in 12s</div>
                  <div className="mt-1"><span className="text-[#28C840]">~</span> <span className="text-white/90">cp .env.example .env && npm run dev</span></div>
                  <div className="mt-1.5 text-[#FEBC2E] pl-4">Server &rarr; http://localhost:3000</div>
                  <div className="text-[#4D9FFF] pl-4">Frontend &rarr; http://localhost:5173</div>
                  <div className="text-[#28C840] pl-4 mt-1">Ready.</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[#28C840]">~</span>
                    <motion.span className="w-[7px] h-[15px] bg-white/80" animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: 'steps(1)' }} />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   CTA
   ═══════════════════════════════════════ */
function CTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative bg-black border-3 border-black rounded-2xl p-8 md:p-14 text-center overflow-hidden">
            <GlowOrb className="w-52 h-52 top-0 left-0" color="bg-nb-yellow/12" />
            <GlowOrb className="w-60 h-60 bottom-0 right-0" color="bg-nb-pink/10" />
            <GlowOrb className="w-36 h-36 top-1/2 left-1/3" color="bg-nb-blue/8" />
            {/* Dot grid overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Ready to build?</h2>
              <p className="mt-4 text-white/40 text-lg max-w-md mx-auto">Open source, production-grade, free to start. Your first chatbot is 10 minutes away.</p>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <Link to="/auth" className="nb-btn nb-btn-lg bg-nb-yellow text-black text-base border-nb-yellow">Get Started<ArrowRight className="w-5 h-5" /></Link>
                <a href="https://github.com/pavankumar-vh/RAGHost" target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-lg bg-transparent text-white border-white/20 hover:border-white/40 hover:bg-white/5 text-base"><Github className="w-5 h-5" />Source Code</a>
              </div>
              <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/35">
                {['No credit card', 'MIT License', 'Self-hostable'].map(t => (
                  <span key={t} className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-nb-green" />{t}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════ */
function Footer() {
  return (
    <footer className="py-12 border-t-3 border-black bg-nb-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-nb-yellow border-2 border-black rounded flex items-center justify-center shadow-nb-sm"><Bot className="w-4 h-4 text-black" /></div>
              <span className="text-lg font-bold">RAGHost</span>
            </div>
            <p className="text-sm text-nb-muted leading-relaxed max-w-xs">Build and deploy RAG chatbots powered by your own documents.</p>
          </div>
          <div>
            <h4 className="font-bold text-[10px] mb-3 uppercase tracking-widest text-nb-muted">Product</h4>
            <ul className="space-y-2 text-sm">
              {[{ l: 'Features', h: '#features' }, { l: 'How It Works', h: '#how-it-works' }, { l: 'Stack', h: '#stack' }].map(x => <li key={x.l}><a href={x.h} className="text-nb-muted hover:text-black transition-colors">{x.l}</a></li>)}
              <li><Link to="/auth" className="text-nb-muted hover:text-black transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[10px] mb-3 uppercase tracking-widest text-nb-muted">Developers</h4>
            <ul className="space-y-2 text-sm">
              {[
                { l: 'GitHub', h: 'https://github.com/pavankumar-vh/RAGHost' },
                { l: 'Contributing', h: 'https://github.com/pavankumar-vh/RAGHost/blob/main/CONTRIBUTING.md' },
                { l: 'Deploy Guide', h: 'https://github.com/pavankumar-vh/RAGHost/blob/main/DEPLOYMENT.md' },
                { l: 'Issues', h: 'https://github.com/pavankumar-vh/RAGHost/issues' },
              ].map(x => <li key={x.l}><a href={x.h} target="_blank" rel="noopener noreferrer" className="text-nb-muted hover:text-black transition-colors">{x.l}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[10px] mb-3 uppercase tracking-widest text-nb-muted">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/pavankumar-vh/RAGHost/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-nb-muted hover:text-black transition-colors">MIT License</a></li>
              <li><a href="https://github.com/pavankumar-vh/RAGHost/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noopener noreferrer" className="text-nb-muted hover:text-black transition-colors">Code of Conduct</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-nb-muted">{new Date().getFullYear()} RAGHost &mdash; <a href="https://github.com/pavankumar-vh" target="_blank" rel="noopener noreferrer" className="font-semibold text-black hover:text-nb-pink transition-colors">pavankumar-vh</a></p>
          <a href="https://github.com/pavankumar-vh/RAGHost" target="_blank" rel="noopener noreferrer" className="text-nb-muted hover:text-black transition-colors" aria-label="GitHub"><Github className="w-5 h-5" /></a>
        </div>
      </div>
    </footer>
  );
}

/* ═══ LANDING PAGE ═══ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-nb-bg overflow-x-hidden">
      <Navbar />
      <Hero />
      <Ticker />
      <Stats />
      <Features />
      <HowItWorks />
      <TechStackSection />
      <OpenSource />
      <CTA />
      <Footer />
    </div>
  );
}
