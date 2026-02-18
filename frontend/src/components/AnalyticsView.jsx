import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsService, setAuthToken } from '../services/api';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
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
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 border-4 border-black border-t-nb-yellow animate-spin" />
        <p className="text-sm font-bold text-nb-muted">Loading analytics...</p>
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <div className="bg-white border-2 border-black shadow-nb p-12 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 border-2 border-black bg-nb-yellow mx-auto mb-4 flex items-center justify-center"><BarChart3 size={32} /></div>
        <h3 className="text-xl font-bold mb-2">No Analytics Data</h3>
        <p className="text-nb-muted">Create bots to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-nb-text">Analytics Dashboard</h2>
        <p className="text-nb-muted text-sm mt-0.5">Comprehensive insights into your bot performance</p>
      </div>

      {/* Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: MessageSquare, label: 'Total Queries', value: (analytics.totalQueries || 0).toLocaleString(), bg: 'bg-nb-blue' },
            { icon: Target,        label: 'Avg Accuracy',  value: `${analytics.avgAccuracy || 0}%`,              bg: 'bg-nb-pink' },
            { icon: Clock,         label: 'Response Time', value: `${analytics.avgResponseTime || 0}ms`,          bg: 'bg-nb-yellow' },
            { icon: DollarSign,    label: 'Total Cost',    value: `$${(analytics.totalCost || 0).toFixed(2)}`,    bg: 'bg-green-200' },
          ].map(({ icon: Icon, label, value, bg }) => (
            <div key={label} className={`${bg} border-2 border-black shadow-nb p-5`}>
              <div className="w-9 h-9 border-2 border-black bg-white flex items-center justify-center mb-3"><Icon size={18} /></div>
              <p className="text-3xl font-bold text-black">{value}</p>
              <p className="text-xs font-bold text-black/60 mt-1 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Activity Trend Chart */}
      <div className="bg-white border-2 border-black shadow-nb p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold">Activity Trend</h3>
            <p className="text-xs text-nb-muted">Last 30 days performance</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelectedMetric('queries')}
              className={`nb-btn px-3 py-1.5 text-xs ${selectedMetric === 'queries' ? 'bg-nb-blue border-black' : 'bg-white border-black text-nb-muted'}`}>
              Queries
            </button>
            <button onClick={() => setSelectedMetric('tokens')}
              className={`nb-btn px-3 py-1.5 text-xs ${selectedMetric === 'tokens' ? 'bg-nb-pink border-black' : 'bg-white border-black text-nb-muted'}`}>
              Tokens
            </button>
          </div>
        </div>
        <AdvancedActivityChart dailyStats={dailyStats} metric={selectedMetric} />
      </div>

      {/* Top Bots + All Bots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-black shadow-nb p-6">
          <h3 className="text-lg font-bold mb-4">Top Performing Bots</h3>
          {topBots.length > 0 ? (
            <div className="space-y-3">
              {topBots.map((bot, index) => {
                const accents = ['bg-nb-yellow','bg-nb-pink','bg-nb-blue','bg-purple-200','bg-orange-200'];
                return (
                  <div key={bot._id} className={`border-2 border-black p-4 ${accents[index % accents.length]}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-black/40">#{index + 1}</span>
                      <div className="w-9 h-9 border-2 border-black bg-white flex items-center justify-center flex-shrink-0"><Bot size={18} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-nb-text">{bot.name}</p>
                        <p className="text-xs text-black/60">{bot.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-black">{selectedMetric === 'queries' ? bot.totalQueries : bot.totalTokensUsed?.toLocaleString()}</p>
                        <p className="text-xs text-black/60">{selectedMetric === 'queries' ? 'queries' : 'tokens'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[{l:'Accuracy',v:`${bot.accuracy||0}%`},{l:'Response',v:`${bot.avgResponseTime||0}ms`},{l:'Cost',v:`$${(bot.estimatedCost||0).toFixed(2)}`}].map(({l,v}) => (
                        <div key={l} className="bg-white/70 border border-black/20 p-2 text-center">
                          <p className="text-xs text-black/50">{l}</p>
                          <p className="font-bold text-xs text-nb-text">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-nb-muted">
              <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No performance data yet</p>
            </div>
          )}
        </div>

        <div className="bg-white border-2 border-black shadow-nb p-6">
          <h3 className="text-lg font-bold mb-4">All Bots Overview</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {bots.map((bot) => (
              <div key={bot.id} className="border-2 border-black p-3 bg-nb-bg hover:bg-nb-yellow/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 border-2 border-black bg-nb-yellow flex items-center justify-center"><Bot size={14} /></div>
                    <span className="font-bold text-sm text-nb-text">{bot.name}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border-2 border-black ${bot.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {bot.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[{l:'Queries',v:bot.totalQueries||0},{l:'Tokens',v:(bot.totalTokensUsed||0).toLocaleString()},{l:'Accuracy',v:`${bot.accuracy||0}%`},{l:'Cost',v:`$${(bot.estimatedCost||0).toFixed(2)}`}].map(({l,v}) => (
                    <div key={l}>
                      <p className="text-nb-muted">{l}</p>
                      <p className="font-bold text-nb-text">{v}</p>
                    </div>
                  ))}
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
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 bg-nb-bg">
        <div className="text-center">
          <Activity size={32} className="mx-auto mb-3 text-nb-muted opacity-40" />
          <p className="text-nb-muted text-sm">No activity data yet</p>
        </div>
      </div>
    );
  }

  const data = dailyStats.map(stat => ({
    value: metric === 'queries' ? (stat.queries || 0) : (stat.tokens || 0),
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: stat.date
  }));

  const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const chartColor = metric === 'queries' ? '#3b82f6' : '#ec4899';

  return (
    <div className="space-y-4">
      <div className="h-72 w-full">
        <LineChart
          xAxis={[{
            scaleType: 'point',
            data: data.map(d => d.date),
          }]}
          series={[
            {
              data: data.map(d => d.value),
              label: metric === 'queries' ? 'Queries' : 'Tokens',
              color: chartColor,
              area: true,
              showMark: true,
            },
          ]}
          height={280}
          margin={{ top: 20, bottom: 40, left: 60, right: 20 }}
          grid={{ vertical: true, horizontal: true }}
          sx={{
            '& .MuiChartsAxis-line': { stroke: '#e5e5e5' },
            '& .MuiChartsAxis-tick': { stroke: '#e5e5e5' },
            '& .MuiChartsAxis-tickLabel': { fill: '#6B6B6B', fontSize: '11px' },
            '& .MuiChartsGrid-line': { stroke: '#e5e5e5', strokeDasharray: '3 3' },
            '& .MuiChartsLegend-label': { fill: '#0D0D0D', fontSize: '12px' },
            '& .MuiLineElement-root': { strokeWidth: 2 },
            '& .MuiAreaElement-root': { fillOpacity: 0.08 },
          }}
          slotProps={{
            legend: { hidden: false, position: { vertical: 'top', horizontal: 'right' } }
          }}
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-black">
        <div className="bg-nb-blue border-2 border-black shadow-nb-sm p-4 text-center">
          <p className="text-xs font-bold text-black/60 mb-1">TOTAL</p>
          <p className="text-2xl font-bold text-black">{totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-nb-pink border-2 border-black shadow-nb-sm p-4 text-center">
          <p className="text-xs font-bold text-black/60 mb-1">AVERAGE</p>
          <p className="text-2xl font-bold text-black">{Math.round(avgValue).toLocaleString()}</p>
        </div>
        <div className="bg-nb-yellow border-2 border-black shadow-nb-sm p-4 text-center">
          <p className="text-xs font-bold text-black/60 mb-1">PEAK</p>
          <p className="text-2xl font-bold text-black">{maxValue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
