import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  Bot, Zap, Shield, Upload, Code2, BarChart3, MessageSquare,
  ArrowRight, ChevronRight, Database, Cpu, Globe, Lock,
  FileText, Layers, Sparkles, Terminal, CheckCircle2, Star,
  Menu, X, ExternalLink, Github, Play, MousePointerClick
} from 'lucide-react';

/* ─── animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

function AnimatedSection({ children, className = '', variants = fadeUp, custom = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      custom={custom}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── floating shapes ─── */
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute top-20 left-[8%] w-16 h-16 bg-nb-yellow border-3 border-black rounded rotate-12"
        animate={{ y: [0, -20, 0], rotate: [12, -5, 12] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-40 right-[12%] w-12 h-12 bg-nb-pink border-3 border-black rounded-full"
        animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute bottom-32 left-[15%] w-10 h-10 bg-nb-blue border-3 border-black"
        animate={{ rotate: [0, 90, 0], y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute top-[60%] right-[6%] w-14 h-14 bg-nb-green border-3 border-black rounded-lg rotate-45"
        animate={{ y: [0, 20, 0], rotate: [45, 30, 45] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.div
        className="absolute top-[30%] left-[3%] w-8 h-8 bg-nb-purple border-3 border-black rounded-full"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Tech Stack', href: '#tech-stack' },
    { label: 'Open Source', href: '#open-source' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-nb-bg/95 backdrop-blur-md border-b-3 border-black shadow-[0_4px_0_0_#000]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-nb-yellow border-3 border-black rounded flex items-center justify-center shadow-nb-sm group-hover:shadow-nb transition-shadow">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">RAGHost</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-semibold text-nb-text hover:bg-nb-yellow/30 rounded transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://github.com/pavankumar-vh/RAGHost"
              target="_blank"
              rel="noopener noreferrer"
              className="nb-btn nb-btn-sm bg-white text-black"
            >
              <Github className="w-4 h-4" />
              Star on GitHub
            </a>
            <Link to="/auth" className="nb-btn nb-btn-sm bg-nb-yellow text-black">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 border-2 border-black rounded bg-white shadow-nb-sm active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-nb-bg border-b-3 border-black shadow-[0_4px_0_0_#000] px-4 pb-4"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block py-3 text-sm font-semibold border-b border-gray-200 last:border-0"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 mt-4">
            <a
              href="https://github.com/pavankumar-vh/RAGHost"
              target="_blank"
              rel="noopener noreferrer"
              className="nb-btn nb-btn-sm bg-white text-black justify-center"
            >
              <Github className="w-4 h-4" />
              Star on GitHub
            </a>
            <Link to="/auth" className="nb-btn nb-btn-sm bg-nb-yellow text-black justify-center" onClick={() => setIsOpen(false)}>
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <FloatingShapes />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="nb-badge bg-nb-yellow mb-6 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Open Source &middot; MIT License
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight"
            >
              Build AI Chatbots{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Powered by</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 sm:h-4 bg-nb-yellow -z-0 -rotate-1" />
              </span>{' '}
              <span className="text-nb-pink">Your Own Data</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 text-lg sm:text-xl text-nb-muted max-w-lg leading-relaxed"
            >
              Upload documents, connect your vector database, and deploy embeddable RAG chatbots — 
              in minutes, not months. Production-ready from day one.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3 mt-8"
            >
              <Link
                to="/auth"
                className="nb-btn nb-btn-lg bg-nb-yellow text-black text-base"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="nb-btn nb-btn-lg bg-white text-black text-base"
              >
                <Play className="w-5 h-5" />
                See How It Works
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap items-center gap-4 mt-10 text-sm text-nb-muted"
            >
              {[
                { icon: Shield, label: 'AES-256 Encrypted' },
                { icon: Zap, label: 'Sub-200ms Responses' },
                { icon: Globe, label: 'Deploy Anywhere' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-nb-green" />
                  {label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — hero visual */}
          <motion.div
            style={{ y }}
            initial={{ opacity: 0, x: 60, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 2 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            {/* Browser mockup */}
            <div className="relative">
              {/* Shadow card behind */}
              <div className="absolute inset-0 translate-x-3 translate-y-3 bg-black rounded-lg" />
              
              <div className="relative bg-white border-3 border-black rounded-lg overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b-3 border-black bg-nb-bg">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-nb-red border-2 border-black" />
                    <div className="w-3 h-3 rounded-full bg-nb-yellow border-2 border-black" />
                    <div className="w-3 h-3 rounded-full bg-nb-green border-2 border-black" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white border-2 border-black rounded px-3 py-1 text-xs font-mono text-nb-muted">
                      rag-host.vercel.app/dashboard
                    </div>
                  </div>
                </div>
                
                {/* Dashboard mockup */}
                <div className="p-4 bg-nb-bg space-y-3">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-nb-yellow border-2 border-black rounded flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm">My Bots</span>
                    </div>
                    <div className="nb-badge bg-nb-green text-white text-[10px]">3 Active</div>
                  </div>
                  
                  {/* Bot cards */}
                  {[
                    { name: 'Support Bot', color: 'bg-nb-blue', msgs: '2.4k', status: 'Live' },
                    { name: 'Sales Assistant', color: 'bg-nb-pink', msgs: '891', status: 'Live' },
                    { name: 'Docs Helper', color: 'bg-nb-purple', msgs: '1.2k', status: 'Draft' },
                  ].map((bot, i) => (
                    <motion.div
                      key={bot.name}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.15 }}
                      className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded shadow-nb-sm"
                    >
                      <div className={`w-8 h-8 ${bot.color} border-2 border-black rounded flex items-center justify-center`}>
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{bot.name}</p>
                        <p className="text-[10px] text-nb-muted">{bot.msgs} messages</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 border-2 border-black rounded ${
                        bot.status === 'Live' ? 'bg-nb-green text-white' : 'bg-gray-100'
                      }`}>
                        {bot.status}
                      </span>
                    </motion.div>
                  ))}
                  
                  {/* Mini chart */}
                  <div className="bg-white border-2 border-black rounded p-3 shadow-nb-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-nb-muted">Messages Today</span>
                      <span className="text-sm font-bold text-nb-green">+24%</span>
                    </div>
                    <div className="flex items-end gap-1 h-10">
                      {[40, 55, 35, 70, 50, 80, 65, 90, 75, 95, 85, 100].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1.2 + i * 0.05, duration: 0.4 }}
                          className="flex-1 bg-nb-yellow border border-black rounded-sm"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chat widget preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -bottom-6 -left-10 w-56"
            >
              <div className="bg-white border-3 border-black rounded-lg shadow-nb overflow-hidden">
                <div className="bg-nb-blue px-3 py-2 border-b-3 border-black flex items-center gap-2">
                  <Bot className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold text-white">RAGHost Widget</span>
                </div>
                <div className="p-2.5 space-y-2">
                  <div className="bg-gray-100 border border-gray-200 rounded px-2.5 py-1.5 text-[10px] max-w-[80%]">
                    How do I reset my password?
                  </div>
                  <div className="bg-nb-blue/10 border border-nb-blue/20 rounded px-2.5 py-1.5 text-[10px] ml-auto max-w-[85%]">
                    You can reset your password from Settings → Security. I found this in your docs!
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-nb-bg to-transparent" />
    </section>
  );
}

/* ─── Stats ─── */
function Stats() {
  const stats = [
    { value: '10min', label: 'Setup to Deploy', icon: Zap },
    { value: '100K+', label: 'Users Scalable', icon: Globe },
    { value: '<200ms', label: 'Response Time', icon: Cpu },
    { value: 'AES-256', label: 'Encryption', icon: Lock },
  ];

  return (
    <section className="relative py-16 border-y-3 border-black bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map(({ value, label, icon: Icon }, i) => (
            <AnimatedSection key={label} custom={i} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-nb-yellow border-3 border-white rounded-lg mb-3">
                <Icon className="w-6 h-6 text-black" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold">{value}</div>
              <div className="text-sm text-gray-400 mt-1">{label}</div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function Features() {
  const features = [
    {
      icon: Bot,
      title: 'Multi-Bot Management',
      desc: 'Create unlimited bots, each with its own knowledge base, system prompt, color theme, and API keys — all from one dashboard.',
      color: 'bg-nb-yellow',
      shadow: 'shadow-nb-yellow',
    },
    {
      icon: Upload,
      title: 'Knowledge Base Upload',
      desc: 'Upload PDF, TXT, DOCX, and Markdown files. Documents are chunked, embedded, and stored in your Pinecone index automatically.',
      color: 'bg-nb-pink',
      shadow: 'shadow-nb-pink',
    },
    {
      icon: Code2,
      title: 'One-Click Embed',
      desc: 'Copy-paste embed snippets for HTML, React, Vue, or Vanilla JS. Version history and A/B test copy generator included.',
      color: 'bg-nb-blue',
      shadow: 'shadow-nb-blue',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      desc: 'Per-bot and global metrics — message counts, session tracking, activity over time, and top-performing bots leaderboard.',
      color: 'bg-nb-green',
      shadow: '',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      desc: 'Firebase JWT auth, AES-256 encrypted key storage, Helmet.js headers, CORS whitelist, per-IP rate limiting on every endpoint.',
      color: 'bg-nb-purple',
      shadow: '',
    },
    {
      icon: Layers,
      title: 'Built for Scale',
      desc: 'MongoDB connection pooling, Redis caching, 3 Bull queues, CPU clustering — from 1 user to 100,000+ without breaking a sweat.',
      color: 'bg-nb-orange',
      shadow: '',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-14">
          <span className="nb-badge bg-nb-pink text-white mb-4 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything You Need to Ship{' '}
            <span className="relative inline-block">
              <span className="relative z-10">AI Chatbots</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-nb-pink/30 -z-0" />
            </span>
          </h2>
          <p className="mt-4 text-nb-muted text-lg">
            A complete platform for building, deploying, and managing RAG-powered bots — no infrastructure management required.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color, shadow }, i) => (
            <AnimatedSection key={title} custom={i} variants={scaleIn}>
              <div className={`group h-full p-6 bg-white border-3 border-black rounded-lg shadow-nb hover:shadow-nb-lg hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200`}>
                <div className={`inline-flex items-center justify-center w-12 h-12 ${color} border-2 border-black rounded-lg mb-4 group-hover:rotate-[-4deg] transition-transform`}>
                  <Icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-nb-muted leading-relaxed">{desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Create a Bot',
      desc: 'Name your bot, set a system prompt, and configure its personality. Choose a color theme and avatar.',
      icon: Bot,
      color: 'bg-nb-yellow',
    },
    {
      step: '02',
      title: 'Upload Documents',
      desc: 'Drop in PDFs, TXT, DOCX, or Markdown files. They get chunked, vectorized, and indexed in Pinecone automatically.',
      icon: FileText,
      color: 'bg-nb-pink',
    },
    {
      step: '03',
      title: 'Connect API Keys',
      desc: 'Add your Pinecone and Gemini API keys. They\'re encrypted with AES-256 and stored securely.',
      icon: Lock,
      color: 'bg-nb-blue',
    },
    {
      step: '04',
      title: 'Embed & Deploy',
      desc: 'Grab a one-line embed snippet and drop it on any website. Your AI chatbot is live in seconds.',
      icon: Code2,
      color: 'bg-nb-green',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-nb-bg relative">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,#000_0px,#000_8px,transparent_8px,transparent_16px)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <span className="nb-badge bg-nb-blue text-white mb-4 inline-flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            From Zero to{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Production</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-nb-blue/30 -z-0" />
            </span>{' '}
            in 4 Steps
          </h2>
          <p className="mt-4 text-nb-muted text-lg">
            No complex pipeline setup. No DevOps team needed. Just connect and ship.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ step, title, desc, icon: Icon, color }, i) => (
            <AnimatedSection key={step} custom={i} variants={fadeUp}>
              <div className="relative h-full">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-[repeating-linear-gradient(90deg,#000_0px,#000_6px,transparent_6px,transparent_12px)] z-0" />
                )}
                
                <div className="relative bg-white border-3 border-black rounded-lg p-6 shadow-nb h-full">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-2 bg-black text-white text-xs font-bold px-3 py-1 rounded border-2 border-black">
                    STEP {step}
                  </div>
                  
                  <div className={`w-14 h-14 ${color} border-3 border-black rounded-lg flex items-center justify-center mt-3 mb-4`}>
                    <Icon className="w-7 h-7 text-black" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{title}</h3>
                  <p className="text-sm text-nb-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Embed code preview */}
        <AnimatedSection className="mt-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#1a1a2e] border-3 border-black rounded-lg overflow-hidden shadow-nb-lg">
              {/* Terminal chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-gray-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-nb-red" />
                  <div className="w-3 h-3 rounded-full bg-nb-yellow" />
                  <div className="w-3 h-3 rounded-full bg-nb-green" />
                </div>
                <span className="text-xs text-gray-400 font-mono ml-2">embed-code.html</span>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed">
                  <code>
                    <span className="text-gray-500">{'<!-- Drop this anywhere on your site -->'}</span>{'\n'}
                    <span className="text-nb-pink">{'<script'}</span>{'\n'}
                    {'  '}<span className="text-nb-blue">src</span><span className="text-white">=</span><span className="text-nb-green">{'"https://rag-host.vercel.app/widget.js"'}</span>{'\n'}
                    {'  '}<span className="text-nb-blue">data-bot-id</span><span className="text-white">=</span><span className="text-nb-green">{'"your-bot-id"'}</span>{'\n'}
                    {'  '}<span className="text-nb-blue">data-color</span><span className="text-white">=</span><span className="text-nb-green">{'"#4D9FFF"'}</span>{'\n'}
                    {'  '}<span className="text-nb-blue">data-position</span><span className="text-white">=</span><span className="text-nb-green">{'"bottom-right"'}</span>{'\n'}
                    <span className="text-nb-pink">{'></script>'}</span>
                  </code>
                </pre>
              </div>
            </div>
            <p className="text-center text-sm text-nb-muted mt-4">
              <MousePointerClick className="w-4 h-4 inline mr-1" />
              One script tag. That's it. Your chatbot is live.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ─── Tech Stack ─── */
function TechStack() {
  const stack = [
    { name: 'React 18', category: 'Frontend', icon: '⚛️' },
    { name: 'Vite', category: 'Build', icon: '⚡' },
    { name: 'TailwindCSS', category: 'Styling', icon: '🎨' },
    { name: 'Node.js', category: 'Runtime', icon: '🟢' },
    { name: 'Express', category: 'API', icon: '🚀' },
    { name: 'MongoDB', category: 'Database', icon: '🍃' },
    { name: 'Firebase', category: 'Auth', icon: '🔥' },
    { name: 'Pinecone', category: 'Vectors', icon: '🌲' },
    { name: 'Gemini AI', category: 'LLM', icon: '✨' },
    { name: 'Redis', category: 'Cache', icon: '🔴' },
    { name: 'Bull MQ', category: 'Queues', icon: '🐂' },
    { name: 'Vercel', category: 'Deploy', icon: '▲' },
  ];

  return (
    <section id="tech-stack" className="py-20 lg:py-28 border-y-3 border-black bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-14">
          <span className="nb-badge bg-nb-yellow mb-4 inline-flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            Tech Stack
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Powered by the{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Modern Stack</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-nb-yellow/40 -z-0" />
            </span>
          </h2>
          <p className="mt-4 text-nb-muted text-lg">
            Battle-tested technologies chosen for reliability, performance, and developer experience.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stack.map(({ name, category, icon }, i) => (
            <AnimatedSection key={name} custom={i} variants={scaleIn}>
              <div className="group p-4 bg-nb-bg border-3 border-black rounded-lg shadow-nb-sm hover:shadow-nb hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200 text-center">
                <div className="text-2xl mb-2">{icon}</div>
                <p className="text-sm font-bold">{name}</p>
                <p className="text-[10px] text-nb-muted uppercase tracking-wider mt-0.5">{category}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Architecture diagram simplified */}
        <AnimatedSection className="mt-16">
          <div className="bg-nb-bg border-3 border-black rounded-lg p-6 md:p-8 shadow-nb">
            <h3 className="text-lg font-bold mb-6 text-center">Architecture at Scale</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Frontend',
                  items: ['React 18 + Vite', 'TailwindCSS Neo-brutalism', 'Code-split ~200KB gzip', 'Vercel Edge CDN'],
                  color: 'border-nb-blue bg-nb-blue/5',
                  accent: 'bg-nb-blue',
                },
                {
                  title: 'Backend',
                  items: ['Express + Clustering', '3 Bull Async Queues', 'Redis Cache Layer', 'Rate Limiting + Helmet'],
                  color: 'border-nb-pink bg-nb-pink/5',
                  accent: 'bg-nb-pink',
                },
                {
                  title: 'Data & AI',
                  items: ['MongoDB Atlas Pooling', 'Pinecone Vector Search', 'Gemini LLM + Embeddings', 'AES-256 Encryption'],
                  color: 'border-nb-yellow bg-nb-yellow/5',
                  accent: 'bg-nb-yellow',
                },
              ].map((col) => (
                <div key={col.title} className={`border-3 border-black ${col.color} rounded-lg p-5`}>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 ${col.accent} border-2 border-black rounded font-bold text-sm mb-4`}>
                    {col.title}
                  </div>
                  <ul className="space-y-2">
                    {col.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-nb-green flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ─── Open Source Section ─── */
function OpenSource() {
  return (
    <section id="open-source" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <AnimatedSection variants={slideInLeft}>
            <span className="nb-badge bg-nb-green text-white mb-4 inline-flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5" />
              Open Source
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              100% Open Source.{' '}
              <span className="text-nb-green">MIT Licensed.</span>
            </h2>
            <p className="mt-4 text-nb-muted text-lg leading-relaxed">
              Full source code on GitHub. Fork it, self-host it, extend it, make it yours.
              No vendor lock-in, no hidden costs, no surprises.
            </p>

            <div className="mt-8 space-y-3">
              {[
                'Full frontend + backend source code',
                'One-click deploy to Vercel + Render',
                'Comprehensive documentation & guides',
                'Active community & PRs welcome',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-nb-green border-2 border-black rounded flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href="https://github.com/pavankumar-vh/RAGHost"
                target="_blank"
                rel="noopener noreferrer"
                className="nb-btn nb-btn-lg bg-black text-white"
              >
                <Github className="w-5 h-5" />
                View on GitHub
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/pavankumar-vh/RAGHost"
                target="_blank"
                rel="noopener noreferrer"
                className="nb-btn nb-btn-lg bg-nb-yellow text-black"
              >
                <Star className="w-5 h-5" />
                Star the Repo
              </a>
            </div>
          </AnimatedSection>

          <AnimatedSection variants={slideInRight}>
            {/* Terminal / Readme preview */}
            <div className="bg-[#0d1117] border-3 border-black rounded-lg shadow-nb-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-gray-700 bg-[#161b22]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-nb-red" />
                  <div className="w-3 h-3 rounded-full bg-nb-yellow" />
                  <div className="w-3 h-3 rounded-full bg-nb-green" />
                </div>
                <span className="text-xs text-gray-400 font-mono ml-2">terminal</span>
              </div>
              <div className="p-5 font-mono text-sm space-y-2">
                <div>
                  <span className="text-nb-green">$</span>{' '}
                  <span className="text-white">git clone https://github.com/pavankumar-vh/RAGHost.git</span>
                </div>
                <div className="text-gray-500">Cloning into 'RAGHost'...</div>
                <div>
                  <span className="text-nb-green">$</span>{' '}
                  <span className="text-white">cd RAGHost && npm install</span>
                </div>
                <div className="text-gray-500">added 573 packages in 12s</div>
                <div>
                  <span className="text-nb-green">$</span>{' '}
                  <span className="text-white">cp .env.example .env</span>
                </div>
                <div>
                  <span className="text-nb-green">$</span>{' '}
                  <span className="text-white">npm run dev</span>
                </div>
                <div className="text-nb-yellow">
                  ⚡ Server running on http://localhost:3000
                </div>
                <div className="text-nb-blue">
                  ⚡ Frontend running on http://localhost:5173
                </div>
                <div className="text-nb-green mt-1">
                  ✓ Ready to build your first RAG chatbot!
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-nb-green">$</span>
                  <span className="w-2 h-4 bg-white animate-pulse" />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(0,0,0,0.02)_20px,rgba(0,0,0,0.02)_40px)]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection>
          <div className="bg-black border-3 border-black rounded-2xl p-8 md:p-14 text-center relative overflow-hidden">
            {/* Decorative shapes inside CTA */}
            <div className="absolute top-6 left-6 w-20 h-20 bg-nb-yellow/20 rounded-full blur-2xl" />
            <div className="absolute bottom-6 right-6 w-24 h-24 bg-nb-pink/20 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-nb-blue/20 rounded-full blur-xl" />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-nb-yellow border-3 border-white rounded-xl mb-6"
              >
                <Sparkles className="w-8 h-8 text-black" />
              </motion.div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Ready to Build Your{' '}
                <span className="text-nb-yellow">AI Chatbot?</span>
              </h2>
              <p className="mt-4 text-gray-400 text-lg max-w-xl mx-auto">
                Join developers who ship RAG-powered chatbots in minutes. Open source, production-ready, and free to start.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <Link
                  to="/auth"
                  className="nb-btn nb-btn-lg bg-nb-yellow text-black text-base border-white"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="https://github.com/pavankumar-vh/RAGHost"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nb-btn nb-btn-lg bg-white/10 text-white border-white/30 hover:bg-white/20 text-base"
                >
                  <Github className="w-5 h-5" />
                  View Source
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-nb-green" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-nb-green" />
                  MIT Licensed
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-nb-green" />
                  Self-hostable
                </span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="py-12 border-t-3 border-black bg-nb-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-nb-yellow border-2 border-black rounded flex items-center justify-center shadow-nb-sm">
                <Bot className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-bold">RAGHost</span>
            </div>
            <p className="text-sm text-nb-muted leading-relaxed max-w-xs">
              Production-ready RAG chatbot platform. Build, embed, and manage AI-powered bots with your own knowledge base.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm text-nb-muted">
              <li><a href="#features" className="hover:text-black transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-black transition-colors">How It Works</a></li>
              <li><a href="#tech-stack" className="hover:text-black transition-colors">Tech Stack</a></li>
              <li><Link to="/auth" className="hover:text-black transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider">Developers</h4>
            <ul className="space-y-2 text-sm text-nb-muted">
              <li>
                <a href="https://github.com/pavankumar-vh/RAGHost" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                  GitHub Repo
                </a>
              </li>
              <li>
                <a href="https://github.com/pavankumar-vh/RAGHost/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                  Contributing
                </a>
              </li>
              <li>
                <a href="https://github.com/pavankumar-vh/RAGHost/blob/main/DEPLOYMENT.md" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                  Deployment Guide
                </a>
              </li>
              <li>
                <a href="https://github.com/pavankumar-vh/RAGHost/issues" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                  Report a Bug
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-nb-muted">
              <li>
                <a href="https://github.com/pavankumar-vh/RAGHost/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                  MIT License
                </a>
              </li>
              <li>
                <a href="https://github.com/pavankumar-vh/RAGHost/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                  Code of Conduct
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-nb-muted">
            &copy; {new Date().getFullYear()} RAGHost. Built with care by{' '}
            <a
              href="https://github.com/pavankumar-vh"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-black hover:text-nb-pink transition-colors"
            >
              pavankumar-vh
            </a>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/pavankumar-vh/RAGHost"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nb-muted hover:text-black transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════
   LANDING PAGE — main export
   ═══════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-nb-bg overflow-x-hidden">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <TechStack />
      <OpenSource />
      <CTA />
      <Footer />
    </div>
  );
}
