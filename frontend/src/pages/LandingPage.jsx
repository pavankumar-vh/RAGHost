import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  motion, useInView, useScroll, useTransform, AnimatePresence,
  useMotionValue, useSpring, useMotionTemplate
} from 'framer-motion';
import CountUp from 'react-countup';
import { useInView as useIOView } from 'react-intersection-observer';
import {
  Bot, Zap, Shield, Upload, Code2, BarChart3, MessageSquare,
  ArrowRight, Database, Cpu, Globe, Lock, FileText, Layers,
  Terminal, Star, Menu, X, Github, Play, Hash, Braces, Box,
  Server, Flame, TreePine, Gem, CircleDot, Triangle,
  Copy, Check, ArrowUpRight, Workflow, Eye, Puzzle,
  ChevronDown, MousePointerClick, Sparkles, Plus, Minus,
  ExternalLink, Gauge, Blocks, ShieldCheck, Cloud, Rocket
} from 'lucide-react';

/* ═══════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════ */
const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 44 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.55, delay: i * 0.07, ease }
  })
};

const slideL = {
  hidden: { opacity: 0, x: -70 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease } }
};

const slideR = {
  hidden: { opacity: 0, x: 70 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease } }
};

/* ─── word-stagger for headings ─── */
const wordStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};
const wordChild = {
  hidden: { opacity: 0, y: 30, rotateX: -40 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.5, ease } }
};

/* ═══════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════ */

/* ─── scroll progress bar at top ─── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-nb-yellow z-[60] origin-left" style={{ scaleX }} />
  );
}

/* ─── cursor follower ─── */
function CursorFollower() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness: 150, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 150, damping: 20 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); setVisible(true); };
    const leave = () => setVisible(false);
    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    return () => { window.removeEventListener('mousemove', move); document.removeEventListener('mouseleave', leave); };
  }, [x, y]);

  // Hide on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <motion.div
      className="fixed w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference bg-white"
      style={{ x: smoothX, y: smoothY, translateX: '-50%', translateY: '-50%' }}
      animate={{ opacity: visible ? 0.6 : 0, scale: visible ? 1 : 0.5 }}
      transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
    />
  );
}

/* ─── noise texture overlay ─── */
function NoiseOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[55] opacity-[0.025]" aria-hidden>
      <svg width="100%" height="100%">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}

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

/* ─── split text heading (word-by-word reveal) ─── */
function SplitText({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const words = children.split(' ');
  return (
    <motion.span ref={ref} className={`inline ${className}`} style={{ perspective: '600px' }}
      initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={wordStagger}>
      {words.map((word, i) => (
        <motion.span key={i} variants={wordChild} className="inline-block mr-[0.3em]" style={{ transformOrigin: 'bottom' }}>
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ─── magnetic hover wrapper ─── */
function MagneticWrap({ children, className = '', strength = 0.3 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    x.set(cx * strength);
    y.set(cy * strength);
  }, [x, y, strength]);

  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} style={{ x: sx, y: sy }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── mouse-tracking tilt card ─── */
function TiltCard({ children, className = '', intensity = 6 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 200, damping: 20 });

  const handleMouse = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── animated gradient border ─── */
function GradientBorder({ children, className = '', colors = ['#FFE500', '#FF6B9D', '#4D9FFF', '#00C853'] }) {
  return (
    <div className={`relative p-[3px] rounded-xl overflow-hidden group ${className}`}>
      <div className="absolute inset-0 rounded-xl animate-border-rotate"
        style={{ background: `conic-gradient(from var(--border-angle, 0deg), ${colors.join(', ')}, ${colors[0]})` }} />
      <div className="relative bg-white rounded-[calc(0.75rem-3px)] h-full">
        {children}
      </div>
    </div>
  );
}

/* ─── mouse spotlight on section ─── */
function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouse = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(255,229,0,0.06), transparent 80%)`;

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} style={{ background }} className={className}>
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

/* ─── SVG wave section divider ─── */
function WaveDivider({ flip = false, color = '#FFFEF0', className = '' }) {
  return (
    <div className={`relative w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''} ${className}`} aria-hidden>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 sm:h-20">
        <path d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z" fill={color} />
      </svg>
    </div>
  );
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

/* ─── animated beam (connection line) ─── */
function Beam({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      <motion.div className="absolute top-0 h-px w-12 bg-gradient-to-r from-transparent via-nb-yellow to-transparent"
        animate={{ x: ['-100%', '800%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
    </div>
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
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-nb-bg/95 backdrop-blur-md border-b-3 border-black shadow-[0_4px_0_0_#000]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20">
        <a href="#" className="flex items-center gap-2.5 group">
          <MagneticWrap strength={0.2}>
            <div className="w-10 h-10 bg-nb-yellow border-3 border-black rounded flex items-center justify-center shadow-nb-sm group-hover:shadow-nb transition-shadow group-hover:rotate-[-6deg] transition-transform duration-300">
              <Bot className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
          </MagneticWrap>
          <span className="text-xl font-bold tracking-tight">RAGHost</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <MagneticWrap key={l.href} strength={0.15}>
              <a href={l.href} className="px-4 py-2 text-sm font-semibold hover:bg-black/5 rounded transition-colors relative group">
                {l.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-nb-yellow group-hover:w-4/5 transition-all duration-300" />
              </a>
            </MagneticWrap>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <MagneticWrap strength={0.2}>
            <a href="https://github.com/pavankumar-vh/RAGHost" target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-sm bg-white text-black"><Github className="w-4 h-4" />GitHub</a>
          </MagneticWrap>
          <MagneticWrap strength={0.2}>
            <Link to="/auth" className="nb-btn nb-btn-sm bg-nb-yellow text-black">Get Started<ArrowRight className="w-4 h-4" /></Link>
          </MagneticWrap>
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
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const botMsg = useTyping('Based on your docs, you can reset it from Settings > Security. Want me to walk you through it?', 22, 2000);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <GridBg />

      {/* Parallax background layers */}
      <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 pointer-events-none" aria-hidden>
        <GlowOrb className="w-96 h-96 -top-20 -left-40" color="bg-nb-yellow/12" />
        <GlowOrb className="w-72 h-72 bottom-20 right-10" color="bg-nb-pink/8" />
        <GlowOrb className="w-56 h-56 top-1/2 left-1/3" color="bg-nb-blue/6" />
      </motion.div>

      {/* Floating geometry */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <motion.div className="absolute top-24 left-[7%] w-14 h-14 border-3 border-black/6 rounded rotate-12"
          animate={{ y: [0, -18, 0], rotate: [12, -4, 12] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute top-44 right-[9%] w-10 h-10 border-3 border-nb-pink/12 rounded-full"
          animate={{ y: [0, 14, 0], scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
        <motion.div className="absolute bottom-40 left-[14%] w-8 h-8 border-3 border-nb-blue/10 rotate-45"
          animate={{ rotate: [45, 135, 45] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
        <motion.div className="absolute top-[25%] right-[20%] w-6 h-6 bg-nb-yellow/8 rounded-sm"
          animate={{ y: [0, -10, 0], rotate: [0, 90, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} />
        <motion.div className="absolute bottom-[30%] right-[15%] w-3 h-3 bg-nb-green/15 rounded-full"
          animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />

        {/* Dot clusters */}
        <div className="absolute top-[38%] left-[3%] grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-black/5" animate={{ opacity: [0.15, 0.5, 0.15] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
        <div className="absolute bottom-[20%] right-[5%] grid grid-cols-4 gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div key={i} className="w-1 h-1 rounded-full bg-black/4" animate={{ opacity: [0.1, 0.45, 0.1] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>

        {/* Animated line */}
        <svg className="absolute top-[15%] left-[50%] w-64 h-64 opacity-[0.04]" viewBox="0 0 200 200">
          <motion.circle cx="100" cy="100" r="80" fill="none" stroke="black" strokeWidth="1"
            strokeDasharray="502" initial={{ strokeDashoffset: 502 }} animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 3, delay: 0.5, ease: 'easeOut' }} />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
          {/* Copy */}
          <motion.div style={{ y: heroY }} className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease }}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-full shadow-nb-sm text-xs font-bold uppercase tracking-wider mb-6 hover:shadow-nb hover:-translate-y-px transition-all cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nb-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-nb-green" />
                </span>
                Open Source — MIT License
              </span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold leading-[1.08] tracking-tight">
              <SplitText>Ship RAG Chatbots</SplitText>{' '}
              <span className="relative inline-block">
                <SplitText>That Actually</SplitText>
                <motion.span className="absolute bottom-1 left-0 right-0 h-3 sm:h-4 bg-nb-yellow -z-[1]"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.8, ease }} style={{ originX: 0 }} />
              </span>{' '}
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-nb-pink via-nb-purple to-nb-blue animate-text-shimmer bg-[length:200%_auto]">
                Know Your Stuff
              </motion.span>
            </h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 text-lg sm:text-xl text-nb-muted max-w-lg leading-relaxed">
              Drop in your docs. Get an embeddable chatbot grounded in your knowledge base. Self-host or deploy to Vercel in under 10 minutes.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }} className="flex flex-wrap gap-3 mt-8">
              <MagneticWrap strength={0.15}>
                <Link to="/auth" className="nb-btn nb-btn-lg bg-nb-yellow text-black text-base group">
                  Start Building
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Link>
              </MagneticWrap>
              <MagneticWrap strength={0.15}>
                <a href="#how-it-works" className="nb-btn nb-btn-lg bg-white text-black text-base">
                  <Play className="w-5 h-5" />How It Works
                </a>
              </MagneticWrap>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-10 text-sm text-nb-muted">
              {[{ icon: Lock, t: 'AES-256 encryption' }, { icon: Zap, t: '<200ms responses' }, { icon: Globe, t: 'Deploy anywhere' }].map(({ icon: I, t }) => (
                <span key={t} className="flex items-center gap-1.5 group cursor-default">
                  <I className="w-3.5 h-3.5 group-hover:text-nb-yellow transition-colors" />
                  <span className="group-hover:text-black transition-colors">{t}</span>
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual — parallax tiltable mockup */}
          <motion.div style={{ y: mockupY, rotate: mockupRotate }}
            initial={{ opacity: 0, x: 50, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.3, ease }}
            className="relative hidden md:block perspective-[1200px]">
            <TiltCard intensity={8}>
              {/* Depth layers */}
              <div className="absolute inset-0 translate-x-5 translate-y-5 bg-black/40 rounded-xl blur-md" />
              <div className="absolute inset-0 translate-x-2 translate-y-2 bg-black rounded-xl" />

              <div className="relative bg-white border-3 border-black rounded-xl overflow-hidden" style={{ transform: 'translateZ(20px)' }}>
                {/* Chrome bar */}
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

                {/* Dashboard mockup */}
                <div className="p-4 bg-nb-bg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-nb-yellow border-2 border-black rounded flex items-center justify-center"><Bot className="w-3.5 h-3.5" /></div>
                      <span className="font-bold text-sm">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nb-green opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-nb-green" /></span>
                      <span className="text-[10px] font-bold text-nb-muted">3 bots active</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[{ l: 'Messages', v: '12.4k', d: '+18%', c: 'text-nb-green' }, { l: 'Sessions', v: '3.2k', d: '+7%', c: 'text-nb-green' }, { l: 'Avg Resp', v: '142ms', d: '-12ms', c: 'text-nb-blue' }].map(m => (
                      <div key={m.l} className="bg-white border-2 border-black rounded p-2 hover:shadow-nb-sm transition-shadow">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-nb-muted">{m.l}</p>
                        <p className="text-sm font-bold mt-0.5">{m.v}</p>
                        <p className={`text-[8px] font-bold ${m.c}`}>{m.d}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bot list */}
                  <div className="space-y-1.5">
                    {[{ n: 'Support Bot', bg: 'bg-nb-blue', m: '2,418', live: true }, { n: 'Sales AI', bg: 'bg-nb-pink', m: '891', live: true }, { n: 'Internal Docs', bg: 'bg-nb-purple', m: '1,204', live: false }].map((b, i) => (
                      <motion.div key={b.n} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex items-center gap-2 p-2 bg-white border-2 border-black rounded shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:-translate-y-px transition-all">
                        <div className={`w-6 h-6 ${b.bg} border-2 border-black rounded flex items-center justify-center`}><MessageSquare className="w-3 h-3 text-white" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold truncate">{b.n}</p>
                          <p className="text-[8px] text-nb-muted">{b.m} msgs</p>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${b.live ? 'bg-nb-green/10 border-nb-green/30 text-nb-green' : 'bg-gray-50 border-gray-200 text-nb-muted'}`}>{b.live ? 'LIVE' : 'DRAFT'}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Animated chart */}
                  <div className="bg-white border-2 border-black rounded p-2.5 mt-2 shadow-[2px_2px_0_0_#000]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-nb-muted">7-day trend</span>
                      <span className="text-[9px] font-bold text-nb-green">+24%</span>
                    </div>
                    <svg viewBox="0 0 200 40" className="w-full h-8" preserveAspectRatio="none">
                      <motion.path d="M0,35 Q15,28 30,30 T60,22 T90,25 T120,15 T150,18 T180,8 T200,5"
                        fill="none" stroke="#FFE500" strokeWidth="2.5" strokeLinecap="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 1.2, ease: 'easeOut' }} />
                      <motion.path d="M0,35 Q15,28 30,30 T60,22 T90,25 T120,15 T150,18 T180,8 T200,5 L200,40 L0,40 Z"
                        fill="url(#chartGrad)" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5 }} />
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FFE500" /><stop offset="100%" stopColor="#FFE500" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Chat widget preview */}
            <motion.div initial={{ opacity: 0, scale: 0.85, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.5, ease }}
              className="absolute -bottom-10 -left-4 md:-left-14 w-52 md:w-64 z-10">
              <TiltCard>
                <div className="bg-white border-3 border-black rounded-xl shadow-nb overflow-hidden">
                  <div className="bg-gradient-to-r from-nb-blue to-[#3B82F6] px-3 py-2 border-b-3 border-black flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-white" /><span className="text-[11px] font-bold text-white">Support Bot</span></div>
                    <div className="flex items-center gap-1">
                      <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nb-green opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-nb-green" /></span>
                      <span className="text-[8px] text-white/70">Online</span>
                    </div>
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
            <motion.div initial={{ opacity: 0, x: 20, y: -10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 2.2, duration: 0.4, ease }}
              className="absolute -top-4 -right-2 md:-right-6 z-10">
              <div className="bg-white border-2 border-black rounded-lg shadow-nb-sm px-3 py-2 flex items-center gap-2 hover:shadow-nb hover:-translate-y-px transition-all cursor-default">
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
            <span key={i} className="flex items-center gap-3 px-6 text-sm font-bold text-white/70 hover:text-nb-yellow transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-nb-yellow flex-shrink-0" />{t}
            </span>
          ))}
        </div>
      </div>
      <div className="py-3 border-t border-white/5">
        <div className="flex animate-marquee-reverse whitespace-nowrap">
          {[...row].reverse().map((t, i) => (
            <span key={i} className="flex items-center gap-3 px-6 text-sm font-bold text-white/40 hover:text-nb-pink transition-colors">
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
    { end: 10, suffix: ' min', label: 'Setup to deploy', icon: Zap, accent: 'group-hover:border-nb-yellow group-hover:shadow-nb-yellow' },
    { end: 100, suffix: 'K+', label: 'Users supported', icon: Globe, accent: 'group-hover:border-nb-blue group-hover:shadow-[4px_4px_0_0_#4D9FFF]' },
    { end: 200, prefix: '<', suffix: 'ms', label: 'Response time', icon: Cpu, accent: 'group-hover:border-nb-pink group-hover:shadow-nb-pink' },
    { end: 256, prefix: 'AES-', label: 'Key encryption', icon: Lock, accent: 'group-hover:border-nb-green group-hover:shadow-[4px_4px_0_0_#00C853]' },
  ];
  return (
    <section ref={ref} className="py-12 sm:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map(({ end, suffix, prefix, label, icon: I, accent }, i) => (
            <Reveal key={label} custom={i}>
              <SpotlightCard className={`group p-3 sm:p-5 bg-white border-3 border-black rounded-lg shadow-nb text-center hover:shadow-nb-lg hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 ${accent}`}>
                <I className="w-5 h-5 mx-auto mb-2 text-nb-muted group-hover:text-black group-hover:scale-110 transition-all duration-300" />
                <div className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight tabular-nums">
                  {prefix}{inView ? <CountUp end={end} duration={2} delay={i * 0.15} /> : '0'}{suffix}
                </div>
                <div className="text-[10px] text-nb-muted mt-1 uppercase tracking-wider font-semibold">{label}</div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   FEATURES (bento grid with gradient borders)
   ═══════════════════════════════════════ */
function Features() {
  const features = [
    { icon: Bot, title: 'Multi-Bot Dashboard', desc: 'Spin up as many bots as you need. Each one gets its own knowledge base, prompt, theme, and API keys.', color: 'bg-nb-yellow', gradColors: ['#FFE500', '#FF6B2B'], span: 'md:col-span-2' },
    { icon: Upload, title: 'Document Ingestion', desc: 'Drag in PDFs, TXT, DOCX, Markdown. Auto-chunked, vectorized, indexed in Pinecone.', color: 'bg-nb-pink', gradColors: ['#FF6B9D', '#8B5CF6'], span: '' },
    { icon: Code2, title: 'Embed Anywhere', desc: 'One script tag. React, Vue, or vanilla JS. Version history for every embed config.', color: 'bg-nb-blue', gradColors: ['#4D9FFF', '#00C853'], span: '' },
    { icon: BarChart3, title: 'Live Analytics', desc: 'Message volume, sessions, response times, top bots. Real-time, per-bot or global view.', color: 'bg-nb-green', gradColors: ['#00C853', '#4D9FFF'], span: '' },
    { icon: Shield, title: 'Security Built In', desc: 'Firebase Auth, AES-256 keys, Helmet headers, CORS whitelist, per-IP rate limits.', color: 'bg-nb-purple', gradColors: ['#8B5CF6', '#FF6B9D'], span: '' },
    { icon: Layers, title: 'Scales With You', desc: 'MongoDB pooling, Redis cache, 3 Bull queues, CPU clustering. 1 user or 100,000.', color: 'bg-nb-orange', gradColors: ['#FF6B2B', '#FFE500'], span: 'md:col-span-2' },
  ];

  return (
    <section id="features" className="py-14 sm:py-20 lg:py-28 relative">
      <GridBg dotted />
      <GlowOrb className="w-72 h-72 top-20 right-10" color="bg-nb-pink/6" />
      <GlowOrb className="w-56 h-56 bottom-10 left-20" color="bg-nb-blue/6" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="max-w-2xl mx-auto mb-14 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            <SplitText>Everything to go from</SplitText>{' '}
            <span className="relative inline-block">
              <SplitText>idea to production</SplitText>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-nb-pink/20 -z-[1]" />
            </span>
          </h2>
          <p className="mt-4 text-nb-muted text-lg">A full platform for RAG chatbots. No infra management needed.</p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {features.map(({ icon: I, title, desc, color, gradColors, span }, i) => (
            <Reveal key={title} custom={i} variants={scaleIn} className={span}>
              <TiltCard className="h-full">
                <GradientBorder colors={gradColors} className="h-full">
                  <SpotlightCard className="h-full p-6 relative overflow-hidden group">
                    <div className={`absolute -top-8 -right-8 w-28 h-28 ${color} opacity-[0.05] rounded-full group-hover:opacity-[0.12] group-hover:scale-125 transition-all duration-500`} />
                    <div className={`inline-flex items-center justify-center w-12 h-12 ${color} border-2 border-black rounded-lg mb-4 group-hover:rotate-[-8deg] group-hover:scale-110 transition-all duration-300`}>
                      <I className="w-5 h-5 text-black" />
                    </div>
                    <h3 className="text-base font-bold mb-1.5">{title}</h3>
                    <p className="text-sm text-nb-muted leading-relaxed">{desc}</p>
                  </SpotlightCard>
                </GradientBorder>
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
    <section id="how-it-works" className="py-14 sm:py-20 lg:py-28 relative bg-white">
      <WaveDivider flip color="#FFFEF0" className="absolute top-0 left-0 right-0 -translate-y-[calc(100%-1px)]" />
      <GridBg />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="max-w-2xl mx-auto mb-16 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            <SplitText>Zero to</SplitText>{' '}
            <span className="relative inline-block">
              <SplitText>production</SplitText>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-nb-blue/20 -z-[1]" />
            </span>{' '}
            <SplitText>in 4 steps</SplitText>
          </h2>
          <p className="mt-4 text-nb-muted text-lg">No DevOps team. No pipeline. Connect APIs and ship.</p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map(({ n, title, desc, icon: I, color }, i) => (
            <Reveal key={n} custom={i}>
              <div className="relative h-full">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full z-10">
                    <Beam />
                  </div>
                )}
                <TiltCard className="h-full">
                  <div className="relative bg-white border-3 border-black rounded-lg p-5 shadow-nb h-full group hover:shadow-nb-lg hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300">
                    <div className="absolute -top-3 -left-1 bg-black text-white text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wider">{n}</div>
                    <div className={`w-12 h-12 ${color} border-3 border-black rounded-lg flex items-center justify-center mt-2 mb-3 group-hover:rotate-[-6deg] group-hover:scale-110 transition-all duration-300`}>
                      <I className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-base font-bold mb-1">{title}</h3>
                    <p className="text-sm text-nb-muted leading-relaxed">{desc}</p>
                  </div>
                </TiltCard>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-0 translate-x-3 translate-y-3 bg-black rounded-xl group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300" />
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
      <WaveDivider color="#FFFEF0" className="absolute bottom-0 left-0 right-0 translate-y-[calc(100%-1px)]" />
    </section>
  );
}

/* ═══════════════════════════════════════
   TECH STACK (with orbital connections)
   ═══════════════════════════════════════ */
function TechStackSection() {
  const stack = [
    { name: 'React 18', cat: 'Frontend', I: Braces, color: 'bg-nb-blue' },
    { name: 'Vite', cat: 'Build', I: Zap, color: 'bg-nb-purple' },
    { name: 'Tailwind', cat: 'Styling', I: Eye, color: 'bg-nb-blue' },
    { name: 'Node.js', cat: 'Runtime', I: Hash, color: 'bg-nb-green' },
    { name: 'Express', cat: 'API', I: Server, color: 'bg-nb-yellow' },
    { name: 'MongoDB', cat: 'Database', I: Database, color: 'bg-nb-green' },
    { name: 'Firebase', cat: 'Auth', I: Flame, color: 'bg-nb-orange' },
    { name: 'Pinecone', cat: 'Vectors', I: TreePine, color: 'bg-nb-green' },
    { name: 'Gemini AI', cat: 'LLM', I: Gem, color: 'bg-nb-blue' },
    { name: 'Redis', cat: 'Cache', I: CircleDot, color: 'bg-nb-red' },
    { name: 'Bull MQ', cat: 'Queues', I: Workflow, color: 'bg-nb-purple' },
    { name: 'Vercel', cat: 'Deploy', I: Triangle, color: 'bg-nb-yellow' },
  ];

  return (
    <section id="stack" className="py-14 sm:py-20 lg:py-28 relative">
      <GridBg />
      <GlowOrb className="w-64 h-64 top-20 left-10" color="bg-nb-yellow/8" />
      <GlowOrb className="w-48 h-48 bottom-20 right-20" color="bg-nb-purple/6" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="max-w-2xl mx-auto mb-14 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            <SplitText>The stack under</SplitText>{' '}
            <span className="relative inline-block">
              <SplitText>the hood</SplitText>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-nb-yellow/30 -z-[1]" />
            </span>
          </h2>
          <p className="mt-4 text-nb-muted text-lg">Proven tools. Battle-tested in production.</p>
        </Reveal>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
          {stack.map(({ name, cat, I, color }, i) => (
            <Reveal key={name} custom={i} variants={scaleIn}>
              <MagneticWrap strength={0.12}>
                <TiltCard intensity={4}>
                  <div className="group p-3.5 bg-white border-3 border-black rounded-lg shadow-nb-sm hover:shadow-nb hover:-translate-y-1 hover:-translate-x-0.5 transition-all duration-300 text-center relative overflow-hidden">
                    <div className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`} />
                    <div className={`w-9 h-9 mx-auto mb-1.5 bg-nb-bg border-2 border-black rounded flex items-center justify-center group-hover:${color} group-hover:rotate-[-6deg] group-hover:scale-110 transition-all duration-300`}>
                      <I className="w-4 h-4 text-black" />
                    </div>
                    <p className="text-xs font-bold leading-tight">{name}</p>
                    <p className="text-[9px] text-nb-muted uppercase tracking-wider">{cat}</p>
                  </div>
                </TiltCard>
              </MagneticWrap>
            </Reveal>
          ))}
        </div>

        {/* Architecture diagram */}
        <Reveal className="mt-14">
          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 bg-black rounded-xl" />
            <div className="relative bg-nb-bg border-3 border-black rounded-xl p-6 md:p-8">
              <h3 className="text-sm font-bold mb-6 text-center uppercase tracking-widest text-nb-muted">Architecture</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Frontend', items: ['React 18 + Vite', 'TailwindCSS + neo-brutalism', 'Code-split ~200KB gzip', 'Vercel Edge CDN'], color: 'bg-nb-blue', icon: Blocks },
                  { title: 'Backend', items: ['Express + clustering', '3 Bull async queues', 'Redis cache layer', 'Rate limiting + Helmet'], color: 'bg-nb-pink', icon: Server },
                  { title: 'Data & AI', items: ['MongoDB Atlas pooling', 'Pinecone vector search', 'Gemini LLM + embeddings', 'AES-256 encryption'], color: 'bg-nb-yellow', icon: Database },
                ].map((col, ci) => (
                  <TiltCard key={col.title} intensity={3}>
                    <div className="border-3 border-black bg-white rounded-lg p-5 h-full hover:shadow-nb transition-shadow duration-300 group">
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`w-8 h-8 ${col.color} border-2 border-black rounded flex items-center justify-center group-hover:rotate-[-6deg] transition-transform duration-300`}>
                          <col.icon className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wider">{col.title}</span>
                      </div>
                      <ul className="space-y-2.5">
                        {col.items.map(item => (
                          <li key={item} className="flex items-start gap-2 text-sm group/item">
                            <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 flex-shrink-0 group-hover/item:bg-nb-yellow transition-colors" />
                            <span className="group-hover/item:text-black group-hover/item:font-medium transition-all">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TiltCard>
                ))}
              </div>

              {/* Connection beams */}
              <div className="hidden md:flex justify-center mt-5 gap-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex-1 px-4">
                    <Beam />
                  </div>
                ))}
              </div>

              {/* Bottom connection label */}
              <div className="hidden md:flex justify-center mt-3">
                <motion.div className="px-4 py-1.5 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-widest"
                  animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                  Fully Integrated Pipeline
                </motion.div>
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
    <section id="oss" className="py-14 sm:py-20 lg:py-28 relative bg-white">
      <WaveDivider flip color="#FFFEF0" className="absolute top-0 left-0 right-0 -translate-y-[calc(100%-1px)]" />
      <GridBg dotted />
      <GlowOrb className="w-80 h-80 top-10 left-10" color="bg-nb-green/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <Reveal variants={slideL}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              <SplitText>Fully open source.</SplitText>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nb-green to-[#00E676]">MIT licensed.</span>
            </h2>
            <p className="mt-4 text-nb-muted text-lg leading-relaxed">Fork it, self-host it, tear it apart and rebuild. No lock-in, no limits, no surprises.</p>
            <div className="mt-8 space-y-3">
              {[
                { t: 'Complete frontend + backend source', i: Code2 },
                { t: 'One-click Vercel + Render deploy', i: Rocket },
                { t: 'Docs, guides, and examples included', i: FileText },
                { t: 'Active development — PRs welcome', i: Github },
              ].map(({ t, i: Ic }) => (
                <div key={t} className="flex items-start gap-2.5 group hover:translate-x-1 transition-transform duration-200">
                  <Ic className="w-4 h-4 mt-0.5 text-nb-green group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <MagneticWrap strength={0.15}>
                <a href="https://github.com/pavankumar-vh/RAGHost" target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-lg bg-black text-white"><Github className="w-5 h-5" />View on GitHub</a>
              </MagneticWrap>
              <MagneticWrap strength={0.15}>
                <a href="https://github.com/pavankumar-vh/RAGHost" target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-lg bg-white text-black"><Star className="w-5 h-5" />Star</a>
              </MagneticWrap>
            </div>
          </Reveal>

          <Reveal variants={slideR}>
            <div className="relative group">
              <div className="absolute inset-0 translate-x-3 translate-y-3 bg-black rounded-xl group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300" />
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
                  <TerminalLine delay={0.2} prompt>git clone https://github.com/pavankumar-vh/RAGHost.git</TerminalLine>
                  <TerminalLine delay={0.6} dim indent>Cloning into &apos;RAGHost&apos;... done.</TerminalLine>
                  <TerminalLine delay={1.0} prompt>cd RAGHost && npm install</TerminalLine>
                  <TerminalLine delay={1.4} dim indent>added 573 packages in 12s</TerminalLine>
                  <TerminalLine delay={1.8} prompt>cp .env.example .env && npm run dev</TerminalLine>
                  <TerminalLine delay={2.2} color="text-[#FEBC2E]" indent>Server &rarr; http://localhost:3000</TerminalLine>
                  <TerminalLine delay={2.4} color="text-[#4D9FFF]" indent>Frontend &rarr; http://localhost:5173</TerminalLine>
                  <TerminalLine delay={2.6} color="text-[#28C840]" indent>Ready.</TerminalLine>
                  <motion.div className="flex items-center gap-1 mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }}>
                    <span className="text-[#28C840]">~</span>
                    <motion.span className="w-[7px] h-[15px] bg-white/80" animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: 'steps(1)' }} />
                  </motion.div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <WaveDivider color="#FFFEF0" className="absolute bottom-0 left-0 right-0 translate-y-[calc(100%-1px)]" />
    </section>
  );
}

/* ─── animated terminal line ─── */
function TerminalLine({ children, delay = 0, prompt = false, dim = false, indent = false, color = '' }) {
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.3 }}
      className={`${indent ? 'pl-4' : ''} ${dim ? 'text-white/25' : ''} ${color}`}>
      {prompt && <span className="text-[#28C840]">~ </span>}
      <span className={prompt ? 'text-white/90' : ''}>{children}</span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   FAQ
   ═══════════════════════════════════════ */
function FAQ() {
  const items = [
    { q: 'Is RAGHost really free?', a: 'Yes. RAGHost is fully open source under the MIT license. You can deploy it yourself for free — you only pay for the third-party services you use (MongoDB Atlas, Pinecone, Gemini API), all of which have generous free tiers.' },
    { q: 'What document formats can I upload?', a: 'PDF, TXT, DOCX, and Markdown files. Each document is automatically chunked into optimal sizes, vectorized using Gemini embeddings, and indexed in Pinecone for fast retrieval.' },
    { q: 'How does the chatbot stay on-topic?', a: 'RAGHost uses Retrieval Augmented Generation (RAG). Your chatbot can only reference information from the documents you uploaded. It doesn\'t hallucinate or go off-topic because it\'s grounded in your specific knowledge base.' },
    { q: 'Can I customize the look of the widget?', a: 'Absolutely. You can change the color scheme, position, size, welcome message, and more through the dashboard. The widget also ships with multiple templates: minimal, glass, modern dark, and default.' },
    { q: 'How do I deploy RAGHost?', a: 'One-click deploy to Vercel (frontend) and Render (backend). Or self-host on any cloud provider. The deploy guide covers everything from environment variables to DNS setup.' },
    { q: 'Is my API key data secure?', a: 'All API keys are encrypted using AES-256 before storage. The backend uses Helmet headers, CORS whitelisting, and per-IP rate limiting. Firebase Auth handles user authentication.' },
  ];

  return (
    <section id="faq" className="py-14 sm:py-20 lg:py-28 relative">
      <GridBg dotted />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="mb-14 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            <SplitText>Frequently asked</SplitText>{' '}
            <span className="relative inline-block">
              <SplitText>questions</SplitText>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-nb-purple/20 -z-[1]" />
            </span>
          </h2>
        </Reveal>

        <div className="space-y-3">
          {items.map((item, i) => (
            <Reveal key={i} custom={i * 0.5}>
              <FAQItem question={item.q} answer={item.a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-3 border-black rounded-lg overflow-hidden transition-all duration-300 ${open ? 'shadow-nb bg-white' : 'bg-white/80 shadow-nb-sm hover:shadow-nb hover:-translate-y-px hover:-translate-x-px'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-bold text-sm">
        <span>{question}</span>
        <motion.div animate={{ rotate: open ? 0 : 0 }} className="flex-shrink-0">
          {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }} className="overflow-hidden">
            <div className="px-5 pb-4 text-sm text-nb-muted leading-relaxed border-t border-black/10 pt-3">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════
   CTA (with animated gradient)
   ═══════════════════════════════════════ */
function CTA() {
  return (
    <section className="py-14 sm:py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-black" />
            <div className="absolute inset-0 opacity-30 animate-gradient-shift bg-[length:400%_400%] bg-gradient-to-br from-nb-yellow via-nb-pink to-nb-blue" />

            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.04]">
              <svg width="100%" height="100%">
                <filter id="ctaNoise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" /></filter>
                <rect width="100%" height="100%" filter="url(#ctaNoise)" />
              </svg>
            </div>

            <GlowOrb className="w-64 h-64 -top-20 -left-20" color="bg-nb-yellow/15" />
            <GlowOrb className="w-72 h-72 -bottom-20 -right-20" color="bg-nb-pink/12" />
            <GlowOrb className="w-40 h-40 top-1/2 left-1/3" color="bg-nb-blue/10" />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative z-10 p-6 sm:p-8 md:p-16 text-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
                transition={{ duration: 0.6, ease }}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight">
                  Ready to build?
                </h2>
              </motion.div>
              <motion.p initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="mt-4 text-white/40 text-lg max-w-md mx-auto">
                Open source, production-grade, free to start. Your first chatbot is 10 minutes away.
              </motion.p>

              <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <MagneticWrap strength={0.15}>
                  <Link to="/auth" className="nb-btn nb-btn-lg bg-nb-yellow text-black text-base border-nb-yellow hover:bg-white hover:border-white transition-colors">
                    Get Started
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowRight className="w-5 h-5" /></motion.span>
                  </Link>
                </MagneticWrap>
                <MagneticWrap strength={0.15}>
                  <a href="https://github.com/pavankumar-vh/RAGHost" target="_blank" rel="noopener noreferrer"
                    className="nb-btn nb-btn-lg bg-transparent text-white border-white/20 hover:border-white/50 hover:bg-white/5 text-base transition-all">
                    <Github className="w-5 h-5" />Source Code
                  </a>
                </MagneticWrap>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/35">
                {[
                  { t: 'No credit card', i: ShieldCheck },
                  { t: 'MIT License', i: FileText },
                  { t: 'Self-hostable', i: Cloud },
                ].map(({ t, i: Ic }) => (
                  <span key={t} className="flex items-center gap-1.5 hover:text-white/60 transition-colors cursor-default">
                    <Ic className="w-3.5 h-3.5" />{t}
                  </span>
                ))}
              </motion.div>
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
    <footer className="py-8 sm:py-12 border-t-3 border-black bg-nb-bg relative">
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
              {[{ l: 'Features', h: '#features' }, { l: 'How It Works', h: '#how-it-works' }, { l: 'Stack', h: '#stack' }, { l: 'FAQ', h: '#faq' }].map(x => (
                <li key={x.l}><a href={x.h} className="text-nb-muted hover:text-black hover:translate-x-0.5 transition-all inline-block">{x.l}</a></li>
              ))}
              <li><Link to="/auth" className="text-nb-muted hover:text-black hover:translate-x-0.5 transition-all inline-block">Dashboard</Link></li>
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
              ].map(x => (
                <li key={x.l}><a href={x.h} target="_blank" rel="noopener noreferrer" className="text-nb-muted hover:text-black hover:translate-x-0.5 transition-all inline-flex items-center gap-1">{x.l}<ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" /></a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[10px] mb-3 uppercase tracking-widest text-nb-muted">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/pavankumar-vh/RAGHost/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-nb-muted hover:text-black hover:translate-x-0.5 transition-all inline-block">MIT License</a></li>
              <li><a href="https://github.com/pavankumar-vh/RAGHost/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noopener noreferrer" className="text-nb-muted hover:text-black hover:translate-x-0.5 transition-all inline-block">Code of Conduct</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-nb-muted">{new Date().getFullYear()} RAGHost &mdash; <a href="https://github.com/pavankumar-vh" target="_blank" rel="noopener noreferrer" className="font-semibold text-black hover:text-nb-pink transition-colors">pavankumar-vh</a></p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/pavankumar-vh/RAGHost" target="_blank" rel="noopener noreferrer" className="text-nb-muted hover:text-black transition-colors hover:scale-110 transform" aria-label="GitHub"><Github className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══ LANDING PAGE ═══ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-nb-bg overflow-x-hidden">
      <CursorFollower />
      <ScrollProgress />
      <NoiseOverlay />
      <Navbar />
      <Hero />
      <Ticker />
      <Stats />
      <Features />
      <HowItWorks />
      <TechStackSection />
      <OpenSource />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
