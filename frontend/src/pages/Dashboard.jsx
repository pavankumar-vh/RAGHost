import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { botsService, setAuthToken } from '../services/api';
import BotConfigModal from '../components/BotConfigModal';
import { 
  LogOut, 
  Bot, 
  Key, 
  BarChart3, 
  Home, 
  Plus, 
  Search, 
  TrendingUp, 
  Activity,
  Zap,
  Database,
  MessageSquare,
  Settings,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Edit
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser, logout, getIdToken } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Dashboard');
  const [showBotModal, setShowBotModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bots on component mount
  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();
      if (token) {
        setAuthToken(token);
        const data = await botsService.getBots();
        setBots(data.bots || []);
      }
    } catch (error) {
      console.error('Error fetching bots:', error);
      setBots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async (botData) => {
    const token = await getIdToken();
    if (token) {
      setAuthToken(token);
      await botsService.createBot(botData);
      await fetchBots();
    }
  };

  const handleDeleteBot = async (botId) => {
    if (window.confirm('Are you sure you want to delete this bot?')) {
      const token = await getIdToken();
      if (token) {
        setAuthToken(token);
        await botsService.deleteBot(botId);
        await fetchBots();
      }
    }
  };

  // Stats data
  const stats = {
    totalBots: bots.length,
    activeBot: bots.filter(b => b.status === 'active').length,
    totalQueries: bots.reduce((sum, bot) => sum + (bot.totalQueries || 0), 0),
    avgAccuracy: bots.length > 0 
      ? Math.round(bots.reduce((sum, bot) => sum + (bot.accuracy || 0), 0) / bots.length)
      : 0
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-poppins flex">
      {/* Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto transition-all duration-300 ease-in-out">
        {/* Header */}
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Content Based on Active Page with smooth transitions */}
        <div className="animate-fadeIn">
          {activePage === 'Dashboard' && (
            <DashboardView 
              stats={stats} 
              bots={bots} 
              setShowBotModal={setShowBotModal}
              loading={loading}
            />
          )}
          
          {activePage === 'My Bots' && (
            <MyBotsView 
              bots={bots} 
              setShowBotModal={setShowBotModal}
              onDelete={handleDeleteBot}
              loading={loading}
            />
          )}
          
          {activePage === 'API Keys' && (
            <ApiKeysView bots={bots} loading={loading} />
          )}
          
          {activePage === 'Analytics' && <AnalyticsView bots={bots} loading={loading} />}
        </div>
      </main>

      {/* Bot Config Modal */}
      {showBotModal && (
        <BotConfigModal 
          setShowModal={setShowBotModal}
          onSave={handleCreateBot}
        />
      )}
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ activePage, setActivePage, handleLogout, currentUser }) => {
  const menuItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'My Bots', icon: Bot },
    { name: 'API Keys', icon: Key },
    { name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-gray-800 fixed h-full flex flex-col transition-all duration-300">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-accent-blue">RAGhost</h1>
        <p className="text-xs text-gray-500 mt-1">Bot Hosting Platform</p>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent-pink to-accent-blue flex items-center justify-center text-black font-bold">
            {currentUser?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {currentUser?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActivePage(item.name)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activePage === item.name
                ? 'bg-accent-blue text-black font-semibold scale-105'
                : 'text-gray-400 hover:bg-gray-900 hover:text-white hover:scale-102'
            }`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 hover:scale-102"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

// Header Component
const Header = ({ searchQuery, setSearchQuery }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">{getGreeting()}! 👋</h2>
          <p className="text-gray-500 mt-1">Manage your chatbots and analytics</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search bots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0A0A0A] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 w-64 focus:outline-none focus:border-accent-blue transition-colors"
          />
        </div>
      </div>
    </header>
  );
};

// Dashboard View
const DashboardView = ({ stats, bots, setShowBotModal, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-accent-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message for New Users */}
      {bots.length === 0 && (
        <div className="bg-gradient-to-r from-accent-blue/10 via-accent-pink/10 to-accent-yellow/10 border border-accent-blue/30 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 flex items-center justify-center">
              <Bot size={24} className="text-accent-blue" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Welcome to RAGhost! 🎉</h3>
              <p className="text-sm text-gray-400">Create your first bot to get started with AI-powered conversations</p>
            </div>
            <button
              onClick={() => setShowBotModal(true)}
              className="bg-accent-blue text-black font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-200 hover:scale-105"
            >
              Create Bot
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Bots" 
          value={stats.totalBots} 
          icon={Bot}
          color="pink"
          change={`${stats.totalBots} bot${stats.totalBots !== 1 ? 's' : ''} created`}
        />
        <StatCard 
          title="Active Bots" 
          value={stats.activeBot} 
          icon={Zap}
          color="yellow"
          change="Running smoothly"
        />
        <StatCard 
          title="Total Queries" 
          value={stats.totalQueries.toLocaleString()} 
          icon={MessageSquare}
          color="blue"
          change="All time"
        />
        <StatCard 
          title="Avg Accuracy" 
          value={`${stats.avgAccuracy}%`} 
          icon={TrendingUp}
          color="pink"
          change="Performance metric"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart - Takes 2 columns */}
        <div className="lg:col-span-2 bg-gradient-to-br from-accent-pink to-accent-pink/50 rounded-2xl p-6 text-black">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold">Bot Activity</h3>
              <p className="text-black/70 text-sm">Last 7 days</p>
            </div>
            <Activity size={24} />
          </div>
          <ActivityChart />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-accent-yellow to-accent-yellow/50 rounded-2xl p-6 text-black">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowBotModal(true)}
                className="w-full bg-black/20 hover:bg-black/30 rounded-xl p-4 text-left transition-all duration-200 hover:scale-105"
              >
                <Plus size={20} className="mb-2" />
                <p className="font-semibold">Create New Bot</p>
                <p className="text-xs text-black/70">Set up a new chatbot</p>
              </button>
            </div>
          </div>

          {/* Top Performing Bot */}
          {bots.length > 0 && (
            <div className="bg-gradient-to-br from-accent-pink to-accent-pink/50 rounded-2xl p-6 text-black">
              <h3 className="text-lg font-bold mb-4">Top Performer</h3>
              <div>
                <p className="font-semibold mb-2">{bots[0].name}</p>
                <div className="flex items-center justify-center my-4">
                  <div className="relative w-24 h-24">
                    <svg className="transform -rotate-90" width="96" height="96">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="rgba(0,0,0,0.2)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="black"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(bots[0].accuracy || 0) * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{bots[0].accuracy || 0}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-black/70 text-center">Accuracy Rate</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Bots */}
      {bots.length > 0 && (
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Recent Bots</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.slice(0, 3).map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, change }) => {
  const colorClasses = {
    pink: 'from-accent-pink/20 to-accent-pink/5 border-accent-pink/30',
    yellow: 'from-accent-yellow/20 to-accent-yellow/5 border-accent-yellow/30',
    blue: 'from-accent-blue/20 to-accent-blue/5 border-accent-blue/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <Icon className={`text-accent-${color}`} size={24} />
      </div>
      <p className="text-xs text-gray-500">{change}</p>
    </div>
  );
};

// Activity Chart Component
const ActivityChart = () => {
  const data = [30, 50, 40, 60, 45, 70, 55];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxValue = Math.max(...data);

  return (
    <div className="h-48">
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-black/20 rounded-t-lg relative" style={{ height: `${(value / maxValue) * 100}%` }}>
              <div className="absolute inset-0 bg-black/40 rounded-t-lg"></div>
            </div>
            <span className="text-xs font-medium">{days[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bot Card Component
const BotCard = ({ bot }) => {
  const colorClasses = {
    pink: 'from-accent-pink/10 to-accent-pink/5 border-accent-pink/30 text-accent-pink',
    yellow: 'from-accent-yellow/10 to-accent-yellow/5 border-accent-yellow/30 text-accent-yellow',
    blue: 'from-accent-blue/10 to-accent-blue/5 border-accent-blue/30 text-accent-blue',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[bot.color]} border rounded-xl p-4 hover:scale-105 transition-all duration-300 cursor-pointer`}>
      <div className="flex items-center justify-between mb-3">
        <Bot size={20} className={`text-accent-${bot.color}`} />
        <div className="flex items-center gap-2">
          {bot.pineconeVerified && (
            <CheckCircle2 size={14} className="text-green-400" />
          )}
          {bot.geminiVerified && (
            <CheckCircle2 size={14} className="text-green-400" />
          )}
          <span className={`text-xs px-2 py-1 rounded-full ${
            bot.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            {bot.status}
          </span>
        </div>
      </div>
      <h4 className="font-semibold mb-1 text-white">{bot.name}</h4>
      <p className="text-xs text-gray-400 mb-3">{bot.type}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{bot.totalQueries || 0} queries</span>
        <span className="text-gray-500">{bot.accuracy || 0}%</span>
      </div>
    </div>
  );
};

// My Bots View
const MyBotsView = ({ bots, setShowBotModal, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-accent-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Bots</h2>
          <p className="text-gray-500 mt-1">Manage all your chatbots</p>
        </div>
        <button
          onClick={() => setShowBotModal(true)}
          className="flex items-center gap-2 bg-accent-blue text-black font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-200 hover:scale-105"
        >
          <Plus size={20} />
          Create New Bot
        </button>
      </div>

      {bots.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-12 text-center">
          <Bot size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Bots Yet</h3>
          <p className="text-gray-500 mb-6">Create your first bot to get started</p>
          <button
            onClick={() => setShowBotModal(true)}
            className="bg-accent-blue text-black font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-all duration-200 hover:scale-105"
          >
            Create Your First Bot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <div key={bot.id} className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300 hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-accent-${bot.color} to-accent-${bot.color}/50 flex items-center justify-center`}>
                  <Bot size={24} className="text-black" />
                </div>
                <button 
                  onClick={() => onDelete(bot.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              <h3 className="text-lg font-bold mb-2">{bot.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{bot.type}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-semibold ${
                    bot.status === 'active' ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {bot.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Queries</span>
                  <span className="font-semibold">{bot.totalQueries || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Accuracy</span>
                  <span className="font-semibold">{bot.accuracy || 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pinecone</span>
                  {bot.pineconeVerified ? (
                    <CheckCircle2 size={16} className="text-green-400" />
                  ) : (
                    <XCircle size={16} className="text-red-400" />
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Gemini</span>
                  {bot.geminiVerified ? (
                    <CheckCircle2 size={16} className="text-green-400" />
                  ) : (
                    <XCircle size={16} className="text-red-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// API Keys View
const ApiKeysView = ({ bots, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-accent-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Keys Configuration</h2>
          <p className="text-gray-500 mt-1">API keys are configured per bot for better security and isolation</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-accent-blue/10 via-accent-pink/10 to-accent-yellow/10 border border-accent-blue/30 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-blue/20 flex items-center justify-center">
            <Key size={24} className="text-accent-blue" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Per-Bot API Configuration</h3>
            <p className="text-sm text-gray-400">Each bot has its own Pinecone and Gemini API keys. This ensures better security, separate billing, and independent knowledge bases.</p>
          </div>
        </div>
      </div>

      {/* Bots API Status */}
      {bots.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-12 text-center">
          <Bot size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Bots Configured</h3>
          <p className="text-gray-500 mb-6">Create a bot to configure its API keys</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <div key={bot.id} className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-accent-${bot.color} to-accent-${bot.color}/50 flex items-center justify-center`}>
                  <Bot size={20} className="text-black" />
                </div>
                <div>
                  <h3 className="font-bold">{bot.name}</h3>
                  <p className="text-xs text-gray-500">{bot.type}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-accent-blue" />
                    <span className="text-sm">Pinecone</span>
                  </div>
                  {bot.pineconeVerified ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle2 size={14} />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <XCircle size={14} />
                      Not verified
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-accent-pink" />
                    <span className="text-sm">Gemini</span>
                  </div>
                  {bot.geminiVerified ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle2 size={14} />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <XCircle size={14} />
                      Not verified
                    </span>
                  )}
                </div>
              </div>

              {bot.pineconeIndexName && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500">Index: {bot.pineconeIndexName}</p>
                  <p className="text-xs text-gray-500">Env: {bot.pineconeEnvironment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Analytics View
const AnalyticsView = ({ bots, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-accent-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-gray-500 mt-1">Track your bot performance</p>
      </div>

      {bots.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-12 text-center">
          <BarChart3 size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Analytics Data</h3>
          <p className="text-gray-500">Create bots to see analytics</p>
        </div>
      ) : (
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Bot Performance</h3>
          <div className="space-y-4">
            {bots.map((bot) => (
              <div key={bot.id} className="flex items-center gap-4 transition-all duration-300 hover:scale-102">
                <div className={`w-10 h-10 rounded-lg bg-accent-${bot.color}/20 flex items-center justify-center`}>
                  <Bot size={20} className={`text-accent-${bot.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{bot.name}</span>
                    <span className="text-sm text-gray-500">{bot.accuracy || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-accent-${bot.color} transition-all duration-500`}
                      style={{ width: `${bot.accuracy || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
