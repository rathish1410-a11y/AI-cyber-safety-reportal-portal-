import { useEffect, useState } from 'react';
import { FileWarning, AlertTriangle, CheckCircle, TrendingUp, Clock, Zap, Radio, Activity, Shield, Database, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Incident, Alert } from '../../types/database';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

// Electric blue palette matching reference image
const COLORS = ['#38bdf8', '#0ea5e9', '#0284c7', '#7dd3fc', '#bae6fd', '#34d399', '#f59e0b'];

const tooltipStyle = {
  backgroundColor: 'var(--dark-card)',
  border: '1px solid rgba(56,189,248,0.2)',
  borderRadius: '8px',
  boxShadow: '0 0 20px rgba(56,189,248,0.08)',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '12px',
  color: '#e2e8f0',
};

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setError(null);
      const [incidentsRes, alertsRes] = await Promise.all([
        supabase.from('incidents').select('*').order('created_at', { ascending: false }),
        supabase.from('alerts').select('*').eq('is_active', true).limit(5),
      ]);
      
      if (incidentsRes.error) throw incidentsRes.error;
      if (alertsRes.error) throw alertsRes.error;

      if (incidentsRes.data) setIncidents(incidentsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    {
      label: 'Total Incidents',
      value: incidents.length,
      icon: FileWarning,
      color: 'var(--cyber-blue)',
      iconBg: 'rgba(56,189,248,0.08)',
      borderColor: 'rgba(56,189,248,0.5)',
      glowColor: 'rgba(56,189,248,0.04)',
    },
    {
      label: 'Pending Review',
      value: incidents.filter((i) => i.status === 'pending').length,
      icon: Clock,
      color: 'var(--cyber-amber)',
      iconBg: 'rgba(245,158,11,0.08)',
      borderColor: 'rgba(245,158,11,0.5)',
      glowColor: 'rgba(245,158,11,0.04)',
    },
    {
      label: 'In Progress',
      value: incidents.filter((i) => i.status === 'in_review').length,
      icon: TrendingUp,
      color: '#60a5fa',
      iconBg: 'rgba(96,165,250,0.08)',
      borderColor: 'rgba(96,165,250,0.5)',
      glowColor: 'rgba(96,165,250,0.04)',
    },
    {
      label: 'Resolved',
      value: incidents.filter((i) => i.status === 'resolved').length,
      icon: CheckCircle,
      color: 'var(--cyber-green)',
      iconBg: 'rgba(52,211,153,0.08)',
      borderColor: 'rgba(52,211,153,0.5)',
      glowColor: 'rgba(52,211,153,0.04)',
    },
  ];

  const typeData = Object.entries(
    incidents.reduce((acc, i) => { acc[i.incident_type] = (acc[i.incident_type] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replaceAll('_', ' '), value }));

  const severityData = Object.entries(
    incidents.reduce((acc, i) => { acc[i.severity] = (acc[i.severity] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const trendData = last7Days.map((day) => ({
    day,
    incidents: incidents.filter((i) =>
      new Date(i.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === day
    ).length,
  }));

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          {/* HUD loading ring */}
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(56,189,248,0.1)', borderTopColor: 'var(--cyber-blue)' }} />
            <div className="absolute inset-2 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.08)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-5 h-5" style={{ color: 'var(--cyber-blue)' }} />
            </div>
          </div>
          <div className="terminal-text text-sm" style={{ color: 'rgba(56,189,248,0.6)' }}>LOADING_DASHBOARD<span className="terminal-cursor"></span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 relative">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {/* HUD-style icon before title */}
            <div className="relative w-8 h-8 flex-shrink-0">
              <div className="absolute inset-0 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.3)', boxShadow: '0 0 10px rgba(56,189,248,0.2)' }} />
              <div className="absolute inset-1.5 rounded-full flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.1)' }}>
                <Lock className="w-3 h-3" style={{ color: 'var(--cyber-blue)' }} />
              </div>
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-[0.12em]">COMMAND CENTER</h1>
            <div className="flex items-center gap-1.5 rounded px-2 py-0.5 border" style={{ background: 'rgba(56,189,248,0.06)', borderColor: 'rgba(56,189,248,0.2)' }}>
              <Radio className="w-3 h-3 animate-pulse" style={{ color: 'var(--cyber-blue)' }} />
              <span className="text-[10px] font-mono tracking-wider" style={{ color: 'var(--cyber-blue)' }}>LIVE</span>
            </div>
          </div>
          <p className="text-cyber-400/80 font-mono text-sm tracking-wide">SYSTEM_STATUS: <span className="text-emerald-400">NOMINAL</span></p>
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 border" style={{ background: 'var(--dark-card)', borderColor: 'rgba(56,189,248,0.08)' }}>
          <Zap className="w-3.5 h-3.5" style={{ color: 'var(--cyber-green)' }} />
          <span className="text-[10px] font-mono" style={{ color: 'var(--cyber-green)' }}>AI ENGINE v2.4</span>
          <span className="text-[10px] font-mono text-slate-600">|</span>
          <span className="text-[10px] font-mono text-slate-500">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 font-mono text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Stats Grid — HUD-ring style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="cyber-card cyber-frame p-5 relative overflow-hidden"
            style={{ borderLeftColor: stat.borderColor, borderLeftWidth: 2, boxShadow: `inset 4px 0 20px ${stat.glowColor}` }}
          >
            {/* Background circuit dot pattern */}
            <div className="absolute top-2 right-2 w-16 h-16 opacity-5">
              <div className="w-full h-full rounded-full border-2" style={{ borderColor: stat.color }} />
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-4 border relative"
              style={{ background: stat.iconBg, borderColor: `${stat.color}30` }}
            >
              {/* HUD outer ring */}
              <div className="absolute -inset-1 rounded-full border opacity-20" style={{ borderColor: stat.color }} />
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <p className="text-3xl font-display font-bold text-white mb-1 tracking-wider">
              {stat.value.toString().padStart(2, '0')}
            </p>
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#475569' }}>{stat.label}</p>
            {/* Bottom circuit lines */}
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${stat.borderColor}, transparent)` }} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Incidents by Type */}
        <div className="cyber-card cyber-frame p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyber-blue)', boxShadow: '0 0 6px rgba(56,189,248,0.6)' }} />
            <div className="w-3 h-px" style={{ background: 'var(--cyber-blue)', opacity: 0.5 }} />
            <h3 className="text-sm font-display text-white tracking-wider uppercase">Incidents by Category</h3>
          </div>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
                <XAxis type="number" stroke="rgba(56,189,248,0.2)" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis dataKey="name" type="category" width={100} stroke="rgba(56,189,248,0.2)" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(56,189,248,0.03)' }} />
                <Bar dataKey="value" fill="var(--cyber-blue-mid)" radius={[0, 4, 4, 0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center gap-3">
              <Database className="w-8 h-8" style={{ color: 'rgba(56,189,248,0.15)' }} />
              <span className="terminal-text text-xs" style={{ color: 'rgba(56,189,248,0.3)' }}>NO_DATA_AVAILABLE</span>
            </div>
          )}
        </div>

        {/* Severity Distribution */}
        <div className="cyber-card cyber-frame p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyber-red)', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }} />
            <div className="w-3 h-px" style={{ background: 'var(--cyber-red)', opacity: 0.5 }} />
            <h3 className="text-sm font-display text-white tracking-wider uppercase">Severity Distribution</h3>
          </div>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={95}
                  innerRadius={30}
                  dataKey="value"
                  stroke="var(--dark-card)"
                  strokeWidth={2}
                >
                  {severityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center gap-3">
              <Database className="w-8 h-8" style={{ color: 'rgba(56,189,248,0.15)' }} />
              <span className="terminal-text text-xs" style={{ color: 'rgba(56,189,248,0.3)' }}>NO_DATA_AVAILABLE</span>
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="cyber-card cyber-frame p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyber-green)', boxShadow: '0 0 6px rgba(52,211,153,0.6)' }} />
          <div className="w-3 h-px" style={{ background: 'var(--cyber-green)', opacity: 0.5 }} />
          <h3 className="text-sm font-display text-white tracking-wider uppercase">Incident Trend (Last 7 Days)</h3>
          <div className="ml-auto flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" style={{ color: 'rgba(56,189,248,0.4)' }} />
            <span className="text-[10px] font-mono tracking-wider" style={{ color: 'rgba(56,189,248,0.4)' }}>REALTIME</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trendData}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--cyber-blue)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--cyber-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
            <XAxis dataKey="day" stroke="rgba(56,189,248,0.2)" tick={{ fontSize: 11, fill: '#475569' }} />
            <YAxis stroke="rgba(56,189,248,0.2)" tick={{ fontSize: 11, fill: '#475569' }} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(56,189,248,0.15)' }} />
            <Line
              type="monotone"
              dataKey="incidents"
              stroke="var(--cyber-blue)"
              strokeWidth={2}
              dot={{ fill: 'var(--cyber-blue)', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--dark-card)', strokeWidth: 2, fill: 'var(--cyber-blue)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Incidents */}
      <div className="cyber-card cyber-frame p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyber-amber)', boxShadow: '0 0 6px rgba(245,158,11,0.6)' }} />
            <div className="w-3 h-px" style={{ background: 'var(--cyber-amber)', opacity: 0.5 }} />
            <h3 className="text-sm font-display text-white tracking-wider uppercase">Recent Incidents</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--cyber-blue)' }} />
            <span className="text-[10px] font-mono tracking-wider" style={{ color: 'rgba(56,189,248,0.4)' }}>LIVE_FEED</span>
          </div>
        </div>
        {incidents.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(56,189,248,0.12)' }} />
            <span className="terminal-text text-xs" style={{ color: 'rgba(56,189,248,0.3)' }}>NO_INCIDENTS_LOGGED</span>
          </div>
        ) : (
          <div className="space-y-2">
            {incidents.slice(0, 5).map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between p-4 rounded-lg transition-all duration-200 cursor-default hover:bg-[rgba(56,189,248,0.04)] border"
                style={{
                  background: 'rgba(56,189,248,0.02)',
                  borderColor: 'rgba(56,189,248,0.06)',
                }}
              >
                <div className="flex items-center gap-3">
                  {/* HUD ring severity indicator */}
                  <div className="relative w-6 h-6 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full border" style={{
                      borderColor: incident.severity === 'critical' ? 'rgba(239,68,68,0.5)' :
                        incident.severity === 'high' ? 'rgba(245,158,11,0.5)' :
                        incident.severity === 'medium' ? 'rgba(56,189,248,0.4)' : 'rgba(100,116,139,0.3)',
                    }} />
                    <div className="absolute inset-1.5 rounded-full" style={{
                      background: incident.severity === 'critical' ? 'var(--cyber-red)' :
                        incident.severity === 'high' ? 'var(--cyber-amber)' :
                        incident.severity === 'medium' ? 'var(--cyber-blue)' : '#475569',
                    }} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{incident.title}</p>
                    <p className="text-slate-500 text-xs font-mono">
                      {incident.incident_type.replaceAll('_', ' ')} <span className="text-slate-700">•</span> {incident.severity}
                    </p>
                  </div>
                </div>
                <span
                  className="cyber-badge"
                  style={incident.status === 'pending' ? {
                    background: 'rgba(245,158,11,0.1)',
                    color: 'var(--cyber-amber)',
                    border: '1px solid rgba(245,158,11,0.2)',
                  } : incident.status === 'in_review' ? {
                    background: 'rgba(56,189,248,0.1)',
                    color: 'var(--cyber-blue)',
                    border: '1px solid rgba(56,189,248,0.2)',
                  } : {
                    background: 'rgba(52,211,153,0.1)',
                    color: 'var(--cyber-green)',
                    border: '1px solid rgba(52,211,153,0.2)',
                  }}
                >
                  {incident.status.replaceAll('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
