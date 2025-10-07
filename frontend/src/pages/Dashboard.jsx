import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { botsService, setAuthToken, analyticsService } from '../services/api';
import BotConfigModal from '../components/BotConfigModal';
import EmbedCodeModal from '../components/EmbedCodeModal';
import BotSettingsModal from '../components/BotSettingsModal';
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
  Edit,
  Code,
  DollarSign,
  Clock,
  Target,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const Dashboard = () => {
  const { currentUser, logout, getIdToken } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Dashboard');
  const [showBotModal, setShowBotModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBotSettings, setShowBotSettings] = useState(false);

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
    totalTokens: bots.reduce((sum, bot) => sum + (bot.totalTokensUsed || 0), 0),
    estimatedCost: bots.reduce((sum, bot) => sum + (bot.estimatedCost || 0), 0),
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
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          showGreeting={activePage === 'Dashboard'}
          activePage={activePage}
        />

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
              onShowEmbed={(bot) => {
                setSelectedBot(bot);
                setShowEmbedModal(true);
              }}
              onShowSettings={(bot) => {
                setSelectedBot(bot);
                setShowBotSettings(true);
              }}
              loading={loading}
            />
          )}
          
          {activePage === 'API Keys' && (
            <ApiKeysView bots={bots} loading={loading} />
          )}
          
          {activePage === 'Analytics' && <AnalyticsView bots={bots} loading={loading} />}
        </div>
      </main>

      {/* Modals */}
      {showBotModal && (
        <BotConfigModal 
          setShowModal={setShowBotModal}
          onSave={handleCreateBot}
        />
      )}

      {showEmbedModal && selectedBot && (
        <EmbedCodeModal 
          bot={selectedBot}
          setShowModal={setShowEmbedModal}
        />
      )}

      {showBotSettings && selectedBot && (
        <BotSettingsModal
          bot={selectedBot}
          setShowModal={setShowBotSettings}
          onUpdate={fetchBots}
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
const Header = ({ searchQuery, setSearchQuery, showGreeting = false, activePage }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour >= 12 && hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    if (hour >= 17 && hour < 21) return { text: 'Good evening', emoji: '🌆' };
    return { text: 'Good night', emoji: '🌙' };
  };

  const greeting = getGreeting();

  // Only show greeting on Dashboard page
  if (!showGreeting) {
    return null;
  }

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {greeting.text}!
            </span>
            <span className="text-4xl animate-pulse">{greeting.emoji}</span>
          </h2>
          <p className="text-gray-400 mt-2">Manage your chatbots and analytics</p>
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
const MyBotsView = ({ bots, setShowBotModal, onDelete, onShowEmbed, onShowSettings, loading }) => {
  const [hoveredBot, setHoveredBot] = React.useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <Loader2 size={48} className="animate-spin text-accent-blue" />
          <div className="absolute inset-0 blur-xl bg-accent-blue/20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            My Bots
          </h2>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <Bot size={16} />
            {bots.length} bot{bots.length !== 1 ? 's' : ''} • Manage your AI assistants
          </p>
        </div>
        <button
          onClick={() => setShowBotModal(true)}
          className="group relative flex items-center gap-2 bg-gradient-to-r from-accent-blue to-accent-blue/80 text-black font-bold px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-blue/50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Plus size={20} className="relative z-10" />
          <span className="relative z-10">Create New Bot</span>
        </button>
      </div>

      {bots.length === 0 ? (
        <div className="relative bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 rounded-3xl p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-pink/5"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-pink/20 flex items-center justify-center backdrop-blur-sm">
              <Bot size={48} className="text-accent-blue" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No Bots Yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your first AI-powered chatbot and start engaging with your users
            </p>
            <button
              onClick={() => setShowBotModal(true)}
              className="group relative bg-gradient-to-r from-accent-blue to-accent-blue/80 text-black font-bold px-8 py-4 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-blue/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center gap-2">
                <Plus size={20} />
                Create Your First Bot
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <div
              key={bot.id}
              onMouseEnter={() => setHoveredBot(bot.id)}
              onMouseLeave={() => setHoveredBot(null)}
              className="group relative bg-gradient-to-br from-gray-900/80 to-black border border-gray-800 rounded-2xl p-6 transition-all duration-500 hover:border-gray-600 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
            >
              {/* Animated gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br from-accent-${bot.color}/10 via-transparent to-accent-${bot.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Status glow effect */}
              {bot.status === 'active' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 blur-3xl rounded-full"></div>
              )}

              <div className="relative z-10">
                {/* Header with icon and actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br from-accent-${bot.color} to-accent-${bot.color}/60 flex items-center justify-center shadow-lg shadow-accent-${bot.color}/30 group-hover:scale-110 transition-transform duration-300`}>
                    <Bot size={28} className="text-black" />
                    {bot.status === 'active' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Action buttons - slide in on hover */}
                  <div className={`flex gap-2 transition-all duration-300 ${hoveredBot === bot.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    <button 
                      onClick={() => onShowSettings(bot)}
                      className="p-2 rounded-lg bg-gray-800/50 hover:bg-accent-yellow/20 hover:text-accent-yellow transition-all duration-200 backdrop-blur-sm"
                      title="Bot settings"
                    >
                      <Settings size={18} />
                    </button>
                    <button 
                      onClick={() => onShowEmbed(bot)}
                      className="p-2 rounded-lg bg-gray-800/50 hover:bg-accent-blue/20 hover:text-accent-blue transition-all duration-200 backdrop-blur-sm"
                      title="Get embed code"
                    >
                      <Code size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(bot.id)}
                      className="p-2 rounded-lg bg-gray-800/50 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 backdrop-blur-sm"
                      title="Delete bot"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                {/* Bot name and type */}
                <h3 className="text-xl font-bold mb-1 group-hover:text-accent-blue transition-colors duration-300">
                  {bot.name}
                </h3>
                <div className="flex items-center gap-2 mb-5">
                  <span className={`text-xs px-3 py-1 rounded-full bg-accent-${bot.color}/10 text-accent-${bot.color} border border-accent-${bot.color}/30`}>
                    {bot.type}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    bot.status === 'active' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                  }`}>
                    {bot.status === 'active' ? '● Active' : '○ Inactive'}
                  </span>
                </div>
                
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-black/30 rounded-lg p-3 border border-gray-800/50">
                    <div className="text-xs text-gray-500 mb-1">Queries</div>
                    <div className="text-lg font-bold">{bot.totalQueries || 0}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-gray-800/50">
                    <div className="text-xs text-gray-500 mb-1">Accuracy</div>
                    <div className="text-lg font-bold text-accent-blue">{bot.accuracy || 0}%</div>
                  </div>
                </div>

                {/* API Status */}
                <div className="space-y-2 pt-4 border-t border-gray-800/50">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Database size={14} />
                      <span>Pinecone</span>
                    </div>
                    {bot.pineconeVerified ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle2 size={14} />
                        <span className="text-xs">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400">
                        <XCircle size={14} />
                        <span className="text-xs">Not verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Zap size={14} />
                      <span>Gemini AI</span>
                    </div>
                    {bot.geminiVerified ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle2 size={14} />
                        <span className="text-xs">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400">
                        <XCircle size={14} />
                        <span className="text-xs">Not verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick action bar - appears on hover */}
                <div className={`mt-4 pt-4 border-t border-gray-800/50 transition-all duration-300 ${
                  hoveredBot === bot.id ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
                }`}>
                  <button 
                    onClick={() => onShowEmbed(bot)}
                    className={`w-full py-2 rounded-lg bg-gradient-to-r from-accent-${bot.color}/20 to-accent-${bot.color}/10 border border-accent-${bot.color}/30 text-sm font-semibold hover:from-accent-${bot.color}/30 hover:to-accent-${bot.color}/20 transition-all duration-200`}
                  >
                    <Code size={14} className="inline mr-2" />
                    Get Embed Code
                  </button>
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
  const { getIdToken } = useAuth();
  const [analyticsData, setAnalyticsData] = React.useState(null);
  const [dailyData, setDailyData] = React.useState([]);
  const [topBots, setTopBots] = React.useState([]);
  const [timeRange, setTimeRange] = React.useState(7);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(true);

  useEffect(() => {
    if (!loading && bots.length > 0) {
      loadAnalytics();
    }
  }, [loading, bots, timeRange]);

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const token = await getIdToken();
      if (token) {
        setAuthToken(token);
        const [overview, daily, top] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getDailyAnalytics(timeRange),
          analyticsService.getTopBots(5, 'queries'),
        ]);
        
        setAnalyticsData(overview.data);
        setDailyData(daily.data || []);
        setTopBots(top.data || []);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (loading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <Loader2 size={48} className="animate-spin text-accent-blue" />
          <div className="absolute inset-0 blur-xl bg-accent-blue/20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 rounded-3xl p-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-pink/5"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-pink/20 flex items-center justify-center backdrop-blur-sm">
            <BarChart3 size={48} className="text-accent-blue" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No Analytics Data</h3>
          <p className="text-gray-400">Create bots to see analytics and insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Analytics
          </h2>
          <p className="text-gray-400 mt-2">Track performance and usage metrics</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === days
                  ? 'bg-accent-blue text-black'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-accent-blue/10 to-accent-blue/5 border border-accent-blue/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <MessageSquare className="text-accent-blue" size={24} />
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <div className="text-3xl font-bold mb-1">{analyticsData?.totalQueries?.toLocaleString() || 0}</div>
          <div className="text-sm text-gray-400">Total Queries</div>
        </div>

        <div className="bg-gradient-to-br from-accent-pink/10 to-accent-pink/5 border border-accent-pink/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Zap className="text-accent-pink" size={24} />
            <Database size={16} className="text-accent-pink" />
          </div>
          <div className="text-3xl font-bold mb-1">{(analyticsData?.totalTokens || 0).toLocaleString()}</div>
          <div className="text-sm text-gray-400">Tokens Used</div>
        </div>

        <div className="bg-gradient-to-br from-accent-yellow/10 to-accent-yellow/5 border border-accent-yellow/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="text-accent-yellow" size={24} />
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <div className="text-3xl font-bold mb-1">${(analyticsData?.totalCost || 0).toFixed(4)}</div>
          <div className="text-sm text-gray-400">Estimated Cost</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Clock className="text-green-400" size={24} />
            <Activity size={16} className="text-green-400" />
          </div>
          <div className="text-3xl font-bold mb-1">{analyticsData?.avgResponseTime || 0}ms</div>
          <div className="text-sm text-gray-400">Avg Response</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Queries Chart */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-accent-blue" />
            Daily Queries
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                tick={{ fill: '#999' }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#666" tick={{ fill: '#999' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="queries" fill="#B7BEFE" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Token Usage Chart */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap size={20} className="text-accent-pink" />
            Token Usage
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF95DD" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FF95DD" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                tick={{ fill: '#999' }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#666" tick={{ fill: '#999' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="tokens" stroke="#FF95DD" fillOpacity={1} fill="url(#tokenGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Bots */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Target size={24} className="text-accent-yellow" />
          Top Performing Bots
        </h3>
        <div className="space-y-4">
          {topBots.map((bot, index) => (
            <div key={bot.id} className="flex items-center gap-4 p-4 bg-black/30 rounded-xl border border-gray-800/50 hover:border-gray-700 transition-all">
              <div className="text-2xl font-bold text-gray-600 w-8">#{index + 1}</div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-accent-${bot.color} to-accent-${bot.color}/60 flex items-center justify-center shadow-lg`}>
                <Bot size={24} className="text-black" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{bot.name}</div>
                <div className="text-sm text-gray-400">{bot.type}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold">{bot.totalQueries.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Queries</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{(bot.totalTokens || 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Tokens</div>
                </div>
                <div>
                  <div className="text-lg font-bold">${(bot.estimatedCost || 0).toFixed(4)}</div>
                  <div className="text-xs text-gray-500">Cost</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
