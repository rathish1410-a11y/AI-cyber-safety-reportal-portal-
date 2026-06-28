import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Incident } from '../../types/database';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#38bdf8', '#0ea5e9', '#60a5fa', '#ef4444', '#a78bfa', '#34d399', '#f59e0b'];

export default function AdminAnalytics() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIncidents();
  }, [timeRange]);

  async function fetchIncidents() {
    setError(null);
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
    try {
      const { data, error: fetchError } = await supabase
        .from('incidents')
        .select('*')
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: true });
        
      if (fetchError) throw fetchError;
      
      setIncidents(data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }

  // Process data for charts
  const typeData = Object.entries(
    incidents.reduce((acc, i) => {
      acc[i.incident_type] = (acc[i.incident_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name: name.replace('_', ' '), value }))
    .sort((a, b) => b.value - a.value);

  const severityData = Object.entries(
    incidents.reduce((acc, i) => {
      acc[i.severity] = (acc[i.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const statusData = Object.entries(
    incidents.reduce((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name: name.replace('_', ' ').charAt(0).toUpperCase() + name.replace('_', ' ').slice(1),
    value,
  }));

  // Time series data
  const getDateRange = () => {
    const days = parseInt(timeRange);
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toISOString().split('T')[0];
    });
  };

  const timeSeriesData = getDateRange().map((date) => {
    const count = incidents.filter((i) => i.created_at.split('T')[0] === date).length;
    const resolved = incidents.filter(
      (i) => i.status === 'resolved' && i.updated_at?.split('T')[0] === date
    ).length;

    const displayDate = new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return { date: displayDate, incidents: count, resolved };
  });

  // High-risk incidents
  const highRiskIncidents = incidents.filter((i) => (i.ai_risk_score || 0) >= 70).length;

  // Average risk score
  const avgRiskScore = incidents.length
    ? Math.round(
        incidents.reduce((sum, i) => sum + (i.ai_risk_score || 0), 0) / incidents.length
      )
    : 0;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="terminal-text text-cyber-400 text-lg">
          <span className="animate-pulse">⟨</span> Initializing threat analytics<span className="terminal-cursor">_</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 relative">
      {/* Background Effects */}
      <div className="cyber-grid-bg" />
      <div className="scanline-overlay pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white font-display tracking-wider mb-2">
              THREAT <span className="text-cyber-400">ANALYTICS</span>
            </h1>
            <p className="terminal-text text-sm text-slate-400">
              &gt; Comprehensive analysis of reported incidents<span className="terminal-cursor">_</span>
            </p>
          </div>
          
          <div className="flex bg-slate-900/50 p-1 rounded-lg border border-[rgba(56,189,248,0.2)]">
            {(['7', '30', '90'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors font-mono ${
                  timeRange === range
                    ? 'bg-cyber-500/20 text-cyber-400 border border-cyber-500/50 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {range}d
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 font-mono text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="cyber-card glow-cyan rounded-xl p-6">
            <p className="text-slate-400 text-sm font-mono mb-1">// TOTAL INCIDENTS</p>
            <p className="text-3xl font-bold text-white font-mono">{incidents.length}</p>
          </div>
          <div className="cyber-card glow-red rounded-xl p-6">
            <p className="text-slate-400 text-sm font-mono mb-1">// HIGH RISK (70+)</p>
            <p className="text-3xl font-bold text-danger-400 font-mono">{highRiskIncidents}</p>
          </div>
          <div className="cyber-card glow-green rounded-xl p-6">
            <p className="text-slate-400 text-sm font-mono mb-1">// AVG. RISK SCORE</p>
            <p className="text-3xl font-bold text-matrix-400 font-mono">{avgRiskScore}</p>
          </div>
          <div className="cyber-card glow-amber rounded-xl p-6">
            <p className="text-slate-400 text-sm font-mono mb-1">// RESOLUTION RATE</p>
            <p className="text-3xl font-bold text-[#ffaa00] font-mono">
              {incidents.length
                ? Math.round((incidents.filter((i) => i.status === 'resolved').length / incidents.length) * 100)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Main Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Incidents Over Time */}
          <div className="cyber-card cyber-frame rounded-xl p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-1">Incident Trend</h3>
            <p className="text-xs text-cyber-400 font-mono mb-4">TEMPORAL_ANALYSIS::TIMELINE</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--cyber-blue)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--cyber-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
                <XAxis dataKey="date" stroke="rgba(56,189,248,0.2)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(56,189,248,0.2)" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--dark-card)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="var(--cyber-blue)"
                  fillOpacity={1}
                  fill="url(#colorIncidents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* By Category */}
          <div className="cyber-card cyber-frame rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-1">Incidents by Category</h3>
            <p className="text-xs text-cyber-400 font-mono mb-4">CLASSIFICATION::TYPE_BREAKDOWN</p>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
                  <XAxis type="number" stroke="rgba(56,189,248,0.2)" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    stroke="rgba(56,189,248,0.2)"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--dark-card)',
                      border: '1px solid rgba(56,189,248,0.2)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {typeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500 font-mono">
                No data available
              </div>
            )}
          </div>

          {/* Severity Distribution */}
          <div className="cyber-card cyber-frame rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-1">Severity Distribution</h3>
            <p className="text-xs text-cyber-400 font-mono mb-4">THREAT_LEVEL::SEVERITY_MAP</p>
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {severityData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--dark-card)',
                      border: '1px solid rgba(56,189,248,0.2)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500 font-mono">
                No data available
              </div>
            )}
          </div>

          {/* Status Distribution */}
          <div className="cyber-card cyber-frame rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-1">Status Distribution</h3>
            <p className="text-xs text-cyber-400 font-mono mb-4">OPERATIONS::STATUS_OVERVIEW</p>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--dark-card)',
                      border: '1px solid rgba(56,189,248,0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500 font-mono">
                No data available
              </div>
            )}
          </div>

          {/* Risk Score Distribution */}
          <div className="cyber-card cyber-frame rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-1">AI Risk Score Distribution</h3>
            <p className="text-xs text-cyber-400 font-mono mb-4">AI_ENGINE::RISK_HISTOGRAM</p>
            {incidents.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { range: '0-25', count: incidents.filter((i) => (i.ai_risk_score || 0) < 25).length },
                    { range: '25-50', count: incidents.filter((i) => (i.ai_risk_score || 0) >= 25 && (i.ai_risk_score || 0) < 50).length },
                    { range: '50-75', count: incidents.filter((i) => (i.ai_risk_score || 0) >= 50 && (i.ai_risk_score || 0) < 75).length },
                    { range: '75-100', count: incidents.filter((i) => (i.ai_risk_score || 0) >= 75).length },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
                  <XAxis dataKey="range" stroke="rgba(56,189,248,0.2)" />
                  <YAxis stroke="rgba(56,189,248,0.2)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--dark-card)',
                      border: '1px solid rgba(56,189,248,0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500 font-mono">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
