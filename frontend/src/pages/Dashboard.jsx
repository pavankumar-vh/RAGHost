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
      <div className="w-8 h-8 border-2 border-black bg-nb-yellow flex items-center justify-center"><Bot size={14} /></div>
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
const MyBotsView = ({ bots, setShowBotModal, setSelectedBot, setShowKnowledgeModal, onEdit, onDelete, onShowEmbed, loading, searchQuery }) => {
  if (loading) return <LoadingSpinner />;
  const filtered = bots.filter(b => !searchQuery || b.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const accents = ['bg-nb-yellow', 'bg-nb-pink', 'bg-nb-blue', 'bg-purple-200', 'bg-orange-200', 'bg-green-200'];
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
              <div className={`h-2 ${accents[i % accents.length]}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 border-2 border-black ${accents[i % accents.length]} flex items-center justify-center`}><Bot size={20} /></div>
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

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const CodeBlock = ({ code, id, lang = 'bash' }) => (
    <div className="relative mt-2 border-2 border-black bg-gray-950 text-green-300 font-mono text-xs sm:text-sm overflow-x-auto">
      <div className="flex items-center justify-between px-4 py-1.5 bg-black/60 border-b border-white/10">
        <span className="text-white/40 text-xs uppercase tracking-wider">{lang}</span>
        <button onClick={() => copy(code, id)} className="flex items-center gap-1 border border-white/20 bg-white/10 hover:bg-white/20 px-2 py-0.5 text-xs text-white transition-colors">
          {copiedId === id ? <><Check size={11} className="text-green-400" />Copied!</> : <><Copy size={11} />Copy</>}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre"><code>{code}</code></pre>
    </div>
  );

  const Badge = ({ children, color = 'bg-nb-yellow' }) => (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border-2 border-black ${color}`}>{children}</span>
  );

  const EndpointRow = ({ method, path, desc, badge }) => {
    const colors = { GET: 'bg-green-200 text-green-800', POST: 'bg-nb-blue text-blue-800', PUT: 'bg-nb-yellow text-yellow-800', DELETE: 'bg-red-200 text-red-800' };
    return (
      <div className="border-2 border-black p-3 sm:p-4 bg-white hover:bg-nb-bg transition-colors">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`font-mono text-xs font-bold px-2 py-0.5 border-2 border-black ${colors[method] || 'bg-gray-100'}`}>{method}</span>
          <code className="font-mono text-xs sm:text-sm text-black font-bold break-all">{path}</code>
          {badge && <Badge color="bg-nb-pink">{badge}</Badge>}
        </div>
        <p className="text-xs text-nb-muted pl-1">{desc}</p>
      </div>
    );
  };

  const tabs = [
    { id: 'quickstart', label: 'Quick Start',    icon: Zap },
    { id: 'widget',     label: 'Widget Embed',   icon: Globe },
    { id: 'api',        label: 'API Reference',  icon: Terminal },
    { id: 'config',     label: 'Configuration',  icon: Settings },
    { id: 'trouble',    label: 'Troubleshooting', icon: AlertCircle },
  ];

  return (
    <div className="w-full max-w-4xl space-y-0">
      {/* Header */}
      <div className="bg-nb-yellow border-2 border-black shadow-nb p-5 sm:p-6 mb-6">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 border-2 border-black bg-black flex items-center justify-center flex-shrink-0">
            <BookOpen size={22} className="text-nb-yellow" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Documentation</h1>
            <p className="text-black/60 text-sm mt-0.5">Everything you need to build and deploy AI chatbots with RAGhost</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5 scrollbar-none">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 font-bold text-xs sm:text-sm border-2 whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === id ? 'bg-black text-white border-black' : 'bg-white border-black text-nb-muted hover:bg-nb-yellow hover:text-black'
            }`}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ── QUICK START ─────────────────────────────────────── */}
      {activeTab === 'quickstart' && (
        <div className="space-y-5">
          <div className="bg-white border-2 border-black shadow-nb p-5">
            <h2 className="text-lg font-black mb-1">Get Running in 5 Minutes</h2>
            <p className="text-sm text-nb-muted">Follow these steps to deploy your first RAG-powered chatbot.</p>
          </div>

          {[
            {
              n: 1, color: 'bg-nb-yellow', icon: Key, title: 'Get a Gemini API Key',
              content: (
                <>
                  <p className="text-sm mb-3">Gemini handles all AI responses and embeddings. The free tier is generous enough for development and small production loads.</p>
                  <ol className="text-sm space-y-2 mb-3">
                    <li className="flex gap-2"><ArrowRight size={14} className="mt-0.5 flex-shrink-0 text-nb-muted" /><span>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-bold underline">aistudio.google.com</a> and sign in with your Google account</span></li>
                    <li className="flex gap-2"><ArrowRight size={14} className="mt-0.5 flex-shrink-0 text-nb-muted" /><span>Click <strong>Create API Key</strong> → select a Google Cloud project (or create one)</span></li>
                    <li className="flex gap-2"><ArrowRight size={14} className="mt-0.5 flex-shrink-0 text-nb-muted" /><span>Copy the key — it looks like this:</span></li>
                  </ol>
                  <CodeBlock code="AIzaSyD-YourActualKeyGoesHere1234567890" id="gemini-key" lang="text" />
                  <p className="text-xs text-nb-muted mt-2">Free quota: 60 requests/min · 1,500 requests/day for Gemini 1.5 Flash</p>
                </>
              ),
            },
            {
              n: 2, color: 'bg-nb-blue', icon: Database, title: 'Create a Pinecone Index',
              content: (
                <>
                  <p className="text-sm mb-3">Pinecone is the vector database that stores your document embeddings for semantic search.</p>
                  <ol className="text-sm space-y-2 mb-3">
                    <li className="flex gap-2"><ArrowRight size={14} className="mt-0.5 flex-shrink-0 text-nb-muted" /><span>Sign up at <a href="https://www.pinecone.io/" target="_blank" rel="noopener noreferrer" className="font-bold underline">pinecone.io</a> (free tier available)</span></li>
                    <li className="flex gap-2"><ArrowRight size={14} className="mt-0.5 flex-shrink-0 text-nb-muted" /><span>Click <strong>Create Index</strong> and set exactly these values:</span></li>
                  </ol>
                  <div className="border-2 border-black overflow-hidden mb-3">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-nb-blue"><th className="text-left p-2 border-r-2 border-black font-bold">Setting</th><th className="text-left p-2 font-bold">Value</th></tr></thead>
                      <tbody>
                        {[['Dimensions','768'],['Metric','cosine'],['Pod type','Starter (free)'],['Cloud','Any available region']].map(([k,v]) => (
                          <tr key={k} className="border-t-2 border-black"><td className="p-2 border-r-2 border-black font-mono text-nb-muted">{k}</td><td className="p-2 font-bold">{v}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ol className="text-sm space-y-2">
                    <li className="flex gap-2"><ArrowRight size={14} className="mt-0.5 flex-shrink-0 text-nb-muted" /><span>Copy the index name (e.g. <code className="bg-gray-100 px-1 font-mono">my-raghost-index</code>)</span></li>
                    <li className="flex gap-2"><ArrowRight size={14} className="mt-0.5 flex-shrink-0 text-nb-muted" /><span>Go to <strong>API Keys</strong> in the sidebar and copy your Pinecone API key</span></li>
                  </ol>
                </>
              ),
            },
            {
              n: 3, color: 'bg-nb-pink', icon: Bot, title: 'Create Your First Bot',
              content: (
                <>
                  <p className="text-sm mb-3">Navigate to <strong>My Bots</strong> → <strong>New Bot</strong> and fill in:</p>
                  <div className="border-2 border-black overflow-hidden">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-nb-pink"><th className="text-left p-2 border-r-2 border-black font-bold">Field</th><th className="text-left p-2 font-bold">Description</th></tr></thead>
                      <tbody>
                        {[
                          ['Bot Name','Friendly name shown in the dashboard'],
                          ['Bot Type','General, Customer Support, or Technical'],
                          ['Gemini API Key','From Step 1'],
                          ['Pinecone API Key','From Step 2'],
                          ['Pinecone Index Name','The index name you created'],
                          ['Welcome Message','First message users see in the chat widget'],
                        ].map(([k, v]) => (
                          <tr key={k} className="border-t-2 border-black"><td className="p-2 border-r-2 border-black font-mono text-nb-muted whitespace-nowrap">{k}</td><td className="p-2">{v}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ),
            },
            {
              n: 4, color: 'bg-purple-200', icon: Upload, title: 'Upload Knowledge Base Documents',
              content: (
                <>
                  <p className="text-sm mb-3">Go to <strong>My Bots</strong> → click your bot → <strong>Knowledge Base</strong>. Upload any documents you want the bot to answer questions about.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[['PDF','.pdf'],['Text','.txt'],['Word','.docx'],['Markdown','.md']].map(([label, ext]) => (
                      <div key={ext} className="border-2 border-black p-2 text-center bg-nb-bg">
                        <FileText size={20} className="mx-auto mb-1" />
                        <p className="text-xs font-bold">{label}</p>
                        <p className="text-xs text-nb-muted font-mono">{ext}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-nb-muted">Max file size: 10 MB per file. Documents are chunked, embedded, and stored in Pinecone automatically.</p>
                </>
              ),
            },
            {
              n: 5, color: 'bg-orange-200', icon: Code, title: 'Embed on Your Website',
              content: (
                <>
                  <p className="text-sm mb-3">Go to <strong>My Bots</strong> → your bot → <strong>Embed</strong> to copy the widget code. Paste it anywhere in your HTML:</p>
                  <CodeBlock code={`<script src="https://raghost.app/widget/widget-loader.js"\n  data-bot-id="your_bot_id_here"\n  data-primary-color="#000000"\n  data-position="bottom-right"\n  async>\n</script>`} id="embed-quick" lang="html" />
                  <p className="text-xs text-nb-muted mt-2">That's it! The chat widget will appear on your site. No framework required.</p>
                </>
              ),
            },
          ].map(({ n, color, icon: Icon, title, content }) => (
            <div key={n} className="bg-white border-2 border-black shadow-nb">
              <div className={`${color} border-b-2 border-black p-4 flex items-center gap-3`}>
                <div className="w-9 h-9 border-2 border-black bg-white flex items-center justify-center font-black text-lg flex-shrink-0">{n}</div>
                <Icon size={18} className="flex-shrink-0" />
                <h3 className="font-black text-base">{title}</h3>
              </div>
              <div className="p-5">{content}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── WIDGET EMBED ─────────────────────────────────────── */}
      {activeTab === 'widget' && (
        <div className="space-y-5">
          <div className="bg-white border-2 border-black shadow-nb p-5">
            <h2 className="text-lg font-black mb-1">Embedding the Chat Widget</h2>
            <p className="text-sm text-nb-muted">The RAGhost widget is a self-contained JS bundle. Drop it into any HTML page or frontend framework.</p>
          </div>

          {/* HTML */}
          <section className="bg-white border-2 border-black shadow-nb">
            <div className="border-b-2 border-black p-4 flex items-center gap-2 bg-nb-yellow">
              <Globe size={16} />
              <h3 className="font-black">Vanilla HTML</h3>
            </div>
            <div className="p-5">
              <p className="text-sm mb-2">Paste before your closing <code className="bg-gray-100 px-1 font-mono text-xs">&lt;/body&gt;</code> tag:</p>
              <CodeBlock code={`<!-- RAGhost Widget -->\n<script\n  src="https://raghost.app/widget/widget-loader.js"\n  data-bot-id="YOUR_BOT_ID"\n  data-primary-color="#000000"\n  data-secondary-color="#FFFEF0"\n  data-position="bottom-right"\n  data-welcome-text="Hi! How can I help you?"\n  data-placeholder="Type a message..."\n  async\n></script>`} id="html-embed" lang="html" />
            </div>
          </section>

          {/* React */}
          <section className="bg-white border-2 border-black shadow-nb">
            <div className="border-b-2 border-black p-4 flex items-center gap-2 bg-nb-blue">
              <Cpu size={16} />
              <h3 className="font-black">React / Next.js</h3>
            </div>
            <div className="p-5">
              <p className="text-sm mb-2">Use <code className="bg-gray-100 px-1 font-mono text-xs">useEffect</code> to inject the script after mount:</p>
              <CodeBlock code={`import { useEffect } from 'react';\n\nexport default function RagHostWidget({ botId }) {\n  useEffect(() => {\n    if (document.querySelector('[data-bot-id]')) return;\n    const script = document.createElement('script');\n    script.src = 'https://raghost.app/widget/widget-loader.js';\n    script.setAttribute('data-bot-id', botId);\n    script.setAttribute('data-primary-color', '#000000');\n    script.setAttribute('data-position', 'bottom-right');\n    script.async = true;\n    document.body.appendChild(script);\n    return () => document.body.removeChild(script);\n  }, [botId]);\n  return null;\n}`} id="react-embed" lang="jsx" />
              <p className="text-sm mt-3 mb-2">Then use it in any page:</p>
              <CodeBlock code={`import RagHostWidget from './RagHostWidget';\n\nexport default function MyPage() {\n  return (\n    <main>\n      <h1>My Page</h1>\n      <RagHostWidget botId="your_bot_id_here" />\n    </main>\n  );\n}`} id="react-embed-use" lang="jsx" />
            </div>
          </section>

          {/* Vue */}
          <section className="bg-white border-2 border-black shadow-nb">
            <div className="border-b-2 border-black p-4 flex items-center gap-2 bg-green-200">
              <Layers size={16} />
              <h3 className="font-black">Vue 3</h3>
            </div>
            <div className="p-5">
              <CodeBlock code={`<script setup>\nimport { onMounted, onUnmounted } from 'vue';\n\nconst botId = 'YOUR_BOT_ID';\nlet script;\n\nonMounted(() => {\n  script = document.createElement('script');\n  script.src = 'https://raghost.app/widget/widget-loader.js';\n  script.setAttribute('data-bot-id', botId);\n  script.async = true;\n  document.body.appendChild(script);\n});\n\nonUnmounted(() => script && document.body.removeChild(script));\n</script>\n\n<template><slot /></template>`} id="vue-embed" lang="vue" />
            </div>
          </section>

          {/* Config table */}
          <section className="bg-white border-2 border-black shadow-nb">
            <div className="border-b-2 border-black p-4 flex items-center gap-2 bg-nb-pink">
              <Settings size={16} />
              <h3 className="font-black">Widget Attributes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[520px]">
                <thead><tr className="bg-gray-50 border-b-2 border-black">
                  <th className="text-left p-3 border-r-2 border-black font-bold">Attribute</th>
                  <th className="text-left p-3 border-r-2 border-black font-bold">Default</th>
                  <th className="text-left p-3 font-bold">Description</th>
                </tr></thead>
                <tbody>
                  {[
                    ['data-bot-id','required','Your bot\'s unique ID from the dashboard'],
                    ['data-primary-color','#000000','Main accent color (hex)'],
                    ['data-secondary-color','#FFFEF0','Background color (hex)'],
                    ['data-position','bottom-right','bottom-right · bottom-left · top-right · top-left'],
                    ['data-welcome-text','Hi! How can I help?','Opening message shown to users'],
                    ['data-placeholder','Type a message...','Input placeholder text'],
                    ['data-button-text','Chat with us','Floating button label'],
                    ['data-theme','default','default · minimal · glass · modern-dark'],
                    ['data-z-index','9999','CSS z-index of the widget'],
                  ].map(([attr, def, desc]) => (
                    <tr key={attr} className="border-t-2 border-black">
                      <td className="p-3 border-r-2 border-black font-mono text-nb-muted">{attr}</td>
                      <td className="p-3 border-r-2 border-black font-mono">{def}</td>
                      <td className="p-3">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ── API REFERENCE ─────────────────────────────────────── */}
      {activeTab === 'api' && (
        <div className="space-y-5">
          <div className="bg-white border-2 border-black shadow-nb p-5">
            <h2 className="text-lg font-black mb-1">REST API Reference</h2>
            <p className="text-sm text-nb-muted">Base URL: <code className="bg-gray-100 px-1 font-mono">https://raghost.app/api</code></p>
          </div>

          {/* Auth */}
          <section className="bg-white border-2 border-black shadow-nb">
            <div className="border-b-2 border-black p-4 flex items-center gap-2 bg-nb-yellow">
              <Shield size={16} />
              <h3 className="font-black">Authentication</h3>
            </div>
            <div className="p-5">
              <p className="text-sm mb-3">All authenticated endpoints require a Firebase ID token in the Authorization header:</p>
              <CodeBlock code={`Authorization: Bearer <firebase_id_token>`} id="auth-header" lang="http" />
              <p className="text-sm mt-3 mb-2">Obtaining a token (frontend):</p>
              <CodeBlock code={`import { getAuth } from 'firebase/auth';\n\nconst token = await getAuth().currentUser.getIdToken();\n// Use token in your API calls`} id="auth-token" lang="javascript" />
            </div>
          </section>

          {/* Bots */}
          <section className="bg-white border-2 border-black shadow-nb">
            <div className="border-b-2 border-black p-4 flex items-center gap-2 bg-nb-pink">
              <Bot size={16} />
              <h3 className="font-black">Bots</h3>
            </div>
            <div className="p-0 space-y-0 divide-y-2 divide-black">
              <EndpointRow method="GET" path="/bots" desc="List all bots for the authenticated user" />
              <EndpointRow method="POST" path="/bots" desc="Create a new bot with Gemini + Pinecone credentials" />
              <EndpointRow method="GET" path="/bots/:id" desc="Get a specific bot's full config including widget settings" />
              <EndpointRow method="PUT" path="/bots/:id" desc="Update bot name, type, API keys, or welcome message" />
              <EndpointRow method="DELETE" path="/bots/:id" desc="Permanently delete a bot and all its analytics data" />
              <EndpointRow method="POST" path="/bots/:id/verify" desc="Re-verify Pinecone and Gemini API key connections" />
              <EndpointRow method="PUT" path="/bots/:id/settings" desc="Update temperature, maxTokens, systemPrompt" />
              <EndpointRow method="GET" path="/bots/:id/widget-config" desc="Get the widget's visual configuration" />
              <EndpointRow method="PUT" path="/bots/:id/widget-config" desc="Save colors, position, theme, and button text" />
            </div>
            <div className="p-5 border-t-2 border-black">
              <p className="text-sm font-bold mb-2">Example — Create Bot:</p>
              <CodeBlock code={`POST /api/bots\nContent-Type: application/json\nAuthorization: Bearer <token>\n\n{\n  "name": "Support Bot",\n  "type": "customer_support",\n  "geminiApiKey": "AIzaSy...",\n  "pineconeApiKey": "pcsk_...",\n  "pineconeIndexName": "my-index",\n  "welcomeMessage": "Hi! How can I help you today?"\n}`} id="create-bot" lang="json" />
            </div>
          </section>

          {/* Chat */}
          <section className="bg-white border-2 border-black shadow-nb">
            <div className="border-b-2 border-black p-4 flex items-center gap-2 bg-nb-blue">
              <MessageSquare size={16} />
              <h3 className="font-black">Chat</h3>
            </div>
            <div className="p-0 space-y-0 divide-y-2 divide-black">
              <EndpointRow method="POST" path="/chat/:botId" desc="Send a chat message and receive a RAG-powered response" badge="Public" />
              <EndpointRow method="GET" path="/chat/:botId/sessions" desc="List all chat sessions for a bot (authenticated)" />
              <EndpointRow method="GET" path="/chat/:botId/sessions/:sessionId" desc="Get full message history for a session (authenticated)" />
            </div>
            <div className="p-5 border-t-2 border-black">
              <p className="text-sm font-bold mb-2">Example — Send a message:</p>
              <CodeBlock code={`POST /api/chat/YOUR_BOT_ID\nContent-Type: application/json\n\n{\n  "message": "What is your return policy?",\n  "sessionId": "user_session_abc123"   // optional\n}`} id="chat-send" lang="json" />
              <p className="text-sm font-bold mt-4 mb-2">Response:</p>
              <CodeBlock code={`{\n  "success": true,\n  "response": "Our return policy allows returns within 30 days...",\n  "sessionId": "user_session_abc123",\n  "sources": [\n    { "text": "...relevant chunk...", "score": 0.94 }\n  ]\n}`} id="chat-resp" lang="json" />
            </div>
          </section>

          {/* Knowledge Base */}
          <section className="bg-white border-2 border-black shadow-nb">
            <div className="border-b-2 border-black p-4 flex items-center gap-2 bg-purple-200">
              <Database size={16} />
              <h3 className="font-black">Knowledge Base</h3>
            </div>
            <div className="p-0 space-y-0 divide-y-2 divide-black">
              <EndpointRow method="GET"    path="/knowledge/:botId"     desc="List all uploaded documents with status" />
              <EndpointRow method="POST"   path="/knowledge/:botId/upload" desc="Upload a PDF, TXT, DOCX, or MD file (multipart/form-data)" />
              <EndpointRow method="DELETE" path="/knowledge/:botId/:docId" desc="Remove a document and its vectors from Pinecone" />
              <EndpointRow method="GET"    path="/knowledge/:botId/jobs"   desc="Get upload job status (chunking + embedding progress)" />
            </div>
          </section>

          {/* Analytics */}
          <section className="bg-white border-2 border-black shadow-nb">
            <div className="border-b-2 border-black p-4 flex items-center gap-2 bg-orange-200">
              <BarChart3 size={16} />
              <h3 className="font-black">Analytics</h3>
            </div>
            <div className="p-0 space-y-0 divide-y-2 divide-black">
              <EndpointRow method="GET" path="/analytics/overview"        desc="Account-level stats: total bots, queries, sessions" />
              <EndpointRow method="GET" path="/analytics/daily?days=7"    desc="Daily query counts for the past N days" />
              <EndpointRow method="GET" path="/analytics/bots/:id"        desc="Per-bot analytics: queries, accuracy, top questions" />
            </div>
          </section>
        </div>
      )}

      {/* ── CONFIGURATION ─────────────────────────────────────── */}
      {activeTab === 'config' && (
        <div className="space-y-5">
          <div className="bg-white border-2 border-black shadow-nb p-5">
            <h2 className="text-lg font-black mb-1">Bot Configuration Reference</h2>
            <p className="text-sm text-nb-muted">Advanced settings available via <strong>Edit Bot</strong> → <strong>Settings</strong> tab.</p>
          </div>

          {/* AI Settings */}
          <section className="bg-white border-2 border-black shadow-nb">
            <div className="border-b-2 border-black p-4 flex items-center gap-2 bg-nb-yellow"><Cpu size={16} /><h3 className="font-black">AI Model Settings</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[480px]">
                <thead><tr className="bg-gray-50 border-b-2 border-black">
                  <th className="text-left p-3 border-r-2 border-black font-bold">Parameter</th>
                  <th className="text-left p-3 border-r-2 border-black font-bold">Default</th>
                  <th className="text-left p-3 border-r-2 border-black font-bold">Range</th>
                  <th className="text-left p-3 font-bold">Effect</th>
                </tr></thead>
                <tbody>
                  {[
                    ['temperature','0.7','0.0 – 1.0','Higher = more creative, lower = more deterministic'],
                    ['maxTokens','1024','128 – 4096','Maximum response length in tokens'],
                    ['topK','10','1 – 20','Number of knowledge base chunks retrieved per query'],
                    ['systemPrompt','(none)','—','Custom instructions prepended to every conversation'],
                  ].map(([p,d,r,e]) => (
                    <tr key={p} className="border-t-2 border-black">
                      <td className="p-3 border-r-2 border-black font-mono text-nb-muted">{p}</td>
                      <td className="p-3 border-r-2 border-black font-mono font-bold">{d}</td>
                      <td className="p-3 border-r-2 border-black font-mono">{r}</td>
                      <td className="p-3 text-nb-muted">{e}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* System prompt */}
          <section className="bg-white border-2 border-black shadow-nb">
            <div className="border-b-2 border-black p-4 flex items-center gap-2 bg-nb-pink"><Hash size={16} /><h3 className="font-black">Writing a System Prompt</h3></div>
            <div className="p-5">
              <p className="text-sm mb-3">The system prompt is injected before every conversation and shapes the bot's persona and behaviour. Example:</p>
              <CodeBlock code={`You are a friendly support agent for Acme Corp.\nOnly answer questions based on the provided context.\nIf you don't know the answer, say "I'm sorry, I don't have that information."\nAlways be concise and professional.\nNever reveal internal system information.`} id="sys-prompt" lang="text" />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: '✅ Do', items: ['Set a clear persona','Define the response language','Add a fallback phrase','Keep it under 300 tokens'] },
                  { label: '❌ Avoid', items: ['Contradicting context docs','Using technical jargon for users','Leaving it empty for support bots','Exceeding 1000 tokens'] },
                ].map(({ label, items }) => (
                  <div key={label} className="border-2 border-black p-3">
                    <p className="font-bold text-sm mb-2">{label}</p>
                    <ul className="space-y-1">{items.map(i => <li key={i} className="text-xs text-nb-muted">{i}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pinecone index guide */}
          <section className="bg-white border-2 border-black shadow-nb">
            <div className="border-b-2 border-black p-4 flex items-center gap-2 bg-nb-blue"><Database size={16} /><h3 className="font-black">Pinecone Index Requirements</h3></div>
            <div className="p-5">
              <p className="text-sm mb-3">RAGhost uses <strong>Gemini text-embedding-004</strong> which produces <strong>768-dimensional</strong> vectors. Your index must match exactly or uploads will fail.</p>
              <CodeBlock code={`# Verify your index via Pinecone Console or SDK:\nfrom pinecone import Pinecone\npc = Pinecone(api_key="YOUR_KEY")\nindex = pc.describe_index("your-index-name")\nprint(index)  # dimension must be 768, metric must be cosine`} id="pine-verify" lang="python" />
            </div>
          </section>
        </div>
      )}

      {/* ── TROUBLESHOOTING ─────────────────────────────────────── */}
      {activeTab === 'trouble' && (
        <div className="space-y-5">
          <div className="bg-white border-2 border-black shadow-nb p-5">
            <h2 className="text-lg font-black mb-1">Troubleshooting Guide</h2>
            <p className="text-sm text-nb-muted">Solutions to the most common issues.</p>
          </div>

          {[
            {
              color: 'bg-red-200', icon: XCircle, title: '"Pinecone verification failed"',
              items: [
                ['Wrong index name', 'Double-check the exact index name in your Pinecone console — it\'s case-sensitive.'],
                ['Wrong dimensions', 'Your index must use 768 dimensions and cosine metric. Delete and recreate if needed.'],
                ['API key missing', 'Make sure you copied the Pinecone API key (not the environment name).'],
                ['Free tier limit', 'The Pinecone free tier only allows 1 index. Delete old indexes if you\'ve hit the limit.'],
              ],
            },
            {
              color: 'bg-nb-yellow', icon: Zap, title: '"Gemini API key invalid"',
              items: [
                ['Billing not enabled', 'For production loads, enable billing in Google Cloud Console even on the free tier.'],
                ['Wrong project', 'The key must belong to a project with the "Generative Language API" enabled.'],
                ['Key restrictions', 'If you set IP/referrer restrictions on the key, the RAGhost server IP must be allowed.'],
                ['Quota exceeded', 'Free tier is 60 req/min. Upgrade or implement request queuing for high traffic.'],
              ],
            },
            {
              color: 'bg-nb-blue', icon: Upload, title: 'Document upload stuck or fails',
              items: [
                ['File too large', 'Maximum file size is 10 MB. Split large PDFs into smaller chunks before uploading.'],
                ['Scanned PDFs', 'Scanned PDFs without OCR text layers cannot be processed. Use a text-based PDF.'],
                ['Unsupported format', 'Only PDF, TXT, DOCX, and MD are supported. Convert other formats first.'],
                ['Pinecone full', 'The Pinecone free tier has a vector limit. Delete old documents to free space.'],
              ],
            },
            {
              color: 'bg-purple-200', icon: MessageSquare, title: 'Bot gives wrong or empty answers',
              items: [
                ['No documents uploaded', 'The bot needs knowledge base documents to answer questions. Upload at least one.'],
                ['Temperature too high', 'Lower temperature (e.g. 0.3) to get more factual, consistent answers.'],
                ['System prompt conflict', 'An overly restrictive system prompt can prevent the bot from answering. Review it.'],
                ['topK too low', 'Increase topK to retrieve more document chunks per query for complex questions.'],
              ],
            },
            {
              color: 'bg-orange-200', icon: Globe, title: 'Widget not appearing on site',
              items: [
                ['Wrong bot ID', 'Copy the bot ID exactly from the Embed modal — it\'s case-sensitive.'],
                ['CSP blocking scripts', 'Add raghost.app to your Content-Security-Policy script-src and connect-src directives.'],
                ['Script loaded twice', 'Include the widget script only once per page. Check for duplicate tags.'],
                ['CORS error', 'If self-hosting the backend, add your domain to the CORS allowlist in server config.'],
              ],
            },
          ].map(({ color, icon: Icon, title, items }) => (
            <section key={title} className="bg-white border-2 border-black shadow-nb">
              <div className={`border-b-2 border-black p-4 flex items-center gap-2 ${color}`}>
                <Icon size={16} />
                <h3 className="font-black">{title}</h3>
              </div>
              <div className="divide-y-2 divide-black">
                {items.map(([cause, fix]) => (
                  <div key={cause} className="p-4 flex gap-3">
                    <div className="w-2 h-2 mt-1.5 bg-black flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold">{cause}</p>
                      <p className="text-xs text-nb-muted mt-0.5">{fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Support links */}
          <div className="bg-black text-white border-2 border-black shadow-nb p-5">
            <h3 className="font-bold mb-3">Still stuck? Get help:</h3>
            <div className="flex flex-wrap gap-3">
              <a href="https://ai.google.dev/docs" target="_blank" rel="noopener noreferrer" className="nb-btn bg-nb-yellow text-black border-nb-yellow px-4 py-2 text-xs inline-flex items-center gap-1">Gemini Docs <ExternalLink size={12} /></a>
              <a href="https://docs.pinecone.io/" target="_blank" rel="noopener noreferrer" className="nb-btn bg-nb-blue text-black border-nb-blue px-4 py-2 text-xs inline-flex items-center gap-1">Pinecone Docs <ExternalLink size={12} /></a>
              <a href="https://github.com/pavankumar-vh/RAGHost/issues" target="_blank" rel="noopener noreferrer" className="nb-btn bg-white text-black border-white px-4 py-2 text-xs inline-flex items-center gap-1">Open GitHub Issue <ExternalLink size={12} /></a>
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
