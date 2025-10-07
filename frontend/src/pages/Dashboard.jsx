import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { botsService, analyticsService, setAuthToken } from '../services/api';
import BotConfigModal from '../components/BotConfigModal';
import EditBotModal from '../components/EditBotModal';
import EmbedCodeModal from '../components/EmbedCodeModal';
import KnowledgeBaseModal from '../components/KnowledgeBaseModal';
import AnalyticsView from '../components/AnalyticsView';
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
  Target
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

  // Fetch bots and analytics on component mount
  useEffect(() => {
    fetchBots();
    fetchAnalytics();
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

  const fetchAnalytics = async () => {
    try {
      const token = await getIdToken();
      if (token) {
        setAuthToken(token);
        const [overviewData, dailyData] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getDailyAnalytics(7)
        ]);
        console.log('📊 Fetched analytics:', { overviewData, dailyData });
        setAnalytics(overviewData.data);
        setDailyStats(dailyData.data || []);
        console.log('📊 Set dailyStats:', dailyData.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleCreateBot = async (botData) => {
    try {
      console.log('🤖 Creating bot with data:', botData);
      const token = await getIdToken();
      console.log('🔑 Got ID token:', token ? 'Yes' : 'No');
      
      if (!token) {
        throw new Error('Authentication required. Please sign in again.');
      }
      
      setAuthToken(token);
      console.log('📡 Sending request to create bot...');
      
      const response = await botsService.createBot(botData);
      console.log('✅ Bot created successfully:', response);
      
      // Show verification status
      if (response.verificationStatus) {
        const { pinecone, gemini, errors } = response.verificationStatus;
        console.log('🔍 Verification Status:');
        console.log('   Pinecone:', pinecone);
        console.log('   Gemini:', gemini);
        if (errors && errors.length > 0) {
          console.log('⚠️  Verification Errors:', errors);
        }
        
        // Show alert if any verification failed
        if (pinecone === 'failed' || gemini === 'failed') {
          const failedServices = [];
          if (pinecone === 'failed') failedServices.push('Pinecone');
          if (gemini === 'failed') failedServices.push('Gemini');
          
          alert(`⚠️ Bot created but ${failedServices.join(' and ')} verification failed.\n\n` +
                `The bot is marked as inactive. Please check your API keys.\n\n` +
                (errors ? `Errors:\n${errors.join('\n')}` : ''));
        } else {
          alert('✅ Bot created successfully!\nAll API connections verified.');
        }
      }
      
      await fetchBots();
      console.log('🔄 Bots list refreshed');
    } catch (error) {
      console.error('❌ Error creating bot:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Re-throw the error so BotConfigModal can catch it and show the error message
      throw error;
    }
  };

  const handleUpdateBot = async (botId, botData) => {
    try {
      console.log('📝 Updating bot:', botId, 'with data:', botData);
      const token = await getIdToken();
      
      if (!token) {
        throw new Error('Authentication required. Please sign in again.');
      }
      
      setAuthToken(token);
      const response = await botsService.updateBot(botId, botData);
      console.log('✅ Bot updated successfully:', response);
      
      alert('✅ Bot updated successfully!\n\nYour changes have been saved.');
      
      await fetchBots();
      console.log('🔄 Bots list refreshed');
    } catch (error) {
      console.error('❌ Error updating bot:', error);
      throw error;
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
              analytics={analytics}
              dailyStats={dailyStats}
            />
          )}
          
          {activePage === 'My Bots' && (
            <MyBotsView 
              bots={bots} 
              setShowBotModal={setShowBotModal}
              setSelectedBot={setSelectedBot}
              setShowKnowledgeModal={setShowKnowledgeModal}
              onEdit={(bot) => {
                setSelectedBot(bot);
                setShowEditModal(true);
              }}
              onDelete={handleDeleteBot}
              onShowEmbed={(bot) => {
                setSelectedBot(bot);
                setShowEmbedModal(true);
              }}
              loading={loading}
            />
          )}
          
          {activePage === 'API Keys' && (
            <ApiKeysView 
              bots={bots} 
              loading={loading}
              fetchBots={fetchBots}
              onEdit={(bot) => {
                setSelectedBot(bot);
                setShowEditModal(true);
              }}
            />
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

      {/* Edit Bot Modal */}
      {showEditModal && selectedBot && (
        <EditBotModal 
          bot={selectedBot}
          setShowModal={setShowEditModal}
          onSave={handleUpdateBot}
        />
      )}

      {/* Knowledge Base Modal */}
      {showKnowledgeModal && selectedBot && (
        <KnowledgeBaseModal
          bot={selectedBot}
          setShowModal={setShowKnowledgeModal}
        />
      )}

      {/* Embed Code Modal */}
      {showEmbedModal && selectedBot && (
        <EmbedCodeModal 
          bot={selectedBot}
          setShowModal={setShowEmbedModal}
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
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
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
const DashboardView = ({ stats, bots, setShowBotModal, loading, analytics, dailyStats }) => {
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
          <ActivityChart dailyStats={dailyStats} />
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
const ActivityChart = ({ dailyStats }) => {
  console.log('📊 ActivityChart dailyStats:', dailyStats);
  
  // Process daily stats for the chart
  const processedData = dailyStats && dailyStats.length > 0 
    ? dailyStats.slice(-7).map(stat => ({
        value: stat.queries || 0,
        day: new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' }),
        date: stat.date
      }))
    : [];

  // Check if we have any actual data
  const hasData = processedData.length > 0 && processedData.some(d => d.value > 0);
  const maxValue = hasData ? Math.max(...processedData.map(d => d.value)) : 1;

  console.log('📊 ActivityChart processed:', { processedData, hasData, maxValue });

  return (
    <div className="h-56">
      {!hasData ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Activity size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm opacity-70">No activity data yet</p>
            <p className="text-xs opacity-50 mt-1">Start chatting with your bots to see activity</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-end justify-between h-48 gap-3">
            {processedData.map((item, index) => {
              const heightPercentage = (item.value / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full" style={{ height: '192px' }}>
                    <div 
                      className="absolute bottom-0 w-full bg-black/30 rounded-t-xl transition-all duration-300 group-hover:bg-black/40 overflow-hidden" 
                      style={{ height: `${heightPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      {/* Value tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.value} {item.value === 1 ? 'query' : 'queries'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold">{item.day}</span>
                </div>
              );
            })}
          </div>
          {/* Stats summary */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="opacity-70">
              Total: <span className="font-bold">{processedData.reduce((sum, item) => sum + item.value, 0)}</span> queries
            </span>
            <span className="opacity-70">
              Peak: <span className="font-bold">{maxValue}</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
};

// Bot Card Component
const BotCard = ({ bot }) => {
  const colorClasses = {
    pink: {
      gradient: 'from-pink-500/10 via-purple-500/10 to-pink-500/5',
      border: 'border-pink-500/30',
      icon: 'from-pink-500 to-purple-500',
      glow: 'shadow-pink-500/20'
    },
    yellow: {
      gradient: 'from-yellow-500/10 via-orange-500/10 to-yellow-500/5',
      border: 'border-yellow-500/30',
      icon: 'from-yellow-500 to-orange-500',
      glow: 'shadow-yellow-500/20'
    },
    blue: {
      gradient: 'from-blue-500/10 via-cyan-500/10 to-blue-500/5',
      border: 'border-blue-500/30',
      icon: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/20'
    }
  };

  const colors = colorClasses[bot.color] || colorClasses.blue;

  return (
    <div className={`group relative bg-gradient-to-br ${colors.gradient} border ${colors.border} rounded-xl p-5 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-lg ${colors.glow}`}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.icon} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <Bot size={20} className="text-white" />
          </div>
          <div className="flex items-center gap-2">
            {bot.pineconeVerified && bot.geminiVerified && (
              <div className="flex gap-1">
                <CheckCircle2 size={14} className="text-green-400" />
              </div>
            )}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              bot.status === 'active' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {bot.status === 'active' ? '● Active' : '○ Inactive'}
            </span>
          </div>
        </div>
        
        <h4 className="font-bold mb-1 text-white text-base group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all">
          {bot.name}
        </h4>
        <p className="text-xs text-gray-400 mb-3">{bot.type}</p>
        
        <div className="flex items-center justify-between text-xs bg-black/20 rounded-lg p-2 border border-white/5">
          <div className="flex items-center gap-1">
            <MessageSquare size={12} className="text-gray-500" />
            <span className="text-gray-400">{bot.totalQueries || 0} queries</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity size={12} className="text-gray-500" />
            <span className="text-gray-400">{bot.accuracy || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// My Bots View
const MyBotsView = ({ bots, setShowBotModal, setSelectedBot, setShowKnowledgeModal, onEdit, onDelete, onShowEmbed, loading }) => {
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
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800 rounded-3xl p-16 text-center relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-accent-pink/5 to-accent-yellow/5 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-pink/20 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Bot size={48} className="text-accent-blue" />
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              No Bots Yet
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your first AI-powered bot to start engaging with your users through intelligent conversations
            </p>
            <button
              onClick={() => setShowBotModal(true)}
              className="bg-gradient-to-r from-accent-blue to-accent-pink text-white font-semibold px-10 py-4 rounded-xl hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg shadow-accent-blue/20"
            >
              <div className="flex items-center gap-2">
                <Plus size={20} />
                Create Your First Bot
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => {
            const colorClasses = {
              pink: {
                gradient: 'from-pink-500/10 via-purple-500/10 to-pink-500/5',
                border: 'border-pink-500/30',
                icon: 'from-pink-500 to-purple-500',
                glow: 'shadow-pink-500/20'
              },
              yellow: {
                gradient: 'from-yellow-500/10 via-orange-500/10 to-yellow-500/5',
                border: 'border-yellow-500/30',
                icon: 'from-yellow-500 to-orange-500',
                glow: 'shadow-yellow-500/20'
              },
              blue: {
                gradient: 'from-blue-500/10 via-cyan-500/10 to-blue-500/5',
                border: 'border-blue-500/30',
                icon: 'from-blue-500 to-cyan-500',
                glow: 'shadow-blue-500/20'
              }
            };
            
            const colors = colorClasses[bot.color] || colorClasses.blue;
            
            return (
              <div 
                key={bot.id} 
                className={`group relative bg-gradient-to-br ${colors.gradient} border ${colors.border} rounded-2xl p-6 hover:border-opacity-60 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${colors.glow} cursor-pointer overflow-hidden`}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.icon} flex items-center justify-center shadow-lg ${colors.glow} group-hover:scale-110 transition-transform duration-300`}>
                      <Bot size={28} className="text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBot(bot);
                          setShowKnowledgeModal(true);
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:text-accent-pink hover:bg-accent-pink/10 transition-all duration-200"
                        title="Knowledge Base"
                      >
                        <Database size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowEmbed(bot);
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:text-accent-blue hover:bg-white/5 transition-all duration-200"
                        title="Get embed code"
                      >
                        <Code size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(bot);
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:text-accent-yellow hover:bg-accent-yellow/10 transition-all duration-200"
                        title="Edit bot"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(bot.id);
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        title="Delete bot"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                    {bot.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-6 flex items-center gap-2">
                    <span className="px-2 py-1 rounded-lg bg-white/5 text-xs font-medium">
                      {bot.type}
                    </span>
                  </p>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Status</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          bot.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {bot.status === 'active' ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Queries</span>
                        <span className="text-sm font-bold text-white">{bot.totalQueries || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Verification Status */}
                  <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Database size={14} className="text-gray-500" />
                      {bot.pineconeVerified ? (
                        <CheckCircle2 size={14} className="text-green-400" />
                      ) : (
                        <XCircle size={14} className="text-red-400" />
                      )}
                      <span className="text-gray-400">Pinecone</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Zap size={14} className="text-gray-500" />
                      {bot.geminiVerified ? (
                        <CheckCircle2 size={14} className="text-green-400" />
                      ) : (
                        <XCircle size={14} className="text-red-400" />
                      )}
                      <span className="text-gray-400">Gemini</span>
                    </div>
                    <div className="ml-auto text-xs text-gray-500">
                      {bot.accuracy || 0}% accuracy
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// API Keys View
const ApiKeysView = ({ bots, loading, onEdit, fetchBots }) => {
  const { getIdToken } = useAuth();
  const [testingBotId, setTestingBotId] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [expandedBot, setExpandedBot] = useState(null);

  const handleTestConnection = async (botId) => {
    try {
      setTestingBotId(botId);
      console.log('🔍 Testing bot connection:', botId);
      
      const token = await getIdToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      setAuthToken(token);
      const response = await botsService.testBot(botId);
      console.log('✅ Test results:', response);
      
      setTestResults(prev => ({
        ...prev,
        [botId]: response
      }));
      
      // Reload bots to get updated verification status (without page reload)
      await fetchBots();
    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResults(prev => ({
        ...prev,
        [botId]: {
          error: error.response?.data?.error || error.message || 'Test failed'
        }
      }));
    } finally {
      setTestingBotId(null);
    }
  };

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
          <p className="text-gray-500 mt-1">Monitor and test your bot API connections</p>
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
            <p className="text-sm text-gray-400">Each bot has its own Pinecone and Gemini API keys. This ensures better security, separate billing, and independent knowledge bases. Test connections to verify your API keys are working correctly.</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bots.map((bot) => {
            const isExpanded = expandedBot === bot.id;
            const testResult = testResults[bot.id];
            const isTesting = testingBotId === bot.id;
            
            return (
              <div key={bot.id} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-accent-${bot.color} to-accent-${bot.color}/50 flex items-center justify-center shadow-lg`}>
                      <Bot size={24} className="text-black" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{bot.name}</h3>
                      <p className="text-xs text-gray-400">{bot.type} Bot</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(bot)}
                      className="flex items-center gap-2 px-4 py-2 bg-accent-yellow/10 hover:bg-accent-yellow/20 text-accent-yellow rounded-lg transition-all duration-200 hover:scale-105"
                      title="Edit API Keys"
                    >
                      <Edit size={16} />
                      <span className="text-sm">Edit Keys</span>
                    </button>
                    <button
                      onClick={() => handleTestConnection(bot.id)}
                      disabled={isTesting}
                      className="flex items-center gap-2 px-4 py-2 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span className="text-sm">Testing...</span>
                        </>
                      ) : (
                        <>
                          <Activity size={16} />
                          <span className="text-sm">Test Connection</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* API Status Grid */}
                <div className="space-y-3">
                  {/* Pinecone Status */}
                  <div className={`p-4 rounded-xl border transition-all duration-300 ${
                    bot.pineconeVerified 
                      ? 'bg-green-500/5 border-green-500/30' 
                      : 'bg-red-500/5 border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database size={18} className={bot.pineconeVerified ? 'text-green-400' : 'text-red-400'} />
                        <span className="text-sm font-semibold">Pinecone</span>
                      </div>
                      {bot.pineconeVerified ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={14} />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
                          <XCircle size={14} />
                          Failed
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-gray-400">
                      <p><span className="text-gray-500">Index:</span> <span className="font-mono text-gray-300">{bot.pineconeIndexName}</span></p>
                      <p><span className="text-gray-500">Environment:</span> <span className="font-mono text-gray-300">{bot.pineconeEnvironment}</span></p>
                      {!bot.pineconeVerified && (
                        <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <p className="text-red-400 font-medium mb-1">⚠️ Connection Failed</p>
                          <p className="text-xs text-red-300/80">Common issues:</p>
                          <ul className="text-xs text-red-300/80 mt-1 space-y-0.5 list-disc list-inside">
                            <li>Invalid API key</li>
                            <li>Wrong index name or environment</li>
                            <li>Index not deployed yet</li>
                            <li>API key doesn't have access</li>
                          </ul>
                        </div>
                      )}
                      {testResult?.testResults?.pinecone && (
                        <div className={`mt-3 p-3 rounded-lg border ${
                          testResult.testResults.pinecone.verified
                            ? 'bg-green-500/10 border-green-500/20'
                            : 'bg-red-500/10 border-red-500/20'
                        }`}>
                          <p className={`text-xs ${
                            testResult.testResults.pinecone.verified
                              ? 'text-green-300'
                              : 'text-red-300'
                          }`}>
                            {testResult.testResults.pinecone.message}
                          </p>
                          {testResult.testResults.pinecone.dimension && (
                            <p className="text-xs text-gray-400 mt-1">
                              Dimension: {testResult.testResults.pinecone.dimension}, 
                              Vectors: {testResult.testResults.pinecone.totalVectorCount || 0}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gemini Status */}
                  <div className={`p-4 rounded-xl border transition-all duration-300 ${
                    bot.geminiVerified 
                      ? 'bg-green-500/5 border-green-500/30' 
                      : 'bg-red-500/5 border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap size={18} className={bot.geminiVerified ? 'text-green-400' : 'text-red-400'} />
                        <span className="text-sm font-semibold">Gemini AI</span>
                      </div>
                      {bot.geminiVerified ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={14} />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
                          <XCircle size={14} />
                          Failed
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-gray-400">
                      <p><span className="text-gray-500">Model:</span> <span className="font-mono text-gray-300">gemini-embedding-001</span></p>
                      {!bot.geminiVerified && (
                        <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <p className="text-red-400 font-medium mb-1">⚠️ Connection Failed</p>
                          <p className="text-xs text-red-300/80">Common issues:</p>
                          <ul className="text-xs text-red-300/80 mt-1 space-y-0.5 list-disc list-inside">
                            <li>Invalid API key format</li>
                            <li>API key not enabled</li>
                            <li>Gemini API not activated</li>
                            <li>Rate limit exceeded</li>
                          </ul>
                        </div>
                      )}
                      {testResult?.testResults?.gemini && (
                        <div className={`mt-3 p-3 rounded-lg border ${
                          testResult.testResults.gemini.verified
                            ? 'bg-green-500/10 border-green-500/20'
                            : 'bg-red-500/10 border-red-500/20'
                        }`}>
                          <p className={`text-xs ${
                            testResult.testResults.gemini.verified
                              ? 'text-green-300'
                              : 'text-red-300'
                          }`}>
                            {testResult.testResults.gemini.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Last Verified */}
                {bot.lastVerified && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500">
                      Last verified: {new Date(bot.lastVerified).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Test Error */}
                {testResult?.error && (
                  <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-xs text-red-400">
                      ❌ Test Error: {testResult.error}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
