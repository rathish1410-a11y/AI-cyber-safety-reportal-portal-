import { useEffect, useState } from 'react';
import { FileWarning, Clock, CheckCircle, AlertTriangle, Activity, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Incident, IncidentStatus } from '../../types/database';
import { Link } from 'react-router-dom';

export default function CitizenOverview() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchIncidents();
    }
  }, [user]);

  async function fetchIncidents() {
    try {
      const { data } = await supabase
        .from('incidents')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      setIncidents(data || []);
    } catch {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }

  const getStatusCount = (status: IncidentStatus) => {
    return incidents.filter((i) => i.status === status).length;
  };

  const stats = [
    {
      label: 'Total Reports',
      value: incidents.length,
      icon: FileWarning,
      color: 'text-cyber-400',
      bg: 'bg-cyber-400/10',
      glow: 'glow-cyan',
    },
    {
      label: 'Pending',
      value: getStatusCount('pending'),
      icon: Clock,
      color: 'text-[#ffaa00]',
      bg: 'bg-[#ffaa00]/10',
      glow: 'glow-amber',
    },
    {
      label: 'In Review',
      value: getStatusCount('in_review'),
      icon: AlertTriangle,
      color: 'text-danger-400',
      bg: 'bg-danger-400/10',
      glow: 'glow-red',
    },
    {
      label: 'Resolved',
      value: getStatusCount('resolved'),
      icon: CheckCircle,
      color: 'text-matrix-400',
      bg: 'bg-matrix-400/10',
      glow: 'glow-green',
    },
  ];

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-matrix-400/10 text-matrix-400 border border-matrix-400/20',
      medium: 'bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/20',
      high: 'bg-danger-400/10 text-danger-400 border border-danger-400/20',
      critical: 'bg-danger-400/20 text-danger-400 border border-danger-400/30',
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/20',
      in_review: 'bg-cyber-400/10 text-cyber-400 border border-cyber-400/20',
      resolved: 'bg-matrix-400/10 text-matrix-400 border border-matrix-400/20',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getSeverityDot = (severity: string) => {
    const colors = {
      low: 'bg-matrix-400',
      medium: 'bg-[#ffaa00]',
      high: 'bg-danger-400',
      critical: 'bg-danger-400',
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const criticalCount = incidents.filter((i) => i.severity === 'critical' || i.severity === 'high').length;
  const openCount = incidents.filter((i) => i.status !== 'resolved').length;

  const threatLevel = criticalCount > 0 ? 'high' : openCount > 0 ? 'medium' : 'low';
  const threatConfig = {
    low: { label: 'LOW', color: 'text-neon-green', bg: 'bg-matrix-400/5', border: 'border-matrix-400/30', dot: 'bg-matrix-400', msg: 'No active high-severity reports. Your account status is normal.' },
    medium: { label: 'MEDIUM', color: 'text-neon-cyan', bg: 'bg-cyber-400/5', border: 'border-cyber-400/30', dot: 'bg-[#ffaa00]', msg: `You have ${openCount} report${openCount === 1 ? '' : 's'} currently being processed.` },
    high: { label: 'HIGH', color: 'text-neon-red', bg: 'bg-danger-400/5', border: 'border-danger-400/30', dot: 'bg-danger-400', msg: `${criticalCount} high/critical severity report${criticalCount === 1 ? '' : 's'} require attention.` },
  }[threatLevel];

  return (
    <div className="p-6 lg:p-8 scanline-overlay relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 font-display tracking-wider uppercase">Citizen Dashboard</h1>
          <p className="terminal-text text-slate-400 text-sm">Welcome back! Here's an overview of your incident reports.</p>
        </div>
        <div className="cyber-card flex items-center gap-2.5 px-4 py-2.5">
          <Activity className="w-4 h-4 text-cyber-400" />
          <span className="text-xs font-mono text-neon-cyan tracking-wider">AI RISK ENGINE</span>
          <span className="mx-1 text-slate-700">│</span>
          <span className="live-dot bg-matrix-400 inline-block"></span>
          <span className="text-xs font-mono text-neon-green tracking-wider">ACTIVE</span>
        </div>
      </div>

      {/* Threat Level Banner */}
      <div className={`cyber-card neon-border flex items-center gap-4 ${threatConfig.bg} px-5 py-3.5 mb-8`}>
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className={`animate-pulse-ring absolute inline-flex h-full w-full rounded-full ${threatConfig.dot} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${threatConfig.dot}`}></span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 tracking-wider">THREAT LEVEL:</span>
          <span className={`text-sm font-mono font-bold ${threatConfig.color}`}>{threatConfig.label}</span>
        </div>
        <span className="text-[rgba(56,189,248,0.15)]">│</span>
        <p className="text-sm text-slate-300 terminal-text">{threatConfig.msg}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`cyber-card ${stat.glow} p-6`}>
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-4 border border-[rgba(56,189,248,0.08)]`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-white mb-1 font-display tracking-wider">{stat.value.toString().padStart(2, '0')}</p>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-mono">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions - Report Now CTA */}
      <div className="cyber-card neon-border p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-400/5 via-transparent to-matrix-400/5 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 font-display tracking-wide">Report a New Incident</h2>
            <p className="text-slate-400 terminal-text text-sm">Submit a cyber incident report quickly and securely</p>
          </div>
          <Link
            to="/dashboard/report"
            className="cyber-btn-solid px-6 py-3 rounded-lg inline-block text-center font-semibold tracking-wide uppercase text-sm"
          >
            Report Now
          </Link>
        </div>
      </div>

      {/* Recent Incidents - Activity Log */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-white font-display tracking-wide">Recent Activity</h2>
            <span className="text-xs font-mono text-cyber-400/40 tracking-wider">/// LOG</span>
          </div>
          <Link to="/dashboard/incidents" className="text-cyber-400 hover:text-cyber-300 text-sm font-mono tracking-wider transition-colors">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 terminal-text text-neon-cyan text-sm">
            <span className="terminal-cursor">Loading activity feed...</span>
          </div>
        ) : incidents.length === 0 ? (
          <div className="cyber-card cyber-frame p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-cyber-400/30 mx-auto mb-4" />
            <p className="text-slate-500 mb-4 terminal-text text-sm tracking-wider">NO_INCIDENTS_LOGGED</p>
            <Link
              to="/dashboard/report"
              className="text-cyber-400 hover:text-cyber-300 font-medium font-mono transition-colors"
            >
              Report your first incident
            </Link>
          </div>
        ) : (
          <div className="cyber-card overflow-hidden">
            {incidents.slice(0, 5).map((incident, idx) => (
              <div
                key={incident.id}
                className={`flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 hover:bg-[rgba(56,189,248,0.03)] transition-colors ${
                  idx !== 0 ? 'border-t border-[rgba(56,189,248,0.07)]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${getSeverityDot(incident.severity)} ${incident.severity === 'critical' ? 'live-dot' : ''}`} />
                  <div>
                    <h3 className="text-white font-medium mb-1">{incident.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-500 text-sm capitalize font-mono tracking-wide">
                        {incident.incident_type.replace('_', ' ')}
                      </span>
                      <span className="text-[rgba(56,189,248,0.15)]">·</span>
                      <span className={`cyber-badge capitalize ${getSeverityBadge(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className={`cyber-badge capitalize ${getStatusBadge(incident.status)}`}>
                        {incident.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-xs font-mono pl-5 md:pl-0 tracking-wider">
                  {new Date(incident.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
