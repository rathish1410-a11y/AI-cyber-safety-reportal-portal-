import { useEffect, useState } from 'react';
import { FileWarning, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
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
    },
    {
      label: 'Pending',
      value: getStatusCount('pending'),
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'In Review',
      value: getStatusCount('in_review'),
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Resolved',
      value: getStatusCount('resolved'),
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
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

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Citizen Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here's an overview of your incident reports.</p>
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

      {/* Recent Incidents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Incidents</h2>
          <Link to="/dashboard/incidents" className="text-teal-400 hover:text-teal-300 text-sm">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : incidents.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <FileWarning className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No incidents reported yet</p>
            <Link
              to="/dashboard/report"
              className="text-teal-400 hover:text-teal-300 font-medium"
            >
              Report your first incident
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.slice(0, 5).map((incident) => (
              <div
                key={incident.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-white font-medium mb-1">{incident.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400 text-sm capitalize">
                        {incident.incident_type.replace('_', ' ')}
                      </span>
                      <span className="text-slate-600">.</span>
                      <span className={`text-xs px-2 py-1 rounded capitalize ${getSeverityBadge(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusBadge(incident.status)}`}>
                        {incident.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm">
                    {new Date(incident.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
