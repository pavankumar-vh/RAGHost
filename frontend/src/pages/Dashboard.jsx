import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { botsService, analyticsService, setAuthToken } from '../services/api';
import BotConfigModal from '../components/BotConfigModal';
import EditBotModal from '../components/EditBotModal';
import EmbedCodeModal from '../components/EmbedCodeModal';
import KnowledgeBaseModal from '../components/KnowledgeBaseModal';
import ConfirmDialog from '../components/ConfirmDialog';
import AnalyticsView from '../components/AnalyticsView';
import ProfileView from '../components/ProfileView';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement, PointElement, LinearScale, CategoryScale,
  Filler, Tooltip,
} from 'chart.js';
import {
  Bot, Key, BarChart3, Home, LogOut, BookOpen, Plus, Search, TrendingUp,
  Activity, Zap, Database, MessageSquare, Loader2, Trash2, Edit, Code,
  CheckCircle2, XCircle, Copy, Check, ExternalLink, Menu, X, UserCircle,
  ChevronLeft, ChevronRight, Terminal, Globe, AlertCircle, RefreshCw,
  Upload, Settings, Shield, Cpu, Hash, FileText, ArrowRight, Layers,
} from 'lucide-react';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const Dashboard = () => {
  const { currentUser, logout, getIdToken } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Dashboard');
  const [showBotModal, setShowBotModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [dialogState, setDialogState] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });
  const [deleteBotId, setDeleteBotId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('raghost_sidebar_collapsed') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    fetchBots();
    fetchAnalytics();
  }, []);

  const fetchBots = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();
      if (token) { setAuthToken(token); const data = await botsService.getBots(); setBots(data.bots || []); }
    } catch (error) { setBots([]); } finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    try {
      const token = await getIdToken();
      if (token) {
        setAuthToken(token);
        const [overviewData, dailyData] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getDailyAnalytics(7),
        ]);
        setAnalytics(overviewData.data);
        setDailyStats(dailyData.data || []);
      }
    } catch (error) { /* silent */ }
  };

  const handleCreateBot = async (botData) => {
    const token = await getIdToken();
    if (!token) throw new Error('Authentication required.');
    setAuthToken(token);
    const response = await botsService.createBot(botData);
    if (response.verificationStatus) {
      const { pinecone, gemini, errors } = response.verificationStatus;
      if (pinecone === 'failed' || gemini === 'failed') {
        const failed = [...(pinecone === 'failed' ? ['Pinecone'] : []), ...(gemini === 'failed' ? ['Gemini'] : [])];
        setDialogState({ isOpen: true, type: 'warning', title: 'Bot Created with Warnings',
          message: `Bot created but ${failed.join(' and ')} verification failed.\n\n${errors ? `Errors:\n${errors.join('\n')}` : ''}`, onConfirm: null });
      } else {
        setDialogState({ isOpen: true, type: 'success', title: 'Bot Created!', message: 'All connections verified. Your bot is ready.', onConfirm: null });
      }
    }
    await fetchBots();
  };

  const handleUpdateBot = async (botId, botData) => {
    const token = await getIdToken();
    if (!token) throw new Error('Authentication required.');
    setAuthToken(token);
    await botsService.updateBot(botId, botData);
    setDialogState({ isOpen: true, type: 'success', title: 'Bot Updated!', message: 'Your changes have been saved.', onConfirm: null });
    await fetchBots();
  };

  const handleDeleteBot = async (botId) => {
    const token = await getIdToken();
    if (token) { setAuthToken(token); await botsService.deleteBot(botId); await fetchBots(); }
  };

  // Stats data
  const stats = {
    totalBots: bots.length,
    activeBot: bots.filter(b => b.status === 'active').length,
    totalQueries: bots.reduce((sum, b) => sum + (b.totalQueries || 0), 0),
    avgAccuracy: bots.length > 0
      ? Math.round(bots.reduce((sum, b) => sum + (b.accuracy || 0), 0) / bots.length)
      : 0,
  };

  const handleLogout = async () => {
    try { await logout(); navigate('/auth'); } catch (e) { /* silent */ }
  };

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    try { localStorage.setItem('raghost_sidebar_collapsed', String(next)); } catch {}
  };

  return (
    <div className="min-h-screen bg-nb-bg font-sans flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => { setActivePage(page); setSidebarOpen(false); }}
        handleLogout={handleLogout}
        currentUser={currentUser}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <main className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ease-out ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <header className="sticky top-0 z-10 bg-nb-bg border-b-2 border-black px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button className="lg:hidden nb-btn bg-white p-2 flex-shrink-0" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <h1 className="text-base sm:text-xl font-bold text-nb-text truncate">{activePage}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search bots..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="nb-input pl-9 py-2 w-40 md:w-52 text-sm" />
            </div>
            {/* Profile avatar button */}
            <button
              onClick={() => setActivePage('Profile')}
              className={`w-9 h-9 border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${
                activePage === 'Profile' ? 'border-black bg-nb-yellow shadow-nb-sm' : 'border-black bg-white hover:bg-nb-yellow'
              }`}
              title="Profile"
            >
              {currentUser?.displayName
                ? currentUser.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                : currentUser?.email?.[0]?.toUpperCase() || 'U'
              }
            </button>
          </div>
        </header>
        <div className="flex-1 p-3 sm:p-5 lg:p-8">
          {activePage === 'Dashboard' && <DashboardView stats={stats} bots={bots} setShowBotModal={setShowBotModal} loading={loading} dailyStats={dailyStats} />}
          {activePage === 'My Bots' && <MyBotsView bots={bots} setShowBotModal={setShowBotModal} setSelectedBot={setSelectedBot} setShowKnowledgeModal={setShowKnowledgeModal} onEdit={bot => { setSelectedBot(bot); setShowEditModal(true); }} onDelete={id => setDeleteBotId(id)} onShowEmbed={bot => { setSelectedBot(bot); setShowEmbedModal(true); }} loading={loading} searchQuery={searchQuery} />}
          {activePage === 'API Keys' && <ApiKeysView bots={bots} loading={loading} fetchBots={fetchBots} onEdit={bot => { setSelectedBot(bot); setShowEditModal(true); }} />}
          {activePage === 'Analytics' && <AnalyticsView bots={bots} loading={loading} />}
          {activePage === 'Documentation' && <DocumentationView />}
          {activePage === 'Profile' && <ProfileView bots={bots} />}
        </div>
      </main>
      {showBotModal && <BotConfigModal setShowModal={setShowBotModal} onSave={handleCreateBot} />}
      {showEditModal && selectedBot && <EditBotModal bot={selectedBot} setShowModal={setShowEditModal} onSave={handleUpdateBot} />}
      {showKnowledgeModal && selectedBot && <KnowledgeBaseModal bot={selectedBot} setShowModal={setShowKnowledgeModal} />}
      {showEmbedModal && selectedBot && <EmbedCodeModal bot={selectedBot} setShowModal={setShowEmbedModal} />}
      <ConfirmDialog isOpen={dialogState.isOpen} onClose={() => setDialogState({ ...dialogState, isOpen: false })} onConfirm={dialogState.onConfirm} title={dialogState.title} message={dialogState.message} type={dialogState.type} />
      <ConfirmDialog isOpen={deleteBotId !== null} onClose={() => setDeleteBotId(null)} onConfirm={() => { handleDeleteBot(deleteBotId); setDeleteBotId(null); }} title="Delete Bot?" message="Are you sure you want to permanently delete this bot?" confirmText="Delete Bot" cancelText="Cancel" type="warning" danger={true} />
    </div>
  );
};

/* ─────────────────── SIDEBAR ─────────────────── */
const Sidebar = ({ activePage, setActivePage, handleLogout, currentUser, isOpen, onClose, collapsed, onToggleCollapse }) => {
  const menuItems = [
    { name: 'Dashboard',     icon: Home,     accent: 'bg-nb-yellow' },
    { name: 'My Bots',       icon: Bot,      accent: 'bg-nb-pink' },
    { name: 'API Keys',      icon: Key,      accent: 'bg-nb-blue' },
    { name: 'Analytics',     icon: BarChart3, accent: 'bg-purple-300' },
    { name: 'Documentation', icon: BookOpen,  accent: 'bg-orange-300' },
  ];

  const initials = (currentUser?.displayName || currentUser?.email || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r-2 border-black flex flex-col z-30
      transition-all duration-300 ease-in-out overflow-hidden
      ${ isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      ${ collapsed ? 'w-16' : 'w-64' }`}>

      {/* Logo row */}
      <div className={`border-b-2 border-black flex items-center flex-shrink-0 h-14 ${ collapsed ? 'justify-center px-0' : 'px-4 justify-between' }`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-nb-yellow border-2 border-black flex items-center justify-center flex-shrink-0"><Bot size={16} /></div>
            <span className="text-lg font-black tracking-tight">RAGhost</span>
          </div>
        )}
        {collapsed && <div className="w-8 h-8 bg-nb-yellow border-2 border-black flex items-center justify-center"><Bot size={16} /></div>}
        <button className="lg:hidden p-1 border-2 border-transparent hover:border-black" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-3 py-3 border-b-2 border-black bg-nb-yellow/20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border-2 border-black bg-nb-yellow flex items-center justify-center font-bold text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[11px] text-nb-muted truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {menuItems.map(({ name, icon: Icon, accent }) => {
          const active = activePage === name;
          return (
            <button key={name} onClick={() => setActivePage(name)} title={collapsed ? name : undefined}
              className={`w-full flex items-center gap-3 font-bold text-sm border-2 transition-all duration-150
                ${ collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5' }
                ${ active ? `${accent} border-black shadow-nb-sm text-black` : 'border-transparent text-nb-muted hover:border-black hover:bg-gray-50 hover:text-black' }`}>
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle + Logout */}
      <div className="p-2 border-t-2 border-black flex-shrink-0 space-y-0.5">
        {/* Sign out */}
        <button onClick={handleLogout} title={collapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-3 font-bold text-sm border-2 border-transparent text-nb-muted hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150
            ${ collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5' }`}>
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        {/* Collapse toggle — desktop only */}
        <button onClick={onToggleCollapse} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`hidden lg:flex w-full items-center gap-3 font-bold text-sm border-2 border-transparent text-nb-muted hover:border-black hover:bg-gray-50 hover:text-black transition-all duration-150
            ${ collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5' }`}>
          {collapsed ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronLeft size={16} className="flex-shrink-0" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

/* ─────────────────── DASHBOARD VIEW ─────────────────── */
const DashboardView = ({ stats, bots, setShowBotModal, loading, dailyStats }) => {
  if (loading) return <LoadingSpinner />;

  const statCards = [
    { title: 'Total Bots',    value: stats.totalBots,                    icon: Bot,           bg: 'bg-nb-yellow' },
    { title: 'Active Bots',   value: stats.activeBot,                    icon: Zap,           bg: 'bg-nb-pink' },
    { title: 'Total Queries', value: stats.totalQueries.toLocaleString(), icon: MessageSquare, bg: 'bg-nb-blue' },
    { title: 'Avg Accuracy',  value: `${stats.avgAccuracy}%`,            icon: TrendingUp,    bg: 'bg-purple-300' },
  ];

  return (
    <div className="space-y-5 w-full">
      {bots.length === 0 && (
        <div className="bg-nb-yellow border-2 border-black shadow-nb p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center flex-shrink-0"><Bot size={24} /></div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-black">Welcome to RAGhost! 🎉</h3>
              <p className="text-sm text-black/70 mt-0.5">Create your first bot to get started.</p>
            </div>
            <button onClick={() => setShowBotModal(true)} className="nb-btn bg-black text-white border-black hover:bg-gray-900 px-4 py-2 flex items-center gap-2 flex-shrink-0">
              <Plus size={16} />Create Bot
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map(({ title, value, icon: Icon, bg }) => (
          <div key={title} className={`${bg} border-2 border-black shadow-nb p-5`}>
            <div className="w-9 h-9 border-2 border-black bg-white flex items-center justify-center mb-3"><Icon size={18} /></div>
            <p className="text-3xl font-bold text-black">{value}</p>
            <p className="text-xs font-bold text-black/60 mt-1 uppercase tracking-wide">{title}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white border-2 border-black shadow-nb p-6">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-bold text-lg">Query Activity</h3><p className="text-xs text-nb-muted">Last 7 days</p></div>
            <div className="w-8 h-8 bg-nb-yellow border-2 border-black flex items-center justify-center"><Activity size={16} /></div>
          </div>
          <ActivityChart dailyStats={dailyStats} />
        </div>
        <div className="space-y-4">
          <div className="bg-black text-white border-2 border-black shadow-nb p-5">
            <h3 className="font-bold mb-3">Quick Actions</h3>
            <button onClick={() => setShowBotModal(true)} className="w-full border-2 border-white/20 hover:border-nb-yellow hover:bg-nb-yellow hover:text-black p-4 text-left transition-all duration-150 group">
              <Plus size={18} className="mb-1.5" />
              <p className="font-bold text-sm">Create New Bot</p>
              <p className="text-xs text-white/50 group-hover:text-black/60">Set up a new chatbot</p>
            </button>
          </div>
          {bots.length > 0 && (
            <div className="bg-nb-pink border-2 border-black shadow-nb p-5">
              <h3 className="font-bold text-sm uppercase tracking-wide text-black mb-3">Top Performer</h3>
              <p className="font-bold text-black">{bots[0].name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-black/60">Accuracy</span>
                <span className="text-xl font-bold text-black">{bots[0].accuracy || 0}%</span>
              </div>
              <div className="mt-2 h-2 bg-black/20 border border-black">
                <div className="h-full bg-black transition-all" style={{ width: `${bots[0].accuracy || 0}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
      {bots.length > 0 && (
        <div className="bg-white border-2 border-black shadow-nb p-6">
          <h3 className="font-bold text-lg mb-4">Recent Bots</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.slice(0, 3).map(bot => <SmallBotCard key={bot.id} bot={bot} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityChart = ({ dailyStats }) => {
  const raw = (dailyStats || []).slice(-7);
  const labels = raw.map(s => new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }));
  const values = raw.map(s => s.queries || 0);
  const hasData = values.some(v => v > 0);

  if (!hasData) return (
    <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200">
      <div className="text-center text-nb-muted">
        <Activity size={28} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm font-medium">No activity yet</p>
      </div>
    </div>
  );

  const chartData = {
    labels,
    datasets: [{
      data: values,
      borderColor: '#000000',
      backgroundColor: 'rgba(0,0,0,0.07)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#000000',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#000',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#000',
        borderWidth: 2,
        padding: 8,
        displayColors: false,
        callbacks: { title: items => items[0].label, label: item => `${item.parsed.y} queries` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#6B6B6B', font: { size: 11, weight: '600' } },
      },
      y: {
        grid: { color: '#e5e5e5', drawBorder: false },
        border: { display: false, dash: [3, 3] },
        ticks: { color: '#6B6B6B', font: { size: 11 }, maxTicksLimit: 5 },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-52">
      <Line data={chartData} options={options} />
    </div>
  );
};

const SmallBotCard = ({ bot }) => (
  <div className="border-2 border-black p-4 shadow-nb-sm hover:shadow-nb hover:-translate-y-px hover:-translate-x-px transition-all duration-150 bg-white">
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-8 h-8 border-2 border-black ${botColorClass(bot.color)} flex items-center justify-center`}><Bot size={14} /></div>
      <span className="font-bold text-sm truncate">{bot.name}</span>
    </div>
    <div className="flex items-center justify-between text-xs">
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border-2 border-black ${bot.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
        {bot.status === 'active' ? '● Active' : '○ Inactive'}
      </span>
      <span className="text-nb-muted font-medium">{bot.totalQueries || 0} queries</span>
    </div>
  </div>
);

/* ─────────────────── MY BOTS VIEW ─────────────────── */
const botColorClass = (c) => ({ pink: 'bg-nb-pink', yellow: 'bg-nb-yellow', blue: 'bg-nb-blue' }[c] || 'bg-nb-yellow');

const MyBotsView = ({ bots, setShowBotModal, setSelectedBot, setShowKnowledgeModal, onEdit, onDelete, onShowEmbed, loading, searchQuery }) => {
  if (loading) return <LoadingSpinner />;
  const filtered = bots.filter(b => !searchQuery || b.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  return (
    <div className="space-y-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">My Bots</h2>
          <p className="text-nb-muted text-sm mt-0.5">{bots.length} bot{bots.length !== 1 ? 's' : ''} configured</p>
        </div>
        <button onClick={() => setShowBotModal(true)} className="nb-btn bg-black text-white border-black hover:bg-gray-900 px-4 py-2 flex items-center gap-2">
          <Plus size={16} />New Bot
        </button>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-black shadow-nb p-16 text-center">
          <div className="w-16 h-16 border-2 border-black bg-nb-yellow mx-auto mb-4 flex items-center justify-center"><Bot size={32} /></div>
          <h3 className="text-xl font-bold mb-2">{searchQuery ? 'No bots found' : 'No Bots Yet'}</h3>
          <p className="text-nb-muted mb-6 max-w-sm mx-auto text-sm">{searchQuery ? `No bots match "${searchQuery}"` : 'Create your first AI-powered bot to get started.'}</p>
          {!searchQuery && (
            <button onClick={() => setShowBotModal(true)} className="nb-btn bg-nb-yellow border-black px-6 py-3 flex items-center gap-2 mx-auto">
              <Plus size={18} />Create Your First Bot
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((bot, i) => (
            <div key={bot.id} className="bg-white border-2 border-black shadow-nb hover:shadow-nb-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 overflow-hidden">
              <div className={`h-2 ${botColorClass(bot.color)}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 border-2 border-black ${botColorClass(bot.color)} flex items-center justify-center`}><Bot size={20} /></div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">{bot.name}</h3>
                      <p className="text-xs text-nb-muted">{bot.type}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border-2 border-black ${bot.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {bot.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="border-2 border-black p-2 text-center bg-nb-bg">
                    <p className="text-lg font-bold">{bot.totalQueries || 0}</p>
                    <p className="text-xs text-nb-muted">Queries</p>
                  </div>
                  <div className="border-2 border-black p-2 text-center bg-nb-bg">
                    <p className="text-lg font-bold">{bot.accuracy || 0}%</p>
                    <p className="text-xs text-nb-muted">Accuracy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4 text-xs">
                  <div className="flex items-center gap-1">
                    {bot.pineconeVerified ? <CheckCircle2 size={13} className="text-green-600" /> : <XCircle size={13} className="text-red-500" />}
                    <span className="text-nb-muted">Pinecone</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {bot.geminiVerified ? <CheckCircle2 size={13} className="text-green-600" /> : <XCircle size={13} className="text-red-500" />}
                    <span className="text-nb-muted">Gemini</span>
                  </div>
                </div>
                <div className="flex gap-1.5 border-t-2 border-black pt-4">
                  <button onClick={() => { setSelectedBot(bot); setShowKnowledgeModal(true); }} className="flex-1 nb-btn bg-white px-2 py-1.5 justify-center text-xs"><Database size={14} />Docs</button>
                  <button onClick={() => onShowEmbed(bot)} className="flex-1 nb-btn bg-nb-blue px-2 py-1.5 justify-center text-xs"><Code size={14} />Embed</button>
                  <button onClick={() => onEdit(bot)} className="flex-1 nb-btn bg-nb-yellow px-2 py-1.5 justify-center text-xs"><Edit size={14} />Edit</button>
                  <button onClick={() => onDelete(bot.id)} className="nb-btn bg-white px-2 py-1.5 hover:bg-red-100 hover:border-red-500 hover:text-red-600 justify-center"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────── API KEYS VIEW ─────────────────── */
const ApiKeysView = ({ bots, loading, onEdit, fetchBots }) => {
  const { getIdToken } = useAuth();
  const [testingBotId, setTestingBotId] = useState(null);
  const [testResults, setTestResults] = useState({});

  const handleTest = async (botId) => {
    try {
      setTestingBotId(botId);
      const token = await getIdToken();
      if (!token) throw new Error('Authentication required');
      setAuthToken(token);
      const response = await botsService.testBot(botId);
      setTestResults(prev => ({ ...prev, [botId]: response }));
      await fetchBots();
    } catch (error) {
      setTestResults(prev => ({ ...prev, [botId]: { error: error.response?.data?.error || error.message } }));
    } finally { setTestingBotId(null); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">API Keys</h2>
        <p className="text-nb-muted text-sm mt-0.5">Monitor and test per-bot API connections</p>
      </div>
      <div className="bg-nb-blue/30 border-2 border-black shadow-nb p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-nb-blue border-2 border-black flex items-center justify-center flex-shrink-0"><Key size={16} /></div>
          <div>
            <h3 className="font-bold text-sm">Per-Bot API Configuration</h3>
            <p className="text-xs text-nb-muted mt-1">Each bot has its own Pinecone and Gemini API keys for better security and independent knowledge bases.</p>
          </div>
        </div>
      </div>
      {bots.length === 0 ? (
        <div className="bg-white border-2 border-black shadow-nb p-12 text-center"><Bot size={40} className="text-gray-300 mx-auto mb-3" /><h3 className="font-bold">No Bots Yet</h3></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {bots.map(bot => {
            const r = testResults[bot.id];
            const isTesting = testingBotId === bot.id;
            return (
              <div key={bot.id} className="bg-white border-2 border-black shadow-nb p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-nb-yellow border-2 border-black flex items-center justify-center"><Bot size={18} /></div>
                    <div><h3 className="font-bold">{bot.name}</h3><p className="text-xs text-nb-muted">{bot.type}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(bot)} className="nb-btn bg-nb-yellow px-3 py-1.5 text-xs"><Edit size={13} />Edit Keys</button>
                    <button onClick={() => handleTest(bot.id)} disabled={isTesting} className="nb-btn bg-black text-white border-black px-3 py-1.5 text-xs disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0">
                      {isTesting ? <><Loader2 size={13} className="animate-spin" />Testing…</> : <><Activity size={13} />Test</>}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Pinecone', v: bot.pineconeVerified, icon: Database, detail: bot.pineconeIndexName, td: r?.testResults?.pinecone },
                    { label: 'Gemini AI', v: bot.geminiVerified, icon: Zap, detail: 'gemini-embedding-001', td: r?.testResults?.gemini },
                  ].map(({ label, v, icon: Icon, detail, td }) => (
                    <div key={label} className={`border-2 p-3 ${v ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2"><Icon size={15} className={v ? 'text-green-600' : 'text-red-500'} /><span className="text-sm font-bold">{label}</span></div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border-2 ${v ? 'border-green-500 bg-green-100 text-green-700' : 'border-red-500 bg-red-100 text-red-600'}`}>
                          {v ? <><CheckCircle2 size={11} />Verified</> : <><XCircle size={11} />Failed</>}
                        </span>
                      </div>
                      <p className="text-xs text-nb-muted font-mono">{detail}</p>
                      {td && <p className={`text-xs mt-1.5 font-medium ${td.verified ? 'text-green-700' : 'text-red-600'}`}>{td.message}</p>}
                    </div>
                  ))}
                </div>
                {r?.error && <div className="mt-3 border-2 border-red-500 bg-red-50 p-3"><p className="text-xs text-red-600 font-bold">Error: {r.error}</p></div>}
                {bot.lastVerified && <p className="text-xs text-nb-muted mt-3 border-t border-gray-200 pt-2">Last verified: {new Date(bot.lastVerified).toLocaleString()}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─────────────────── DOCUMENTATION VIEW ─────────────────── */
const DocumentationView = () => {
  const [activeTab, setActiveTab] = useState('quickstart');
  const [copiedId, setCopiedId] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const CodeBlock = ({ code, id, lang = 'bash' }) => {
    const langColors = { bash:'text-green-300', html:'text-orange-300', jsx:'text-cyan-300', json:'text-yellow-300', javascript:'text-yellow-300', python:'text-blue-300', text:'text-gray-300', http:'text-purple-300', vue:'text-green-300' };
    return (
      <div className="relative mt-2 border-2 border-black bg-gray-950 font-mono text-xs sm:text-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/70"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"/><div className="w-2.5 h-2.5 rounded-full bg-green-500/70"/></div>
            <span className="text-white/30 text-xs font-sans uppercase tracking-widest ml-1">{lang}</span>
          </div>
          <button onClick={() => copy(code, id)} className={`flex items-center gap-1.5 border px-2.5 py-1 text-xs font-sans font-bold transition-all ${copiedId === id ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-white/20 bg-white/5 hover:bg-white/15 text-white/60 hover:text-white'}`}>
            {copiedId === id ? <><Check size={11} />Copied!</> : <><Copy size={11} />Copy</>}
          </button>
        </div>
        <pre className={`p-4 overflow-x-auto whitespace-pre leading-relaxed ${langColors[lang] || 'text-gray-300'}`}><code>{code}</code></pre>
      </div>
    );
  };

  const InfoBox = ({ type = 'info', children }) => {
    const styles = {
      info:    { bar: 'bg-nb-blue',    bg: 'bg-nb-blue/20',    icon: '💡' },
      warning: { bar: 'bg-nb-yellow',  bg: 'bg-nb-yellow/20',  icon: '⚠️' },
      tip:     { bar: 'bg-green-400',  bg: 'bg-green-50',      icon: '✅' },
      danger:  { bar: 'bg-red-400',    bg: 'bg-red-50',        icon: '🚨' },
    }[type];
    return (
      <div className={`flex gap-3 border-2 border-black p-3 mt-3 ${styles.bg}`}>
        <div className={`w-1 flex-shrink-0 ${styles.bar}`} />
        <div className="flex gap-2 text-sm"><span>{styles.icon}</span><span>{children}</span></div>
      </div>
    );
  };

  const ParamRow = ({ name, type, def, desc, required }) => (
    <tr className="border-t-2 border-black">
      <td className="p-2.5 border-r-2 border-black align-top">
        <code className="font-mono text-xs text-black font-bold">{name}</code>
        {required && <span className="ml-1 text-red-500 text-xs font-bold">*</span>}
      </td>
      <td className="p-2.5 border-r-2 border-black align-top"><span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 border border-gray-300">{type}</span></td>
      <td className="p-2.5 border-r-2 border-black align-top font-mono text-xs text-nb-muted">{def || '—'}</td>
      <td className="p-2.5 text-xs text-nb-muted align-top">{desc}</td>
    </tr>
  );

  const EndpointBadge = ({ method }) => {
    const c = { GET:'bg-green-100 text-green-800 border-green-400', POST:'bg-blue-100 text-blue-800 border-blue-400', PUT:'bg-yellow-100 text-yellow-800 border-yellow-400', DELETE:'bg-red-100 text-red-800 border-red-400', PATCH:'bg-purple-100 text-purple-800 border-purple-400' };
    return <span className={`font-mono text-[11px] font-black px-2 py-0.5 border-2 ${c[method]||'bg-gray-100 border-black'}`}>{method}</span>;
  };

  const Endpoint = ({ method, path, desc, auth = true, body }) => (
    <div className="border-b-2 border-black last:border-b-0">
      <div className="p-4 hover:bg-nb-bg transition-colors">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <EndpointBadge method={method} />
          <code className="font-mono text-xs sm:text-sm font-bold break-all">{path}</code>
          {auth && <span className="text-[10px] border border-black/30 px-1.5 py-0.5 text-nb-muted font-bold">🔐 Auth</span>}
          {!auth && <span className="text-[10px] border border-green-300 bg-green-50 px-1.5 py-0.5 text-green-700 font-bold">🌐 Public</span>}
        </div>
        <p className="text-xs text-nb-muted pl-1">{desc}</p>
        {body && <div className="mt-2"><CodeBlock code={body} id={`ep-${path}`} lang="json" /></div>}
      </div>
    </div>
  );

  const tabs = [
    { id: 'quickstart', label: 'Quick Start',    icon: Zap,       color: 'bg-nb-yellow' },
    { id: 'widget',     label: 'Widget',         icon: Globe,     color: 'bg-nb-blue' },
    { id: 'api',        label: 'API',            icon: Terminal,  color: 'bg-nb-pink' },
    { id: 'config',     label: 'Config',         icon: Settings,  color: 'bg-purple-200' },
    { id: 'examples',   label: 'Examples',       icon: Code,      color: 'bg-orange-200' },
    { id: 'trouble',    label: 'Help',           icon: AlertCircle, color: 'bg-red-200' },
  ];

  return (
    <div className="w-full">
      {/* ── HERO + TABS shell ── */}
      <div className="border-2 border-black shadow-nb mb-6 overflow-hidden">
        {/* Hero */}
        <div className="bg-black text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize:'32px 32px' }} />
          <div className="absolute top-0 right-0 w-40 h-40 bg-nb-yellow/20 blur-3xl rounded-full" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 bg-nb-yellow border-2 border-nb-yellow flex items-center justify-center flex-shrink-0">
              <BookOpen size={26} className="text-black" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">RAGhost Documentation</h1>
                <span className="text-xs font-bold bg-nb-yellow text-black px-2 py-0.5 border border-nb-yellow">v2.0</span>
              </div>
              <p className="text-white/60 text-sm">Everything you need to build, deploy, and scale AI chatbots — with code examples you can paste straight in.</p>
            </div>
          </div>
          <div className="relative z-10 flex flex-wrap gap-3 mt-5">
            {[['5 min','Quick Setup'],['REST API','Full Reference'],['10+ examples','Copy-paste Code'],['5 frameworks','Integration Guides']].map(([v,l]) => (
              <div key={l} className="border border-white/20 px-3 py-1.5 text-xs">
                <span className="font-black text-nb-yellow">{v}</span>
                <span className="text-white/50 ml-1.5">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex overflow-x-auto border-t-2 border-black bg-white">
          {tabs.map(({ id, label, icon: Icon, color }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 font-bold text-xs sm:text-sm border-r-2 border-black whitespace-nowrap flex-shrink-0 transition-all ${
                activeTab === id ? `${color} text-black` : 'bg-white text-nb-muted hover:bg-gray-50 hover:text-black'
              }`}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* QUICK START                                    */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === 'quickstart' && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="bg-white border-2 border-black shadow-nb p-5">
            <p className="text-xs font-bold text-nb-muted uppercase tracking-widest mb-3">Setup Progress</p>
            <div className="flex items-center gap-0">
              {['Get Keys','Create Bot','Upload Docs','Embed Widget','Go Live'].map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-8 h-8 border-2 border-black bg-nb-yellow flex items-center justify-center font-black text-sm">{i+1}</div>
                    <span className="text-[10px] font-bold hidden sm:block text-center leading-tight max-w-[60px]">{s}</span>
                  </div>
                  {i < 4 && <div className="flex-1 h-0.5 bg-black mx-1" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step 1 */}
          <div className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-nb-yellow border-b-2 border-black p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-black text-lg border-2 border-black">1</div>
              <Key size={18} />
              <h3 className="font-black text-base">Get Your API Keys</h3>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-nb-pink border-2 border-black flex items-center justify-center flex-shrink-0"><Zap size={12}/></div>
                  <h4 className="font-black text-sm">Gemini API Key (Google)</h4>
                </div>
                <ol className="space-y-1.5 mb-3">
                  {['Visit aistudio.google.com → sign in with Google','Click Create API Key → choose or create a GCP project','Copy the key — starts with AIzaSy...'].map((s,i) => (
                    <li key={i} className="flex gap-2 text-sm"><span className="w-5 h-5 border-2 border-black bg-nb-pink flex items-center justify-center font-black text-xs flex-shrink-0">{i+1}</span>{s}</li>
                  ))}
                </ol>
                <CodeBlock code="AIzaSyD-YourGeminiKeyHere1234567890abcde" id="gemini-k1" lang="text" />
                <InfoBox type="tip">Free tier: 60 req/min · 1,500 req/day. Enough for development and small production loads.</InfoBox>
              </div>
              <div className="border-t-2 border-dashed border-gray-200 pt-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-nb-blue border-2 border-black flex items-center justify-center flex-shrink-0"><Database size={12}/></div>
                  <h4 className="font-black text-sm">Pinecone API Key + Index</h4>
                </div>
                <ol className="space-y-1.5 mb-3">
                  {['Sign up free at pinecone.io','Create a new Index with these exact settings:','Copy both the Index Name and API Key'].map((s,i) => (
                    <li key={i} className="flex gap-2 text-sm"><span className="w-5 h-5 border-2 border-black bg-nb-blue flex items-center justify-center font-black text-xs flex-shrink-0">{i+1}</span>{s}</li>
                  ))}
                </ol>
                <div className="border-2 border-black overflow-hidden">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-nb-blue border-b-2 border-black"><th className="text-left p-2 border-r-2 border-black font-bold">Setting</th><th className="text-left p-2 border-r-2 border-black font-bold">Required Value</th><th className="text-left p-2 font-bold">Why</th></tr></thead>
                    <tbody>
                      {[['Dimensions','768','Gemini text-embedding-004 output size'],['Metric','cosine','Best for semantic similarity'],['Pod type','Starter','Free tier, sufficient for most use'],['Cloud/Region','Any','Pick closest to your users']].map(([k,v,w]) => (
                        <tr key={k} className="border-t-2 border-black"><td className="p-2 border-r-2 border-black text-nb-muted font-mono">{k}</td><td className="p-2 border-r-2 border-black font-black">{v}</td><td className="p-2 text-nb-muted">{w}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <InfoBox type="warning">Dimension must be exactly <strong>768</strong>. Any other value will cause all uploads to fail silently.</InfoBox>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-nb-pink border-b-2 border-black p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-black text-lg border-2 border-black">2</div>
              <Bot size={18} /><h3 className="font-black text-base">Create a Bot</h3>
            </div>
            <div className="p-5">
              <p className="text-sm mb-4">Go to <strong>My Bots → New Bot</strong> and fill in the form:</p>
              <div className="border-2 border-black overflow-hidden">
                <table className="w-full text-xs">
                  <thead><tr className="bg-nb-pink border-b-2 border-black"><th className="text-left p-2 border-r-2 border-black font-bold">Field</th><th className="text-left p-2 border-r-2 border-black font-bold">Example</th><th className="text-left p-2 font-bold">Notes</th></tr></thead>
                  <tbody>
                    {[['Bot Name','Support Bot','Shown in dashboard and widget header'],['Bot Type','Customer Support','Affects AI tone (General / Support / Technical)'],['Gemini Key','AIzaSy...','From Step 1'],['Pinecone Key','pcsk_...','From Step 1'],['Index Name','my-rag-index','Exact name, case-sensitive'],['Welcome Message','Hi! How can I help?','First message shown in the chat widget']].map(([k,v,n]) => (
                      <tr key={k} className="border-t-2 border-black"><td className="p-2 border-r-2 border-black font-mono text-nb-muted">{k}</td><td className="p-2 border-r-2 border-black font-bold">{v}</td><td className="p-2 text-nb-muted">{n}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <InfoBox type="info">After saving, RAGhost automatically verifies your API keys. Green checkmarks = you're good to go.</InfoBox>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-purple-200 border-b-2 border-black p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-black text-lg border-2 border-black">3</div>
              <Upload size={18} /><h3 className="font-black text-base">Upload Knowledge Base</h3>
            </div>
            <div className="p-5">
              <p className="text-sm mb-4">Go to <strong>My Bots → your bot → Knowledge Base</strong> and upload your documents.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[['PDF','.pdf','📄'],['Text','.txt','📝'],['Word','.docx','📘'],['Markdown','.md','📋']].map(([l,e,emoji]) => (
                  <div key={e} className="border-2 border-black p-3 text-center bg-nb-bg hover:bg-nb-yellow transition-colors">
                    <div className="text-2xl mb-1">{emoji}</div>
                    <p className="text-xs font-black">{l}</p>
                    <p className="text-xs text-nb-muted font-mono">{e}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[['Max file size','10 MB per file'],['Processing time','~30s per MB (larger files take longer)'],['Vector storage','Chunks stored in your Pinecone index automatically'],['Re-upload','Re-uploading the same file replaces its vectors']].map(([k,v]) => (
                  <div key={k} className="flex items-center gap-3 text-xs border-2 border-black p-2 bg-nb-bg">
                    <ArrowRight size={12} className="text-nb-muted flex-shrink-0" />
                    <span className="font-bold">{k}:</span>
                    <span className="text-nb-muted">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4+5 combined */}
          <div className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-orange-200 border-b-2 border-black p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-black text-lg border-2 border-black">4</div>
              <Code size={18} /><h3 className="font-black text-base">Embed & Go Live</h3>
            </div>
            <div className="p-5">
              <p className="text-sm mb-3">Copy the snippet from <strong>My Bots → Embed</strong> and paste it into your site:</p>
              <CodeBlock code={`<script\n  src="https://raghost.app/widget/widget-loader.js"\n  data-bot-id="YOUR_BOT_ID"\n  data-primary-color="#000000"\n  data-position="bottom-right"\n  async\n></script>`} id="embed-qs" lang="html" />
              <InfoBox type="tip">That's it. The chat bubble will appear on your site in seconds. No build step, no npm install required.</InfoBox>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* WIDGET                                         */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === 'widget' && (
        <div className="space-y-4">
          <div className="bg-white border-2 border-black shadow-nb p-5">
            <h2 className="text-lg font-black">Embedding the Chat Widget</h2>
            <p className="text-sm text-nb-muted mt-1">Zero-dependency JS bundle. Works with any stack — paste one tag and you're done.</p>
          </div>

          {[
            { lang: 'HTML', color: 'bg-nb-yellow', icon: Globe, id: 'html', note: 'Paste before closing </body>',
              code: `<!-- RAGhost Widget -->\n<script\n  src="https://raghost.app/widget/widget-loader.js"\n  data-bot-id="YOUR_BOT_ID"\n  data-primary-color="#000000"\n  data-secondary-color="#FFFEF0"\n  data-position="bottom-right"\n  data-theme="default"\n  data-welcome-text="Hi! How can I help you?"\n  data-button-text="Chat with us"\n  async\n></script>`,
            },
            { lang: 'React / Next.js', color: 'bg-nb-blue', icon: Cpu, id: 'react', note: 'Add to any layout or page component',
              code: `import { useEffect } from 'react';\n\nexport function ChatWidget({ botId, color = '#000000' }) {\n  useEffect(() => {\n    // Prevent duplicate injection\n    if (document.querySelector('[data-raghost]')) return;\n    const s = document.createElement('script');\n    s.src = 'https://raghost.app/widget/widget-loader.js';\n    s.setAttribute('data-raghost', 'true');\n    s.setAttribute('data-bot-id', botId);\n    s.setAttribute('data-primary-color', color);\n    s.setAttribute('data-position', 'bottom-right');\n    s.async = true;\n    document.body.appendChild(s);\n    return () => { try { document.body.removeChild(s); } catch {} };\n  }, [botId]);\n  return null;\n}\n\n// Usage:\n// <ChatWidget botId="abc123" color="#7C3AED" />`,
            },
            { lang: 'Vue 3', color: 'bg-green-200', icon: Layers, id: 'vue', note: 'Works in both Options and Composition API',
              code: `<script setup>\nimport { onMounted, onUnmounted } from 'vue';\n\nconst props = defineProps({ botId: String, color: { default: '#000000' } });\nlet el;\n\nonMounted(() => {\n  el = document.createElement('script');\n  el.src = 'https://raghost.app/widget/widget-loader.js';\n  el.setAttribute('data-bot-id', props.botId);\n  el.setAttribute('data-primary-color', props.color);\n  el.async = true;\n  document.body.appendChild(el);\n});\nonUnmounted(() => el && document.body.removeChild(el));\n</script>\n<template><slot /></template>`,
            },
            { lang: 'Vanilla JS', color: 'bg-purple-200', icon: Terminal, id: 'vanilla', note: 'Load programmatically with full control',
              code: `function loadRaghost(botId, options = {}) {\n  const s = document.createElement('script');\n  s.src = 'https://raghost.app/widget/widget-loader.js';\n  s.setAttribute('data-bot-id', botId);\n  s.setAttribute('data-primary-color', options.color ?? '#000000');\n  s.setAttribute('data-position', options.position ?? 'bottom-right');\n  s.setAttribute('data-theme', options.theme ?? 'default');\n  s.async = true;\n  document.head.appendChild(s);\n}\n\n// Call after DOM is ready:\ndocument.addEventListener('DOMContentLoaded', () => {\n  loadRaghost('YOUR_BOT_ID', { color: '#4F46E5', theme: 'glass' });\n});`,
            },
          ].map(({ lang, color, icon: Icon, id, note, code }) => (
            <section key={id} className="bg-white border-2 border-black shadow-nb overflow-hidden">
              <div className={`${color} border-b-2 border-black p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-2"><Icon size={16} /><h3 className="font-black">{lang}</h3></div>
                <span className="text-xs text-black/50 font-medium">{note}</span>
              </div>
              <div className="p-5"><CodeBlock code={code} id={id} lang={id === 'react' ? 'jsx' : id === 'vue' ? 'vue' : 'javascript'} /></div>
            </section>
          ))}

          {/* Attribute table */}
          <section className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-nb-pink border-b-2 border-black p-4 flex items-center gap-2"><Settings size={16} /><h3 className="font-black">Widget Attributes</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead><tr className="bg-gray-50 border-b-2 border-black text-left">
                  <th className="p-3 border-r-2 border-black font-bold">Attribute <span className="text-red-500">*</span> = required</th>
                  <th className="p-3 border-r-2 border-black font-bold">Type</th>
                  <th className="p-3 border-r-2 border-black font-bold">Default</th>
                  <th className="p-3 font-bold">Description</th>
                </tr></thead>
                <tbody>
                  {[
                    ['data-bot-id','string','required','Your bot\'s unique ID — find it in the Embed modal'],
                    ['data-primary-color','hex','#000000','Main accent color for the widget button and header'],
                    ['data-secondary-color','hex','#FFFEF0','Background / bubble color'],
                    ['data-position','enum','bottom-right','bottom-right · bottom-left · top-right · top-left'],
                    ['data-theme','enum','default','default · minimal · glass · modern-dark'],
                    ['data-welcome-text','string','Hi! How can I help?','Opening message shown to first-time visitors'],
                    ['data-button-text','string','Chat with us','Label on the floating launch button'],
                    ['data-placeholder','string','Type a message...','Input placeholder text inside the chat window'],
                    ['data-z-index','number','9999','CSS stacking order — increase if the widget hides behind other elements'],
                    ['data-auto-open','boolean','false','Auto-open the widget on page load (use sparingly)'],
                  ].map(([attr, type, def, desc]) => (
                    <tr key={attr} className="border-t-2 border-black">
                      <td className="p-2.5 border-r-2 border-black font-mono text-xs">{attr}</td>
                      <td className="p-2.5 border-r-2 border-black"><span className="bg-gray-100 px-1.5 py-0.5 font-mono text-xs border border-gray-300">{type}</span></td>
                      <td className="p-2.5 border-r-2 border-black font-mono text-xs text-nb-muted">{def}</td>
                      <td className="p-2.5 text-xs text-nb-muted">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <InfoBox type="info">Themes (<code>glass</code>, <code>modern-dark</code>, <code>minimal</code>) can be previewed in <strong>My Bots → Embed → Template</strong> tab before deploying.</InfoBox>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* API REFERENCE                                  */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="bg-white border-2 border-black shadow-nb p-5">
            <h2 className="text-lg font-black">REST API Reference</h2>
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <span className="border-2 border-black px-2 py-1 font-mono">Base URL: <span className="font-black">https://raghost.app/api</span></span>
              <span className="border-2 border-black px-2 py-1">Content-Type: <span className="font-mono font-bold">application/json</span></span>
            </div>
          </div>

          {/* Auth */}
          <section className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-nb-yellow border-b-2 border-black p-4 flex items-center gap-2"><Shield size={16}/><h3 className="font-black">Authentication</h3></div>
            <div className="p-5">
              <p className="text-sm mb-3">Pass a Firebase ID token as a Bearer token on all <span className="border border-black/30 px-1 text-xs">🔐 Auth</span> endpoints.</p>
              <CodeBlock code={`// 1. Get the token\nconst token = await firebase.auth().currentUser.getIdToken();\n\n// 2. Attach to every request\nfetch('https://raghost.app/api/bots', {\n  headers: {\n    'Authorization': \`Bearer \${token}\`,\n    'Content-Type': 'application/json',\n  }\n});`} id="auth-ex" lang="javascript" />
              <InfoBox type="warning">Tokens expire after 1 hour. Call <code>getIdToken(true)</code> to force-refresh.</InfoBox>
            </div>
          </section>

          {/* Bots */}
          <section className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-nb-pink border-b-2 border-black p-4 flex items-center gap-2"><Bot size={16}/><h3 className="font-black">Bots</h3></div>
            <div className="divide-y-0">
              <Endpoint method="GET"    path="/bots"                     desc="List all bots owned by the authenticated user, including verification status" />
              <Endpoint method="POST"   path="/bots"                     desc="Create a new bot — verifies Gemini and Pinecone keys on creation"
                body={`{\n  "name": "Support Bot",\n  "type": "customer_support",\n  "geminiApiKey": "AIzaSy...",\n  "pineconeApiKey": "pcsk_...",\n  "pineconeIndexName": "my-index",\n  "welcomeMessage": "Hi! How can I help you today?"\n}`} />
              <Endpoint method="GET"    path="/bots/:id"                 desc="Get a single bot's full config including widget settings and last verification time" />
              <Endpoint method="PUT"    path="/bots/:id"                 desc="Update bot name, type, API keys, or welcome message" />
              <Endpoint method="DELETE" path="/bots/:id"                 desc="Permanently delete a bot, its chat sessions, and analytics data" />
              <Endpoint method="POST"   path="/bots/:id/verify"          desc="Re-verify the bot's Pinecone and Gemini connectivity" />
              <Endpoint method="PUT"    path="/bots/:id/settings"        desc="Update AI model parameters (temperature, maxTokens, systemPrompt)" />
              <Endpoint method="GET"    path="/bots/:id/widget-config"   desc="Fetch the widget's visual configuration" />
              <Endpoint method="PUT"    path="/bots/:id/widget-config"   desc="Save widget colors, position, theme, and text overrides" />
            </div>
          </section>

          {/* Chat */}
          <section className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-nb-blue border-b-2 border-black p-4 flex items-center gap-2"><MessageSquare size={16}/><h3 className="font-black">Chat</h3></div>
            <div>
              <Endpoint method="POST" path="/chat/:botId" auth={false} desc="Send a message — returns a RAG-powered response with source citations"
                body={`{\n  "message": "What is your refund policy?",\n  "sessionId": "visitor_abc123"  // optional, auto-generated if omitted\n}`} />
              <div className="px-5 pb-5">
                <p className="text-sm font-bold mb-2 mt-3">Response:</p>
                <CodeBlock code={`{\n  "success": true,\n  "response": "Our refund policy allows returns within 30 days of purchase...",\n  "sessionId": "visitor_abc123",\n  "sources": [\n    { "text": "...relevant excerpt from your documents...", "score": 0.94 }\n  ]\n}`} id="chat-resp" lang="json" />
              </div>
              <Endpoint method="GET" path="/chat/:botId/sessions"          desc="List all chat sessions for a bot (paginated)" />
              <Endpoint method="GET" path="/chat/:botId/sessions/:id"      desc="Get full message history for a specific session" />
              <Endpoint method="DELETE" path="/chat/:botId/sessions/:id"   desc="Delete a chat session and all its messages" />
            </div>
          </section>

          {/* Knowledge */}
          <section className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-purple-200 border-b-2 border-black p-4 flex items-center gap-2"><Database size={16}/><h3 className="font-black">Knowledge Base</h3></div>
            <div>
              <Endpoint method="GET"    path="/knowledge/:botId"           desc="List all uploaded documents with processing status and vector counts" />
              <Endpoint method="POST"   path="/knowledge/:botId/upload"    desc="Upload a file (multipart/form-data, field name: 'file'). Returns a job ID." />
              <Endpoint method="GET"    path="/knowledge/:botId/jobs"      desc="Poll upload job status — check chunking and embedding progress" />
              <Endpoint method="DELETE" path="/knowledge/:botId/:docId"    desc="Remove a document and delete its vectors from Pinecone" />
            </div>
            <div className="p-5 border-t-2 border-black">
              <p className="text-sm font-bold mb-2">Upload Example (curl):</p>
              <CodeBlock code={`curl -X POST https://raghost.app/api/knowledge/YOUR_BOT_ID/upload \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -F "file=@/path/to/your/document.pdf"`} id="upload-curl" lang="bash" />
            </div>
          </section>

          {/* Analytics */}
          <section className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-orange-200 border-b-2 border-black p-4 flex items-center gap-2"><BarChart3 size={16}/><h3 className="font-black">Analytics</h3></div>
            <div>
              <Endpoint method="GET" path="/analytics/overview"         desc="Account summary: total bots, queries, active sessions, top performing bot" />
              <Endpoint method="GET" path="/analytics/daily?days=7"     desc="Daily query counts for the last N days (max 90)" />
              <Endpoint method="GET" path="/analytics/bots/:id"         desc="Per-bot stats: total queries, average accuracy, most asked questions" />
            </div>
          </section>

          {/* User */}
          <section className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-green-200 border-b-2 border-black p-4 flex items-center gap-2"><UserCircle size={16}/><h3 className="font-black">User / Profile</h3></div>
            <div>
              <Endpoint method="GET"    path="/users/profile"    desc="Get authenticated user's profile and preferences" />
              <Endpoint method="PUT"    path="/users/profile"    desc="Update display name, avatar, and notification preferences" />
              <Endpoint method="GET"    path="/users/stats"      desc="Get usage statistics: bots count, total queries, knowledge base size" />
              <Endpoint method="DELETE" path="/users/account"    desc="Permanently delete account and all associated data (irreversible)" />
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* CONFIGURATION                                  */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === 'config' && (
        <div className="space-y-4">
          <div className="bg-white border-2 border-black shadow-nb p-5">
            <h2 className="text-lg font-black">Bot Configuration</h2>
            <p className="text-sm text-nb-muted mt-1">Access advanced settings via <strong>My Bots → Edit Bot → Advanced</strong> tab.</p>
          </div>

          {/* AI params */}
          <section className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-nb-yellow border-b-2 border-black p-4 flex items-center gap-2"><Cpu size={16}/><h3 className="font-black">AI Model Parameters</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[580px]">
                <thead><tr className="bg-gray-50 border-b-2 border-black text-left">
                  <th className="p-3 border-r-2 border-black font-bold">Parameter</th>
                  <th className="p-3 border-r-2 border-black font-bold">Type</th>
                  <th className="p-3 border-r-2 border-black font-bold">Default</th>
                  <th className="p-3 border-r-2 border-black font-bold">Range</th>
                  <th className="p-3 font-bold">Effect on Bot Behaviour</th>
                </tr></thead>
                <tbody>
                  <ParamRow name="temperature"  type="float"   def="0.7"    desc="Creativity of responses. 0 = deterministic, 1 = very creative. Start at 0.3 for support bots." />
                  <ParamRow name="maxTokens"    type="integer" def="1024"   desc="Max response length. ~4 chars per token. 1024 ≈ 750 words." />
                  <ParamRow name="topK"         type="integer" def="10"     desc="Number of document chunks retrieved per query. Higher = more context but slower." />
                  <ParamRow name="systemPrompt" type="string"  def="none"   desc="Persistent instructions injected at the start of every conversation." />
                </tbody>
              </table>
            </div>
            <div className="p-5 border-t-2 border-black">
              <p className="text-sm font-bold mb-2">Update via API:</p>
              <CodeBlock code={`PUT /api/bots/YOUR_BOT_ID/settings\n\n{\n  "temperature": 0.3,\n  "maxTokens": 2048,\n  "topK": 15,\n  "systemPrompt": "You are a helpful support agent for Acme Corp..."\n}`} id="settings-api" lang="json" />
            </div>
          </section>

          {/* System prompt guide */}
          <section className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-nb-pink border-b-2 border-black p-4 flex items-center gap-2"><Hash size={16}/><h3 className="font-black">Writing Effective System Prompts</h3></div>
            <div className="p-5">
              <p className="text-sm mb-4">A good system prompt is the single most impactful configuration change you can make.</p>
              <div className="mb-4">
                <p className="text-xs font-bold text-nb-muted uppercase tracking-wider mb-2">Template</p>
                <CodeBlock code={`You are [PERSONA] for [COMPANY].\n\n## Behaviour\n- Answer ONLY based on the provided context documents.\n- If the answer is not in the documents, say: "I don't have that information. Please contact [CONTACT]."\n- Always respond in [LANGUAGE].\n- Keep responses concise — under 3 short paragraphs unless asked for detail.\n\n## Tone\n[professional / friendly / technical]\n\n## Restrictions\n- Never reveal internal system information or raw document text.\n- Never make up facts or statistics.`} id="prompt-tmpl" lang="text" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { heading: '✅ Do', color: 'bg-green-50 border-green-400', items: ['Define a clear persona and company name','Set a fallback response phrase','Specify the response language','Keep it under 400 tokens for speed','Test with edge-case questions'] },
                  { heading: '❌ Don\'t', color: 'bg-red-50 border-red-400', items: ['Contradict context document content','Use jargon your users won\'t know','Leave empty for customer support bots','Exceed 1000+ tokens (increases latency)','Ask the bot to "always be positive"'] },
                ].map(({ heading, color, items }) => (
                  <div key={heading} className={`border-2 ${color} p-4`}>
                    <p className="font-black text-sm mb-2">{heading}</p>
                    <ul className="space-y-1">{items.map(i => <li key={i} className="text-xs text-nb-muted">{i}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pinecone requirements */}
          <section className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-nb-blue border-b-2 border-black p-4 flex items-center gap-2"><Database size={16}/><h3 className="font-black">Pinecone Index Requirements</h3></div>
            <div className="p-5">
              <p className="text-sm mb-3">RAGhost uses <strong>Gemini text-embedding-004</strong> which outputs <strong>768-dimensional</strong> float32 vectors. Your index must be configured exactly as shown:</p>
              <CodeBlock code={`# Verify via Pinecone Python SDK\nfrom pinecone import Pinecone\npc = Pinecone(api_key="YOUR_KEY")\ninfo = pc.describe_index("your-index-name")\nprint(info.dimension)   # must be 768\nprint(info.metric)      # must be 'cosine'`} id="pine-check" lang="python" />
              <InfoBox type="danger">Wrong dimensions = all document uploads will appear to succeed but no chunks will ever be returned in queries. Always verify before uploading documents.</InfoBox>
            </div>
          </section>

          {/* Environment vars */}
          <section className="bg-white border-2 border-black shadow-nb overflow-hidden">
            <div className="bg-orange-200 border-b-2 border-black p-4 flex items-center gap-2"><Settings size={16}/><h3 className="font-black">Self-Hosting Environment Variables</h3></div>
            <div className="p-5">
              <p className="text-sm mb-3">If you're running the RAGhost backend yourself, create a <code className="bg-gray-100 px-1 font-mono text-xs">.env</code> file at <code className="bg-gray-100 px-1 font-mono text-xs">backend/.env</code>:</p>
              <CodeBlock code={`# MongoDB\nMONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/raghost\n\n# Firebase (Admin SDK)\nFIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json\n\n# Server\nPORT=5001\nNODE_ENV=production\nFRONTEND_URL=https://your-domain.com\n\n# Encryption (generate with: node scripts/generate-encryption-key.js)\nENCRYPTION_KEY=your_32_byte_hex_key_here\n\n# Optional: Redis for job queuing\nREDIS_URL=redis://localhost:6379`} id="env-vars" lang="bash" />
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* EXAMPLES                                       */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === 'examples' && (
        <div className="space-y-4">
          <div className="bg-white border-2 border-black shadow-nb p-5">
            <h2 className="text-lg font-black">Real-World Examples</h2>
            <p className="text-sm text-nb-muted mt-1">Copy-paste complete, working code snippets for common use cases.</p>
          </div>

          {[
            {
              title: 'Customer Support Bot',
              color: 'bg-nb-yellow',
              icon: MessageSquare,
              desc: 'A bot that answers questions from your support documentation. Low temperature for consistent answers.',
              code: `// 1. Create the bot via API\nconst bot = await fetch('https://raghost.app/api/bots', {\n  method: 'POST',\n  headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    name: 'Acme Support Bot',\n    type: 'customer_support',\n    geminiApiKey: process.env.GEMINI_KEY,\n    pineconeApiKey: process.env.PINECONE_KEY,\n    pineconeIndexName: 'acme-support',\n    welcomeMessage: 'Hi! I can help with product questions, billing and returns.',\n  })\n}).then(r => r.json());\n\n// 2. Set conservative AI settings\nawait fetch(\`https://raghost.app/api/bots/\${bot.id}/settings\`, {\n  method: 'PUT',\n  headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    temperature: 0.2,\n    maxTokens: 512,\n    systemPrompt: 'You are a helpful support agent for Acme Corp. Only answer based on provided documents. If unsure, say "Please contact support@acme.com".'\n  })\n});`,
              id: 'ex-support', lang: 'javascript',
            },
            {
              title: 'Sending a Message Programmatically',
              color: 'bg-nb-blue',
              icon: Terminal,
              desc: 'Chat with any bot via the public API — no auth required. Great for server-side integrations.',
              code: `async function askBot(botId, question, sessionId) {\n  const res = await fetch(\`https://raghost.app/api/chat/\${botId}\`, {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ message: question, sessionId }),\n  });\n  const data = await res.json();\n  if (!data.success) throw new Error(data.error);\n  return {\n    answer: data.response,\n    sessionId: data.sessionId,     // keep for follow-up messages\n    sources: data.sources,         // knowledge base excerpts used\n  };\n}\n\n// Example:\nconst { answer, sessionId } = await askBot('YOUR_BOT_ID', 'How do I reset my password?');\nconsole.log(answer);\n// Follow-up — pass sessionId to maintain conversation context:\nconst followup = await askBot('YOUR_BOT_ID', 'And how long does it take?', sessionId);`,
              id: 'ex-chat', lang: 'javascript',
            },
            {
              title: 'Uploading a Document via API',
              color: 'bg-nb-pink',
              icon: Upload,
              desc: 'Upload files programmatically and poll for completion — ideal for CI/CD pipelines or content management systems.',
              code: `import FormData from 'form-data';\nimport fs from 'fs';\n\nconst botId = 'YOUR_BOT_ID';\nconst token = 'YOUR_TOKEN';\n\n// 1. Upload the file\nconst form = new FormData();\nform.append('file', fs.createReadStream('./docs/faq.pdf'));\n\nconst { jobId } = await fetch(\`https://raghost.app/api/knowledge/\${botId}/upload\`, {\n  method: 'POST',\n  headers: { 'Authorization': \`Bearer \${token}\`, ...form.getHeaders() },\n  body: form,\n}).then(r => r.json());\n\n// 2. Poll until done\nconst poll = async () => {\n  while (true) {\n    const jobs = await fetch(\`https://raghost.app/api/knowledge/\${botId}/jobs\`,\n      { headers: { 'Authorization': \`Bearer \${token}\` } }\n    ).then(r => r.json());\n    const job = jobs.find(j => j.id === jobId);\n    if (job?.status === 'complete') { console.log('✅ Indexed!'); break; }\n    if (job?.status === 'failed')   { throw new Error(job.error); }\n    await new Promise(r => setTimeout(r, 2000)); // wait 2s\n  }\n};\nawait poll();`,
              id: 'ex-upload', lang: 'javascript',
            },
            {
              title: 'Reading Session History',
              color: 'bg-purple-200',
              icon: MessageSquare,
              desc: 'Fetch and display all messages from a chat session — useful for CRM integration, moderation dashboards or analytics.',
              code: `const botId = 'YOUR_BOT_ID';\nconst sessionId = 'session_xyz';\n\nconst res = await fetch(\n  \`https://raghost.app/api/chat/\${botId}/sessions/\${sessionId}\`,\n  { headers: { 'Authorization': \`Bearer \${token}\` } }\n);\nconst { session, messages } = await res.json();\n\nconsole.log('Session started:', session.createdAt);\nmessages.forEach(msg => {\n  const who = msg.role === 'user' ? '👤 User' : '🤖 Bot';\n  console.log(\`[\${who}] \${msg.content}\`);\n});`,
              id: 'ex-history', lang: 'javascript',
            },
          ].map(({ title, color, icon: Icon, desc, code, id, lang }) => (
            <section key={id} className="bg-white border-2 border-black shadow-nb overflow-hidden">
              <div className={`${color} border-b-2 border-black p-4 flex items-center gap-2`}>
                <Icon size={16} /><h3 className="font-black">{title}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-nb-muted mb-3">{desc}</p>
                <CodeBlock code={code} id={id} lang={lang} />
              </div>
            </section>
          ))}

          <div className="bg-black text-white border-2 border-black shadow-nb p-5 flex flex-wrap gap-3 items-center justify-between">
            <div>
              <p className="font-black text-sm">More examples on GitHub</p>
              <p className="text-xs text-white/50 mt-0.5">Full-stack Next.js, Express, and Python Webhook examples</p>
            </div>
            <a href="https://github.com/pavankumar-vh/RAGHost/tree/main/examples" target="_blank" rel="noopener noreferrer" className="nb-btn bg-nb-yellow text-black border-nb-yellow px-4 py-2 text-xs inline-flex items-center gap-1 flex-shrink-0">View on GitHub <ExternalLink size={12} /></a>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* TROUBLESHOOTING                                */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === 'trouble' && (
        <div className="space-y-4">
          <div className="bg-white border-2 border-black shadow-nb p-5">
            <h2 className="text-lg font-black">Troubleshooting & FAQ</h2>
            <p className="text-sm text-nb-muted mt-1">Click any issue to expand the solution.</p>
          </div>

          {[
            { color: 'bg-red-200',    emoji: '🔴', title: '"Pinecone verification failed" on bot creation', solution: (
              <div className="space-y-2 text-sm">
                <p className="font-bold">Check these things in order:</p>
                <ol className="space-y-3">
                  {[
                    ['Index name is wrong', 'The name is case-sensitive. Open Pinecone console and copy it exactly.'],
                    ['Wrong dimensions', 'Dimension must be 768 and metric must be cosine. Delete and recreate the index if needed.'],
                    ['API key is an environment, not a key', 'Pinecone has separate "API Key" and "Environment" values. You need the API key (starts with pcsk_).'],
                    ['Free tier index limit', 'Pinecone free tier allows only 1 index. Delete unused ones first.'],
                    ['IP restrictions on key', 'If you set key restrictions, add the RAGhost server IP to the allowlist.'],
                  ].map(([k, v], i) => (<li key={i} className="flex gap-2 pl-2"><span className="font-black flex-shrink-0">{i+1}.</span><div><span className="font-bold">{k} — </span><span className="text-nb-muted">{v}</span></div></li>))}
                </ol>
              </div>
            )},
            { color: 'bg-nb-yellow',  emoji: '⚡', title: '"Gemini API key invalid" or quota errors', solution: (
              <div className="space-y-2 text-sm">
                {[
                  ['Key not enabled for Generative Language API', 'Go to Google Cloud Console → APIs → enable "Generative Language API" for your project.'],
                  ['Billing not set up', 'Even on the free tier you need a billing account attached to your GCP project.'],
                  ['60 req/min quota hit', 'Add exponential backoff or upgrade to a paid quota. Free tier: 60 RPM.'],
                  ['Key has HTTP referrer restrictions', 'API keys with referrer restrictions won\'t work server-side. Create a new unrestricted key for server use.'],
                ].map(([k, v], i) => (<div key={i} className="flex gap-2 border-2 border-black p-2.5 bg-nb-bg"><span className="text-nb-muted flex-shrink-0">→</span><div><span className="font-bold">{k} </span><span className="text-nb-muted text-xs">{v}</span></div></div>))}
              </div>
            )},
            { color: 'bg-nb-blue',    emoji: '📤', title: 'Document uploads fail or get stuck at processing', solution: (
              <div className="space-y-2 text-sm">
                <div className="border-2 border-black overflow-hidden">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-nb-blue border-b-2 border-black"><th className="text-left p-2 border-r-2 border-black">Symptom</th><th className="text-left p-2">Fix</th></tr></thead>
                    <tbody>
                      {[
                        ['File rejected immediately','Check file size (max 10MB) and format (PDF/TXT/DOCX/MD only)'],
                        ['Stuck on "Processing"','Scanned PDFs without embedded text can\'t be parsed. Use a text-layer PDF.'],
                        ['Completed but no answers','Verify Pinecone index dimension is exactly 768. Query Pinecone Stats to confirm vector count increased.'],
                        ['Upload succeeds, re-upload fails','Known behaviour — re-uploads delete old vectors first. Wait 30s and retry.'],
                      ].map(([s,f]) => <tr key={s} className="border-t-2 border-black"><td className="p-2 border-r-2 border-black text-nb-muted">{s}</td><td className="p-2">{f}</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            )},
            { color: 'bg-purple-200', emoji: '💬', title: 'Bot gives empty, wrong, or repetitive answers', solution: (
              <div className="space-y-2 text-sm">
                {['No documents in knowledge base — upload at least one before testing',
                  'Temperature too high (>0.8) — lower it to 0.2–0.4 for factual Q&A bots',
                  'System prompt too restrictive — try removing/simplifying it to test',
                  'topK too low (default 10) — increase to 20 if answers lack context',
                  'Query is out of domain — the bot can only answer what\'s in your documents',
                ].map((s, i) => <div key={i} className="flex gap-2 border-b-2 last:border-0 border-gray-100 py-2"><span className="w-5 h-5 border-2 border-black bg-purple-200 flex items-center justify-center font-black text-xs flex-shrink-0">{i+1}</span><p>{s}</p></div>)}
              </div>
            )},
            { color: 'bg-orange-200', emoji: '🌐', title: 'Widget not showing on my website', solution: (
              <div className="space-y-2 text-sm">
                {[
                  ['Script not loading', 'Open DevTools → Network tab → filter for "widget-loader". Check for 404 or CORS errors.'],
                  ['Wrong bot ID', 'Bot IDs are case-sensitive. Copy it directly from the Embed modal, not from the URL.'],
                  ['Content Security Policy blocking it', 'Add to your CSP headers: script-src \'self\' https://raghost.app; connect-src \'self\' https://raghost.app;'],
                  ['Widget loads but z-index wrong', 'Add data-z-index="99999" to override other elements (sticky headers, chat widgets etc).'],
                  ['Script included twice', 'Remove duplicate script tags. Use the guard: if (document.querySelector(\'[data-bot-id]\')) return;'],
                ].map(([k, v], i) => <div key={i} className="border-2 border-black p-2.5 bg-nb-bg"><p className="font-bold text-xs">{k}</p><p className="text-xs text-nb-muted mt-0.5">{v}</p></div>)}
              </div>
            )},
          ].map(({ color, emoji, title, solution }, i) => (
            <div key={i} className="bg-white border-2 border-black shadow-nb overflow-hidden">
              <button className={`w-full text-left p-4 flex items-center gap-3 transition-colors hover:bg-nb-bg ${openFaq === i ? color : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="text-xl flex-shrink-0">{emoji}</span>
                <span className="font-black text-sm flex-1">{title}</span>
                <ChevronRight size={16} className={`flex-shrink-0 transition-transform text-nb-muted ${openFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="border-t-2 border-black p-5 bg-nb-bg">{solution}</div>
              )}
            </div>
          ))}

          {/* Still stuck */}
          <div className="bg-black text-white border-2 border-black shadow-nb p-5">
            <h3 className="font-black mb-1">Still stuck?</h3>
            <p className="text-sm text-white/50 mb-4">Couldn't find your answer above? Reach out through these channels:</p>
            <div className="flex flex-wrap gap-3">
              <a href="https://ai.google.dev/docs" target="_blank" rel="noopener noreferrer" className="nb-btn bg-nb-yellow text-black border-nb-yellow px-4 py-2 text-xs inline-flex items-center gap-1.5">Gemini Docs <ExternalLink size={11} /></a>
              <a href="https://docs.pinecone.io/" target="_blank" rel="noopener noreferrer" className="nb-btn bg-nb-blue text-black border-nb-blue px-4 py-2 text-xs inline-flex items-center gap-1.5">Pinecone Docs <ExternalLink size={11} /></a>
              <a href="https://github.com/pavankumar-vh/RAGHost/issues/new" target="_blank" rel="noopener noreferrer" className="nb-btn bg-white text-black border-white px-4 py-2 text-xs inline-flex items-center gap-1.5">Open GitHub Issue <ExternalLink size={11} /></a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


/* ─────────────────── SHARED ─────────────────── */
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <div className="w-10 h-10 border-4 border-black border-t-nb-yellow animate-spin" />
    <p className="text-sm font-bold text-nb-muted">Loading...</p>
  </div>
);

export default Dashboard;
