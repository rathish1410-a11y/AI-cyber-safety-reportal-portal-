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
    const { data } = await supabase
      .from('incidents')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) setIncidents(data);
    setLoading(false);
  }

  const getStatusCount = (status: IncidentStatus) => {
    return incidents.filter((i) => i.status === status).length;
  };

  const stats = [
    {
      label: 'Total Reports',
      value: incidents.length,
      icon: FileWarning,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-l-blue-400',
    },
    {
      label: 'Pending',
      value: getStatusCount('pending'),
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-l-yellow-400',
    },
    {
      label: 'In Review',
      value: getStatusCount('in_review'),
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-l-orange-400',
    },
    {
      label: 'Resolved',
      value: getStatusCount('resolved'),
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-l-green-400',
    },
  ];

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-slate-500/20 text-slate-300',
      medium: 'bg-yellow-500/20 text-yellow-300',
      high: 'bg-orange-500/20 text-orange-300',
      critical: 'bg-red-500/20 text-red-300',
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300',
      in_review: 'bg-blue-500/20 text-blue-300',
      resolved: 'bg-green-500/20 text-green-300',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getSeverityDot = (severity: string) => {
    const colors = {
      low: 'bg-slate-400',
      medium: 'bg-yellow-400',
      high: 'bg-orange-400',
      critical: 'bg-red-400',
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const criticalCount = incidents.filter((i) => i.severity === 'critical' || i.severity === 'high').length;
  const openCount = incidents.filter((i) => i.status !== 'resolved').length;

  const threatLevel = criticalCount > 0 ? 'high' : openCount > 0 ? 'medium' : 'low';
  const threatConfig = {
    low: { label: 'LOW', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400', msg: 'No active high-severity reports. Your account status is normal.' },
    medium: { label: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400', msg: `You have ${openCount} report${openCount === 1 ? '' : 's'} currently being processed.` },
    high: { label: 'HIGH', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400', msg: `${criticalCount} high/critical severity report${criticalCount === 1 ? '' : 's'} require attention.` },
  }[threatLevel];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Citizen Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's an overview of your incident reports.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-mono text-slate-400">AI RISK ENGINE</span>
          <span className="text-xs font-mono text-emerald-400">ACTIVE</span>
        </div>
      </div>

      {/* Threat Level Banner */}
      <div className={`flex items-center gap-4 ${threatConfig.bg} ${threatConfig.border} border rounded-xl px-5 py-3 mb-8`}>
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className={`animate-pulse-ring absolute inline-flex h-full w-full rounded-full ${threatConfig.dot} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${threatConfig.dot}`}></span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">THREAT LEVEL:</span>
          <span className={`text-sm font-mono font-bold ${threatConfig.color}`}>{threatConfig.label}</span>
        </div>
        <span className="text-slate-600">|</span>
        <p className="text-sm text-slate-300">{threatConfig.msg}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-slate-800/50 border border-slate-700 border-l-2 ${stat.border} rounded-xl p-6`}>
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-white mb-1 font-mono">{stat.value.toString().padStart(2, '0')}</p>
            <p className="text-slate-400 text-sm uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Report a New Incident</h2>
            <p className="text-teal-100">Submit a cyber incident report quickly and securely</p>
          </div>
          <Link
            to="/dashboard/report"
            className="bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors inline-block text-center"
          >
            Report Now
          </Link>
        </div>
      </div>

      {/* Recent Incidents - Activity Log */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <span className="text-xs font-mono text-slate-500">/// LOG</span>
          </div>
          <Link to="/dashboard/incidents" className="text-teal-400 hover:text-teal-300 text-sm">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-mono text-sm">Loading activity feed...</div>
        ) : incidents.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4 font-mono text-sm">NO_INCIDENTS_LOGGED</p>
            <Link
              to="/dashboard/report"
              className="text-teal-400 hover:text-teal-300 font-medium"
            >
              Report your first incident
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            {incidents.slice(0, 5).map((incident, idx) => (
              <div
                key={incident.id}
                className={`flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 hover:bg-slate-700/30 transition-colors ${
                  idx !== 0 ? 'border-t border-slate-700/60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${getSeverityDot(incident.severity)}`} />
                  <div>
                    <h3 className="text-white font-medium mb-1">{incident.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400 text-sm capitalize font-mono">
                        {incident.incident_type.replace('_', ' ')}
                      </span>
                      <span className="text-slate-600">.</span>
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${getSeverityBadge(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${getStatusBadge(incident.status)}`}>
                        {incident.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-500 text-xs font-mono pl-5 md:pl-0">
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
