import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsService, setAuthToken } from '../services/api';
import {
  BarChart3,
  Bot,
  MessageSquare,
  Target,
  Clock,
  DollarSign,
  Loader2,
  Activity
} from 'lucide-react';

// Analytics View Component
const AnalyticsView = ({ bots, loading }) => {
  const [selectedMetric, setSelectedMetric] = useState('queries');
  const [analytics, setAnalytics] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [topBots, setTopBots] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const { getIdToken } = useAuth();

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedMetric]);

  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);
      const token = await getIdToken();
      if (token) {
        setAuthToken(token);
        const [overviewData, dailyData, topBotsData] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getDailyAnalytics(30),
          analyticsService.getTopBots(5, selectedMetric)
        ]);
        setAnalytics(overviewData.data);
        setDailyStats(dailyData.data || []);
        setTopBots(topBotsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (loading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-accent-blue" />
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-12 text-center">
        <BarChart3 size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Analytics Data</h3>
        <p className="text-gray-500">Create bots to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-gray-500 mt-1">Comprehensive insights into your bot performance</p>
      </div>

      {/* Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-accent-blue/20 to-accent-blue/10 border border-accent-blue/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <MessageSquare size={24} className="text-accent-blue" />
              <div className="px-2 py-1 bg-accent-blue/20 rounded-lg text-xs font-bold text-accent-blue">
                +{analytics.totalQueries || 0}
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{(analytics.totalQueries || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Queries</p>
          </div>

          <div className="bg-gradient-to-br from-accent-pink/20 to-accent-pink/10 border border-accent-pink/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <Target size={24} className="text-accent-pink" />
              <div className="px-2 py-1 bg-accent-pink/20 rounded-lg text-xs font-bold text-accent-pink">
                {analytics.avgAccuracy || 0}%
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{analytics.avgAccuracy || 0}%</p>
            <p className="text-sm text-gray-400">Avg Accuracy</p>
          </div>

          <div className="bg-gradient-to-br from-accent-yellow/20 to-accent-yellow/10 border border-accent-yellow/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <Clock size={24} className="text-accent-yellow" />
              <div className="px-2 py-1 bg-accent-yellow/20 rounded-lg text-xs font-bold text-accent-yellow">
                AVG
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{analytics.avgResponseTime || 0}ms</p>
            <p className="text-sm text-gray-400">Response Time</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <DollarSign size={24} className="text-green-400" />
              <div className="px-2 py-1 bg-green-500/20 rounded-lg text-xs font-bold text-green-400">
                COST
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">${(analytics.totalCost || 0).toFixed(2)}</p>
            <p className="text-sm text-gray-400">Total Cost</p>
          </div>
        </div>
      )}

      {/* Activity Chart - 30 Days */}
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold">Activity Trend</h3>
            <p className="text-sm text-gray-500">Last 30 days performance</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMetric('queries')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === 'queries'
                  ? 'bg-accent-blue text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Queries
            </button>
            <button
              onClick={() => setSelectedMetric('tokens')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === 'tokens'
                  ? 'bg-accent-pink text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Tokens
            </button>
          </div>
        </div>
        <AdvancedActivityChart dailyStats={dailyStats} metric={selectedMetric} />
      </div>

      {/* Top Performing Bots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Top Performing Bots</h3>
          {topBots.length > 0 ? (
            <div className="space-y-3">
              {topBots.map((bot, index) => (
                <div
                  key={bot._id}
                  className="bg-gray-900/50 rounded-xl p-4 hover:bg-gray-900 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-600 group-hover:text-accent-blue transition-colors">
                      #{index + 1}
                    </div>
                    <div className={`w-10 h-10 rounded-lg bg-accent-${bot.color}/20 flex items-center justify-center flex-shrink-0`}>
                      <Bot size={20} className={`text-accent-${bot.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{bot.name}</p>
                      <p className="text-xs text-gray-500">{bot.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-accent-blue">
                        {selectedMetric === 'queries' ? bot.totalQueries : bot.totalTokensUsed?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedMetric === 'queries' ? 'queries' : 'tokens'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-black/30 rounded-lg p-2">
                      <p className="text-gray-500">Accuracy</p>
                      <p className="font-bold text-accent-pink">{bot.accuracy || 0}%</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2">
                      <p className="text-gray-500">Response</p>
                      <p className="font-bold text-accent-yellow">{bot.avgResponseTime || 0}ms</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2">
                      <p className="text-gray-500">Cost</p>
                      <p className="font-bold text-green-400">${(bot.estimatedCost || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
              <p>No performance data yet</p>
            </div>
          )}
        </div>

        {/* Bot Performance Breakdown */}
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">All Bots Overview</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="bg-gray-900/30 rounded-lg p-3 hover:bg-gray-900/50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-accent-${bot.color}/20 flex items-center justify-center`}>
                      <Bot size={16} className={`text-accent-${bot.color}`} />
                    </div>
                    <span className="font-semibold text-sm">{bot.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    bot.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {bot.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Queries</p>
                    <p className="font-bold">{bot.totalQueries || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tokens</p>
                    <p className="font-bold">{(bot.totalTokensUsed || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Accuracy</p>
                    <p className="font-bold">{bot.accuracy || 0}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cost</p>
                    <p className="font-bold">${(bot.estimatedCost || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced Activity Chart Component for Analytics
const AdvancedActivityChart = ({ dailyStats, metric }) => {
  if (!dailyStats || dailyStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900/30 rounded-xl">
        <div className="text-center">
          <Activity size={48} className="mx-auto mb-3 text-gray-600" />
          <p className="text-gray-500">No activity data yet</p>
        </div>
      </div>
    );
  }

  const data = dailyStats.map(stat => ({
    value: metric === 'queries' ? (stat.queries || 0) : (stat.tokens || 0),
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: stat.date
  }));

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length;

  return (
    <div className="space-y-4">
      <div className="h-64 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>{maxValue.toLocaleString()}</span>
          <span>{Math.round(maxValue / 2).toLocaleString()}</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-12 h-full flex items-end gap-1">
          {data.map((item, index) => {
            const heightPercentage = (item.value / maxValue) * 100;
            const isAboveAvg = item.value > avgValue;
            
            return (
              <div key={index} className="flex-1 flex flex-col gap-1 group relative">
                <div className="relative h-56">
                  <div
                    className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-300 group-hover:opacity-100 ${
                      isAboveAvg
                        ? 'bg-gradient-to-t from-accent-blue to-accent-blue/50 opacity-80'
                        : 'bg-gradient-to-t from-gray-700 to-gray-600 opacity-60'
                    }`}
                    style={{ height: `${heightPercentage}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      <div className="text-accent-blue">{item.value.toLocaleString()}</div>
                      <div className="text-gray-400 text-[10px]">{item.date}</div>
                    </div>
                  </div>
                </div>
                {index % 3 === 0 && (
                  <span className="text-[10px] text-gray-500 text-center">{item.date}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
        <div className="text-center">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-bold text-accent-blue">
            {data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Average</p>
          <p className="text-xl font-bold text-accent-pink">
            {Math.round(avgValue).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Peak</p>
          <p className="text-xl font-bold text-accent-yellow">
            {maxValue.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
