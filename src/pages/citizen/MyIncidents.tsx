import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileWarning, Search, Brain, Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Incident } from '../../types/database';

export default function MyIncidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    if (user) {
      fetchIncidents();
    }
  }, [user]);

  async function fetchIncidents() {
    let query = supabase
      .from('incidents')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }

    const { data } = await query;
    if (data) {
      if (searchQuery) {
        setIncidents(data.filter(i =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.description.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      } else {
        setIncidents(data);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchIncidents();
  }, [filterStatus, searchQuery]);

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
    const labels = {
      pending: 'Pending',
      in_review: 'In Review',
      resolved: 'Resolved',
    };
    return { className: colors[status as keyof typeof colors] || colors.pending, label: labels[status as keyof typeof labels] || status };
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">My Incident Reports</h1>
        <p className="text-slate-400">Track the status of your submitted incident reports</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incidents..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : incidents.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <FileWarning className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No incidents found</p>
          <Link
            to="/dashboard/report"
            className="text-teal-400 hover:text-teal-300 font-medium"
          >
            Report your first incident
          </Link>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Severity</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">AI Score</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => {
                  const statusBadge = getStatusBadge(incident.status);
                  return (
                    <tr
                      key={incident.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{incident.title}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-300 capitalize">
                        {incident.incident_type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded capitalize ${getSeverityBadge(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {incident.ai_risk_score !== null && (
                          <span className={`font-mono ${getRiskScoreColor(incident.ai_risk_score)}`}>
                            {incident.ai_risk_score}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(incident.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedIncident(incident)}
                          className="text-teal-400 hover:text-teal-300"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Incident Details</h3>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">{selectedIncident.title}</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400 text-sm capitalize">
                    {selectedIncident.incident_type.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded capitalize ${getSeverityBadge(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(selectedIncident.status).className}`}>
                    {getStatusBadge(selectedIncident.status).label}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-slate-400 mb-2">Description</h5>
                <p className="text-slate-300 whitespace-pre-wrap">{selectedIncident.description}</p>
              </div>

              {selectedIncident.ai_risk_score !== null && (
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-teal-400" />
                    <span className="text-teal-400 font-medium">AI Insights</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Risk Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${selectedIncident.ai_risk_score >= 60 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-teal-500 to-teal-400'}`}
                            style={{ width: `${selectedIncident.ai_risk_score}%` }}
                          />
                        </div>
                        <span className={`font-mono ${getRiskScoreColor(selectedIncident.ai_risk_score)}`}>
                          {selectedIncident.ai_risk_score}
                        </span>
                      </div>
                    </div>
                    {selectedIncident.ai_suggested_category && (
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Suggested Category</p>
                        <p className="text-white capitalize">
                          {selectedIncident.ai_suggested_category.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedIncident.file_url && (
                <div>
                  <h5 className="text-sm font-medium text-slate-400 mb-2">Attached File</h5>
                  <a
                    href={selectedIncident.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300"
                  >
                    View File
                  </a>
                </div>
              )}

              <div className="text-slate-400 text-sm">
                Submitted on {new Date(selectedIncident.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
