import { useEffect, useState } from 'react';
import { FileWarning, Users, AlertTriangle, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Incident, Alert } from '../../types/database';
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
} from 'recharts';

const COLORS = ['#14b8a6', '#f97316', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [incidentsRes, alertsRes] = await Promise.all([
      supabase.from('incidents').select('*').order('created_at', { ascending: false }),
      supabase.from('alerts').select('*').eq('is_active', true).limit(5),
    ]);

    if (incidentsRes.data) setIncidents(incidentsRes.data);
    if (alertsRes.data) setAlerts(alertsRes.data);
    setLoading(false);
  }

  // Calculate stats
  const stats = [
    {
      label: 'Total Incidents',
      value: incidents.length,
      icon: FileWarning,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Pending Review',
      value: incidents.filter((i) => i.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'In Progress',
      value: incidents.filter((i) => i.status === 'in_review').length,
      icon: TrendingUp,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Resolved',
      value: incidents.filter((i) => i.status === 'resolved').length,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
  ];

  // Prepare chart data
  const typeData = Object.entries(
    incidents.reduce((acc, i) => {
      acc[i.incident_type] = ( acc[i.incident_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  const severityData = Object.entries(
    incidents.reduce((acc, i) => {
      acc[i.severity] = (acc[i.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Trend data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const trendData = last7Days.map((day) => {
    const count = incidents.filter((i) => {
      const incidentDate = new Date(i.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return incidentDate === day;
    }).length;
    return { day, incidents: count };
  });

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Overview of cyber incidents and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-slate-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Incidents by Type */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Incidents by Category</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="value" fill="#14b8a6" radius={[0, 4, 4, 0]} />
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
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
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
      </div>

      {/* Trend Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Incident Trend (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            />
            <Line
              type="monotone"
              dataKey="incidents"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ fill: '#14b8a6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Incidents */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Incidents</h3>
        {incidents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No incidents reported yet</div>
        ) : (
          <div className="space-y-3">
            {incidents.slice(0, 5).map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{incident.title}</p>
                  <p className="text-slate-400 text-sm capitalize">
                    {incident.incident_type.replace('_', ' ')} . {incident.severity} severity
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      incident.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : incident.status === 'in_review'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-green-500/20 text-green-300'
                    }`}
                  >
                    {incident.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
