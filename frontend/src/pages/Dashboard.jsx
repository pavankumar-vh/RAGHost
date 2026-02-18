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
import { LineChart } from '@mui/x-charts/LineChart';
import {
  Bot, Key, BarChart3, Home, LogOut, BookOpen, Plus, Search, TrendingUp,
  Activity, Zap, Database, MessageSquare, Loader2, Trash2, Edit, Code,
  CheckCircle2, XCircle, Copy, Check, ExternalLink, Menu, X, UserCircle,
} from 'lucide-react';

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
      />
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-nb-bg border-b-2 border-black px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden nb-btn bg-white p-2" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <h1 className="text-xl font-bold text-nb-text">{activePage}</h1>
          </div>
          <div className="relative hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search bots..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="nb-input pl-9 py-2 w-52 text-sm" />
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-8">
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
const Sidebar = ({ activePage, setActivePage, handleLogout, currentUser, isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard',     icon: Home,     accent: 'bg-nb-yellow' },
    { name: 'My Bots',       icon: Bot,      accent: 'bg-nb-pink' },
    { name: 'API Keys',      icon: Key,      accent: 'bg-nb-blue' },
    { name: 'Analytics',     icon: BarChart3, accent: 'bg-purple-300' },
    { name: 'Documentation', icon: BookOpen,   accent: 'bg-orange-300' },
    { name: 'Profile',        icon: UserCircle, accent: 'bg-green-300' },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r-2 border-black flex flex-col z-30 transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="p-5 border-b-2 border-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-nb-yellow border-2 border-black flex items-center justify-center"><Bot size={16} /></div>
          <span className="text-xl font-bold tracking-tight">RAGhost</span>
        </div>
        <button className="lg:hidden p-1 border-2 border-transparent hover:border-black transition-colors" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="px-4 py-3 border-b-2 border-black bg-nb-yellow/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-black bg-nb-yellow flex items-center justify-center font-bold text-black text-sm">
            {currentUser?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{currentUser?.email?.split('@')[0] || 'User'}</p>
            <p className="text-xs text-nb-muted truncate">{currentUser?.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map(({ name, icon: Icon, accent }) => {
          const active = activePage === name;
          return (
            <button key={name} onClick={() => setActivePage(name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 font-bold text-sm border-2 transition-all duration-150 ${active ? `${accent} border-black shadow-nb-sm text-black` : 'border-transparent text-nb-muted hover:border-black hover:bg-gray-50 hover:text-black'}`}>
              <Icon size={18} />{name}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t-2 border-black">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 font-bold text-sm border-2 border-transparent text-nb-muted hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150">
          <LogOut size={18} />Sign Out
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
    <div className="space-y-6 max-w-6xl">
      {bots.length === 0 && (
        <div className="bg-nb-yellow border-2 border-black shadow-nb p-6">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, bg }) => (
          <div key={title} className={`${bg} border-2 border-black shadow-nb p-5`}>
            <div className="w-9 h-9 border-2 border-black bg-white flex items-center justify-center mb-3"><Icon size={18} /></div>
            <p className="text-3xl font-bold text-black">{value}</p>
            <p className="text-xs font-bold text-black/60 mt-1 uppercase tracking-wide">{title}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
  const data = (dailyStats || []).slice(-7).map(s => ({
    value: s.queries || 0,
    day: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }));
  const hasData = data.some(d => d.value > 0);
  if (!hasData) return (
    <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200">
      <div className="text-center text-nb-muted">
        <Activity size={28} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm font-medium">No activity yet</p>
      </div>
    </div>
  );
  return (
    <div className="h-52">
      <LineChart
        xAxis={[{ scaleType: 'point', data: data.map(d => d.day), disableLine: true, disableTicks: true }]}
        yAxis={[{ disableLine: true, disableTicks: true }]}
        series={[{ data: data.map(d => d.value), color: '#000000', area: true, showMark: false, curve: 'monotoneX' }]}
        height={200}
        margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
        sx={{
          '& .MuiChartsAxis-tickLabel': { fill: '#6B6B6B', fontSize: '11px' },
          '& .MuiChartsGrid-line': { stroke: '#e5e5e5', strokeDasharray: '3 3' },
          '& .MuiLineElement-root': { strokeWidth: 2 },
          '& .MuiAreaElement-root': { fillOpacity: 0.08 },
        }}
        slotProps={{ legend: { hidden: true } }}
      />
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
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Bots</h2>
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
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold">API Keys</h2>
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
  const [copiedId, setCopiedId] = useState('');
  const copy = (text, id) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(''), 2000); };

  const CodeBlock = ({ code, id }) => (
    <div className="relative mt-2 border-2 border-black bg-gray-900 text-white font-mono text-sm p-4 overflow-x-auto">
      <button onClick={() => copy(code, id)} className="absolute top-2 right-2 border border-white/20 bg-white/10 hover:bg-white/20 p-1.5 transition-colors">
        {copiedId === id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
      <pre className="pr-10"><code>{code}</code></pre>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-nb-yellow border-2 border-black shadow-nb p-6">
        <div className="flex items-center gap-3"><BookOpen size={28} /><div><h1 className="text-3xl font-bold">Documentation</h1><p className="text-black/60 text-sm">Get your API keys and deploy your first bot</p></div></div>
      </div>
      {[
        {
          icon: Key, label: 'Gemini API Key', color: 'bg-nb-pink',
          steps: [
            { n: 1, t: 'Visit Google AI Studio', a: 'bg-nb-yellow', c: <><p className="text-sm">Get your free API key:</p><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 nb-btn bg-black text-white border-black px-3 py-1.5 text-xs">Open AI Studio <ExternalLink size={12} /></a></> },
            { n: 2, t: 'Copy Your API Key', a: 'bg-nb-yellow', c: <><p className="text-sm">Create an API Key and copy it:</p><CodeBlock code="AIzaSyD-example_key-1234567890abcdef" id="gemini-eg" /></> },
            { n: 3, t: 'Free Tier', a: 'bg-nb-yellow', c: <p className="text-sm">60 requests/minute — completely free for development.</p> },
          ],
        },
        {
          icon: Database, label: 'Pinecone API Key', color: 'bg-nb-blue',
          steps: [
            { n: 1, t: 'Sign up for Pinecone', a: 'bg-nb-blue', c: <a href="https://www.pinecone.io/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 nb-btn bg-black text-white border-black px-3 py-1.5 text-xs">Go to Pinecone <ExternalLink size={12} /></a> },
            { n: 2, t: 'Create an Index', a: 'bg-nb-blue', c: <ul className="text-sm space-y-1 list-disc list-inside"><li>Dimensions: <code className="bg-gray-100 px-1 rounded">768</code></li><li>Metric: Cosine</li><li>Cloud: any free region</li></ul> },
            { n: 3, t: 'Get Your API Key', a: 'bg-nb-blue', c: <><p className="text-sm">Go to "API Keys" in the sidebar:</p><CodeBlock code="pcsk_example-1234_key567890abcdefghijklmnop" id="pine-eg" /></> },
          ],
        },
      ].map(({ icon: Icon, label, color, steps }) => (
        <section key={label}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 border-2 border-black ${color} flex items-center justify-center`}><Icon size={16} /></div>
            <h2 className="text-xl font-bold">{label}</h2>
          </div>
          <div className="space-y-3">
            {steps.map(({ n, t, a, c }) => (
              <div key={n} className="bg-white border-2 border-black shadow-nb p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 border-2 border-black ${a} flex items-center justify-center font-bold flex-shrink-0`}>{n}</div>
                  <div className="flex-1"><h3 className="font-bold mb-2">{t}</h3>{c}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 border-2 border-black bg-green-300 flex items-center justify-center"><Zap size={16} /></div>
          <h2 className="text-xl font-bold">Deploy Your Bot</h2>
        </div>
        <div className="space-y-3">
          {['Create Your Bot — Click "New Bot" in My Bots', 'Enter API Keys — Paste your Gemini & Pinecone keys', 'Upload Documents — PDF, TXT, DOCX (max 10MB)', 'Test — Use the embedded chat widget!'].map((s, i) => (
            <div key={i} className="bg-white border-2 border-black shadow-nb p-4 flex items-start gap-3">
              <div className="w-7 h-7 border-2 border-black bg-nb-yellow flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div>
              <p className="text-sm font-medium pt-0.5">{s}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="bg-white border-2 border-black shadow-nb p-5 text-center">
        <h3 className="font-bold mb-3">Official Documentation</h3>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="https://ai.google.dev/docs" target="_blank" rel="noopener noreferrer" className="nb-btn bg-black text-white border-black px-4 py-2 text-xs inline-flex items-center gap-1">Gemini Docs <ExternalLink size={12} /></a>
          <a href="https://docs.pinecone.io/" target="_blank" rel="noopener noreferrer" className="nb-btn bg-white border-black px-4 py-2 text-xs inline-flex items-center gap-1">Pinecone Docs <ExternalLink size={12} /></a>
        </div>
      </div>
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
