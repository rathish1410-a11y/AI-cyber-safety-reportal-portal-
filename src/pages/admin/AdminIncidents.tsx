import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Brain, Eye, X, ChevronDown, AlertCircle, MessageSquare, Send, Plus, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Incident, IncidentStatus, IncidentType, Severity, Message } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import LocationPickerMap from '../../components/LocationPickerMap';

export default function AdminIncidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'messages'>('details');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchIncidents();
  }, [filterStatus, filterSeverity, filterType]);

  async function fetchIncidents() {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });
      if (filterStatus) query = query.eq('status', filterStatus);
      if (filterSeverity) query = query.eq('severity', filterSeverity);
      if (filterType) query = query.eq('incident_type', filterType);
      
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      
      const results = data || [];
      setIncidents(searchQuery ? results.filter(i =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) : results);
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError('Failed to load incidents. Please refresh the page.');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => {
    fetchIncidents();
  };

  useEffect(() => {
    if (selectedIncident) {
      fetchMessages(selectedIncident.id);
    } else {
      setMessages([]);
      setActiveTab('details');
    }
  }, [selectedIncident]);

  async function fetchMessages(incidentId: string) {
    const { data, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching messages:', fetchError);
    } else {
      setMessages(data || []);
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedIncident || !user) return;

    setSendingMessage(true);
    const { error: sendError } = await supabase
      .from('messages')
      .insert({
        incident_id: selectedIncident.id,
        sender_id: user.id,
        sender_role: 'admin',
        content: newMessage.trim()
      });

    if (sendError) {
      console.error('Error sending message:', sendError);
      setActionError('Failed to send message. Please try again.');
    } else {
      setNewMessage('');
      fetchMessages(selectedIncident.id);
    }
    setSendingMessage(false);
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: IncidentStatus) => {
    setUpdating(true);
    setActionError(null);
    const { error: updateError } = await supabase
      .from('incidents')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', incidentId);

    if (updateError) {
      console.error('Update failed:', updateError);
      setActionError('Failed to update incident status. Please try again.');
    } else {
      setIncidents(
        incidents.map((i) =>
          i.id === incidentId ? { ...i, status: newStatus } : i
        )
      );
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident({ ...selectedIncident, status: newStatus });
      }
    }
    setUpdating(false);
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-slate-500/20 text-slate-300 shadow-[0_0_6px_rgba(148,163,184,0.15)]',
      medium: 'bg-yellow-500/20 text-yellow-300 shadow-[0_0_6px_rgba(250,204,21,0.2)]',
      high: 'bg-orange-500/20 text-orange-300 shadow-[0_0_6px_rgba(251,146,60,0.2)]',
      critical: 'bg-red-500/20 text-red-300 shadow-[0_0_6px_rgba(248,113,113,0.25)]',
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
    return {
      className: colors[status as keyof typeof colors] || colors.pending,
      label: labels[status as keyof typeof labels] || status,
    };
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBarColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const incidentTypes: IncidentType[] = [
    'phishing',
    'fraud',
    'hacking',
    'harassment',
    'identity_theft',
    'malware',
    'other',
  ];
  const severities: Severity[] = ['low', 'medium', 'high', 'critical'];
  const statuses: IncidentStatus[] = ['pending', 'in_review', 'resolved'];

  return (
    <div className="relative p-6 lg:p-8 min-h-screen">
      {/* Background effects */}
      <div className="cyber-grid-bg" />
      <div className="scanline-overlay" />

      {/* Header */}
      <div className="relative mb-8 flex justify-between items-start">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wider text-neon-cyan mb-2">
            INCIDENT MANAGEMENT
          </h1>
          <p className="font-mono text-sm text-slate-400">
            View and manage all reported incidents
          </p>
        </div>
        <Link to="/admin/report" className="cyber-btn flex items-center px-4 py-2">
          <Plus className="w-4 h-4 mr-2" />
          REPORT THREAT
        </Link>
      </div>

      {/* Filters */}
      <div className="cyber-card relative rounded-xl p-4 mb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-400/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search incidents..."
              className="cyber-input w-full pl-10 pr-4 py-2.5"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="cyber-select px-4 py-2.5"
          >
            <option value="">All Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="cyber-select px-4 py-2.5"
          >
            <option value="">All Severity</option>
            {severities.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="cyber-select px-4 py-2.5"
          >
            <option value="">All Types</option>
            {incidentTypes.map((t) => (
              <option key={t} value={t}>
                {t.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 font-mono text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <span className="terminal-text text-neon-cyan text-lg">Loading incident data...</span>
        </div>
      ) : incidents.length === 0 ? (
        <div className="cyber-card relative rounded-xl p-12 text-center">
          <p className="terminal-text text-slate-400">No incidents found</p>
        </div>
      ) : (
        <div className="cyber-card relative rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="cyber-table w-full">
              <thead>
                <tr className="border-b border-[rgba(56,189,248,0.1)]">
                  <th className="text-left px-6 py-4 text-sm font-mono font-medium text-cyber-400/70">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-mono font-medium text-cyber-400/70">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-mono font-medium text-cyber-400/70">Severity</th>
                  <th className="text-left px-6 py-4 text-sm font-mono font-medium text-cyber-400/70">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-mono font-medium text-cyber-400/70">AI Score</th>
                  <th className="text-left px-6 py-4 text-sm font-mono font-medium text-cyber-400/70">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => {
                  const statusBadge = getStatusBadge(incident.status);
                  return (
                    <tr
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident)}
                      className="border-b border-[rgba(56,189,248,0.05)] hover:bg-[rgba(56,189,248,0.05)] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{incident.title}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-300 capitalize font-mono text-sm">
                        {incident.incident_type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`cyber-badge text-xs px-2 py-1 rounded capitalize ${getSeverityBadge(
                            incident.severity
                          )}`}
                        >
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <select
                            value={incident.status}
                            onChange={(e) =>
                              updateIncidentStatus(incident.id, e.target.value as IncidentStatus)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className={`cyber-badge ${statusBadge.className} text-xs px-2 py-1 rounded appearance-none cursor-pointer pr-6`}
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s} className="bg-dark-900">
                                {s.replace('_', ' ').charAt(0).toUpperCase() +
                                  s.replace('_', ' ').slice(1)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {incident.ai_risk_score !== null && (
                          <div className="flex items-center gap-2">
                            <div className="risk-bar w-16 h-1.5">
                              <div
                                className={`risk-bar-fill h-full ${getRiskBarColor(incident.ai_risk_score)}`}
                                style={{ width: `${incident.ai_risk_score}%` }}
                              />
                            </div>
                            <span className={`font-mono text-sm ${getRiskScoreColor(incident.ai_risk_score)}`}>
                              {incident.ai_risk_score}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm font-mono">
                        {new Date(incident.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedIncident(incident)}
                            className="text-cyber-400 hover:text-cyber-300 transition-colors tooltip-trigger relative"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {incident.user_id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIncident(incident);
                                setActiveTab('messages');
                              }}
                              className="text-cyber-400 hover:text-cyber-300 transition-colors flex items-center gap-1.5 bg-cyber-900/40 px-3 py-1.5 rounded-lg border border-cyber-500/30 hover:bg-cyber-900/60"
                              title="Chat with Reporter"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-xs font-mono font-medium">Chat</span>
                            </button>
                          )}
                        </div>
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
        <div className="cyber-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="cyber-modal cyber-frame relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-[rgba(56,189,248,0.1)] p-4 flex items-center justify-between z-10">
              <h3 className="font-display text-lg font-semibold tracking-wider text-neon-cyan">
                INCIDENT DETAILS
              </h3>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-cyber-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedIncident.user_id && (
              <div className="flex border-b border-[rgba(56,189,248,0.1)]">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-3 text-sm font-mono font-medium transition-colors ${
                    activeTab === 'details'
                      ? 'text-cyber-400 border-b-2 border-cyber-400 bg-cyber-400/5'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex-1 py-3 text-sm font-mono font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'messages'
                      ? 'text-cyber-400 border-b-2 border-cyber-400 bg-cyber-400/5'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </button>
              </div>
            )}

            <div className="p-6">
              {activeTab === 'details' ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">{selectedIncident.title}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400 text-sm capitalize font-mono">
                        {selectedIncident.incident_type.replace('_', ' ')}
                      </span>
                      <span
                        className={`cyber-badge text-xs px-2 py-1 rounded capitalize ${getSeverityBadge(
                          selectedIncident.severity
                        )}`}
                      >
                        {selectedIncident.severity}
                      </span>
                      <span
                        className={`cyber-badge text-xs px-2 py-1 rounded ${
                          getStatusBadge(selectedIncident.status).className
                        }`}
                      >
                        {getStatusBadge(selectedIncident.status).label}
                      </span>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="bg-[rgba(56,189,248,0.03)] border border-[rgba(56,189,248,0.1)] rounded-lg p-4">
                    <p className="text-slate-300 text-sm mb-3 font-mono">Update Status</p>
                    {actionError && (
                      <div className="mb-3 p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200 font-mono text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                        <p>{actionError}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {statuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateIncidentStatus(selectedIncident.id, s)}
                          disabled={updating}
                          className={`cyber-btn px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all ${
                            selectedIncident.status === s
                              ? 'bg-cyber-400/20 text-cyber-400 border border-cyber-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                              : 'bg-dark-800 text-slate-300 border border-[rgba(56,189,248,0.1)] hover:bg-[rgba(56,189,248,0.05)] hover:text-cyber-400'
                          }`}
                        >
                          {s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severity Update */}
                  <div className="bg-[rgba(56,189,248,0.03)] border border-[rgba(56,189,248,0.1)] rounded-lg p-4 mt-4">
                    <p className="text-slate-300 text-sm mb-3 font-mono">Update Severity</p>
                    <div className="flex flex-wrap gap-2">
                      {(['low', 'medium', 'high', 'critical'] as Severity[]).map((sev) => (
                        <button
                          key={sev}
                          onClick={() => updateIncidentSeverity(selectedIncident.id, sev)}
                          disabled={updating}
                          className={`cyber-btn px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all ${
                            selectedIncident.severity === sev
                              ? 'bg-cyber-400/20 text-cyber-400 border border-cyber-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                              : 'bg-dark-800 text-slate-300 border border-[rgba(56,189,248,0.1)] hover:bg-[rgba(56,189,248,0.05)] hover:text-cyber-400'
                          }`}
                        >
                          {sev.charAt(0).toUpperCase() + sev.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Update */}
                  <div className="bg-[rgba(56,189,248,0.03)] border border-[rgba(56,189,248,0.1)] rounded-lg p-4 mt-4">
                    <p className="text-slate-300 text-sm mb-3 font-mono flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-cyber-400" />
                      Update Location
                    </p>
                    <p className="text-slate-400 text-xs font-mono mb-2">Click on the map to instantly update the threat's location.</p>
                    <LocationPickerMap 
                      latitude={selectedIncident.latitude}
                      longitude={selectedIncident.longitude}
                      onLocationSelect={(lat, lng) => updateIncidentLocation(selectedIncident.id, lat, lng)}
                    />
                  </div>

                  <div className="mt-6">
                    <h5 className="text-sm font-mono font-medium text-cyber-400/70 mb-2">Description</h5>
                    <p className="text-slate-300 whitespace-pre-wrap">{selectedIncident.description}</p>
                  </div>

                  {(selectedIncident.phone_number || selectedIncident.platform || selectedIncident.incident_date || selectedIncident.financial_loss) && (
                    <div className="grid sm:grid-cols-2 gap-4 bg-[rgba(56,189,248,0.02)] p-4 rounded-lg border border-[rgba(56,189,248,0.05)]">
                      {selectedIncident.phone_number && (
                        <div>
                          <h5 className="text-xs font-mono font-medium text-cyber-400/70 mb-1 uppercase tracking-wider">Phone Number</h5>
                          <p className="text-white font-mono text-sm">{selectedIncident.phone_number}</p>
                        </div>
                      )}
                      {selectedIncident.platform && (
                        <div>
                          <h5 className="text-xs font-mono font-medium text-cyber-400/70 mb-1 uppercase tracking-wider">Platform</h5>
                          <p className="text-white font-mono text-sm capitalize">{selectedIncident.platform}</p>
                        </div>
                      )}
                      {selectedIncident.incident_date && (
                        <div>
                          <h5 className="text-xs font-mono font-medium text-cyber-400/70 mb-1 uppercase tracking-wider">Incident Date</h5>
                          <p className="text-white font-mono text-sm">{selectedIncident.incident_date}</p>
                        </div>
                      )}
                      {selectedIncident.financial_loss && (
                        <div>
                          <h5 className="text-xs font-mono font-medium text-cyber-400/70 mb-1 uppercase tracking-wider">Financial Loss</h5>
                          <p className="text-white font-mono text-sm">{selectedIncident.financial_loss}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {(selectedIncident.attacker_ip || selectedIncident.malicious_url || selectedIncident.crypto_wallet) && (
                    <div className="bg-[rgba(56,189,248,0.03)] border border-[rgba(56,189,248,0.1)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 font-medium font-mono text-sm uppercase tracking-wider">Technical Indicators</span>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        {selectedIncident.attacker_ip && (
                          <div>
                            <p className="text-slate-400 text-xs font-mono mb-1">Attacker IP</p>
                            <p className="text-white font-mono text-sm break-all">{selectedIncident.attacker_ip}</p>
                          </div>
                        )}
                        {selectedIncident.malicious_url && (
                          <div>
                            <p className="text-slate-400 text-xs font-mono mb-1">Malicious URL</p>
                            <p className="text-white font-mono text-sm break-all">
                              <a href={selectedIncident.malicious_url} target="_blank" rel="noopener noreferrer" className="text-cyber-400 hover:underline">
                                {selectedIncident.malicious_url}
                              </a>
                            </p>
                          </div>
                        )}
                        {selectedIncident.crypto_wallet && (
                          <div>
                            <p className="text-slate-400 text-xs font-mono mb-1">Crypto Wallet</p>
                            <p className="text-white font-mono text-sm break-all">{selectedIncident.crypto_wallet}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedIncident.ai_risk_score !== null && (
                    <div className="bg-[rgba(56,189,248,0.03)] border border-[rgba(56,189,248,0.1)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-cyber-400" />
                        <span className="text-cyber-400 font-medium font-mono">AI Insights</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-400 text-sm font-mono mb-1">Risk Score</p>
                          <div className="flex items-center gap-2">
                            <div className="risk-bar flex-1 h-2 rounded-full overflow-hidden">
                              <div
                                className={`risk-bar-fill h-full ${
                                  selectedIncident.ai_risk_score >= 60
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500'
                                    : 'bg-gradient-to-r from-cyber-400 to-matrix-400'
                                }`}
                                style={{ width: `${selectedIncident.ai_risk_score}%` }}
                              />
                            </div>
                            <span
                              className={`font-mono ${getRiskScoreColor(selectedIncident.ai_risk_score)}`}
                            >
                              {selectedIncident.ai_risk_score}
                            </span>
                          </div>
                        </div>
                        {selectedIncident.ai_suggested_category && (
                          <div>
                            <p className="text-slate-400 text-sm font-mono mb-1">Suggested Category</p>
                            <p className="text-white capitalize font-mono">
                              {selectedIncident.ai_suggested_category.replace('_', ' ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedIncident.file_url && (
                    <div>
                      <h5 className="text-sm font-mono font-medium text-cyber-400/70 mb-2 uppercase tracking-wider">Attached Screenshot / File</h5>
                      {/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(selectedIncident.file_url) ? (
                        <div className="space-y-2">
                          <a href={selectedIncident.file_url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={selectedIncident.file_url}
                              alt="Incident screenshot"
                              className="max-h-64 max-w-full rounded-lg border border-cyber-400/20 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </a>
                          <a
                            href={selectedIncident.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyber-400 hover:text-cyber-300 transition-colors text-sm font-mono inline-block"
                          >
                            Open Full Size
                          </a>
                        </div>
                      ) : (
                        <a
                          href={selectedIncident.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyber-400 hover:text-cyber-300 transition-colors font-mono"
                        >
                          Download File
                        </a>
                      )}
                    </div>
                  )}

                  <div className="text-slate-400 text-sm font-mono">
                    Submitted on {new Date(selectedIncident.created_at).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-[500px]">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 font-mono text-sm">
                        No messages yet. Send a message to the citizen.
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[80%] ${
                            msg.sender_role === 'admin' ? 'ml-auto items-end' : 'mr-auto items-start'
                          }`}
                        >
                          <span className="text-[10px] text-slate-500 font-mono mb-1 uppercase tracking-wider">
                            {msg.sender_role === 'admin' ? 'You (Admin)' : 'Citizen'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div
                            className={`p-3 rounded-lg text-sm ${
                              msg.sender_role === 'admin'
                                ? 'bg-cyber-400/20 border border-cyber-400/30 text-white rounded-tr-none'
                                : 'bg-dark-800 border border-[rgba(56,189,248,0.1)] text-slate-200 rounded-tl-none'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="relative mt-auto">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message to the citizen..."
                      className="cyber-input w-full pr-12 py-3 bg-dark-900"
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyber-400 hover:text-cyber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
