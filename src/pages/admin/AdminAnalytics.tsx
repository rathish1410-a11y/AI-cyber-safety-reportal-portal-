import { useEffect, useState } from 'react';
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

const COLORS = ['#14b8a6', '#f97316', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export default function AdminAnalytics() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    fetchIncidents();
  }, [timeRange]);

  async function fetchIncidents() {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

    const { data } = await supabase
      .from('incidents')
      .select('*')
      .gte('created_at', daysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (data) setIncidents(data);
    setLoading(false);
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
        <div className="text-slate-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Comprehensive analysis of reported incidents</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '7' | '30' | '90')}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-1">Total Incidents</p>
          <p className="text-3xl font-bold text-white">{incidents.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-1">High Risk (70+)</p>
          <p className="text-3xl font-bold text-red-400">{highRiskIncidents}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-1">Avg. Risk Score</p>
          <p className="text-3xl font-bold text-teal-400">{avgRiskScore}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-1">Resolution Rate</p>
          <p className="text-3xl font-bold text-green-400">
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
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Incident Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="incidents"
                stroke="#14b8a6"
                fillOpacity={1}
                fill="url(#colorIncidents)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* By Category */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Incidents by Category</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
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
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No data available
            </div>
          )}
        </div>

        {/* Severity Distribution */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Severity Distribution</h3>
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
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No data available
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3>
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
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No data available
            </div>
          )}
        </div>

        {/* Risk Score Distribution */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">AI Risk Score Distribution</h3>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
