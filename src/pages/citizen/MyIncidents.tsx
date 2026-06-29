import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileWarning, Search, Brain, Eye, X, AlertCircle, MessageSquare, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Incident, Message } from '../../types/database';

export default function MyIncidents() {
  const { user } = useAuth();
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  
  const [activeTab, setActiveTab] = useState<'details' | 'messages'>('details');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function fetchIncidents() {
    setError(null);
    try {
      let query = supabase
        .from('incidents')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (filterStatus) query = query.eq('status', filterStatus);
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      const result = data || [];
      setAllIncidents(result);
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError('Failed to fetch incidents. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Client-side filtering
  useEffect(() => {
    if (searchQuery) {
      setIncidents(allIncidents.filter(i =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setIncidents(allIncidents);
    }
  }, [allIncidents, searchQuery]);

  async function fetchMessages(incidentId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }

  useEffect(() => {
    if (selectedIncident && activeTab === 'messages') {
      fetchMessages(selectedIncident.id);
    }
  }, [selectedIncident, activeTab]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedIncident || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          incident_id: selectedIncident.id,
          sender_id: user.id,
          sender_role: 'citizen',
          content: newMessage.trim()
        });

      if (error) throw error;
      
      setNewMessage('');
      fetchMessages(selectedIncident.id);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  }


  useEffect(() => {
    if (user) {
      fetchIncidents();
    }
  }, [user, filterStatus]);

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
      in_review: 'bg-[rgba(56,189,248,0.15)] text-[#38bdf8]',
      resolved: 'bg-[rgba(52,211,153,0.15)] text-[#34d399]',
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
    <div className="relative p-6 lg:p-8">
      <div className="scanline-overlay pointer-events-none" />
      <div className="cyber-grid-bg pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 font-display tracking-wider uppercase text-neon-cyan">MY INCIDENT REPORTS</h1>
          <p className="text-slate-400 font-mono text-sm">Track the status of your submitted incident reports</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 font-mono text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 terminal-text text-neon-cyan">Loading...</div>
        ) : incidents.length === 0 ? (
          <div className="cyber-card cyber-frame rounded-xl p-12 text-center">
            <FileWarning className="w-12 h-12 text-cyber-400/40 mx-auto mb-4" />
            <p className="text-slate-400 mb-4 font-mono">No incidents found</p>
            <Link
              to="/dashboard/report"
              className="text-cyber-400 hover:text-cyber-300 font-medium"
            >
              Report your first incident
            </Link>
          </div>
        ) : (
          <div className="cyber-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full cyber-table">
                <thead>
                  <tr className="border-b border-[rgba(56,189,248,0.1)]">
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400 font-mono">Title</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400 font-mono">Type</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400 font-mono">Severity</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400 font-mono">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400 font-mono">AI Score</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400 font-mono">Date</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => {
                    const statusBadge = getStatusBadge(incident.status);
                    return (
                      <tr
                        key={incident.id}
                        className="border-b border-[rgba(56,189,248,0.05)] hover:bg-[rgba(56,189,248,0.03)] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{incident.title}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-300 capitalize font-mono text-sm">
                          {incident.incident_type.replaceAll('_', ' ')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`cyber-badge text-xs px-2 py-1 rounded capitalize ${getSeverityBadge(incident.severity)}`}>
                            {incident.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`cyber-badge text-xs px-2 py-1 rounded ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {incident.ai_risk_score !== null && (
                            <span className={`font-mono font-bold ${getRiskScoreColor(incident.ai_risk_score)}`}>
                              {incident.ai_risk_score}
                            </span>
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
                            <button
                              onClick={() => {
                                setSelectedIncident(incident);
                                setActiveTab('messages');
                              }}
                              className="text-cyber-400 hover:text-cyber-300 transition-colors flex items-center gap-1.5 bg-cyber-900/40 px-3 py-1.5 rounded-lg border border-cyber-500/30 hover:bg-cyber-900/60"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-xs font-mono font-medium">Chat</span>
                            </button>
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
            <div className="cyber-modal cyber-frame bg-dark-900 border border-[rgba(56,189,248,0.15)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-dark-900 border-b border-[rgba(56,189,248,0.1)]">
                <div className="p-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white font-display tracking-wide text-neon-cyan">Incident Details</h3>
                  <button
                    onClick={() => {
                      setSelectedIncident(null);
                      setActiveTab('details');
                    }}
                    className="text-slate-400 hover:text-cyber-400 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex px-4 gap-6 border-t border-[rgba(56,189,248,0.05)]">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-3 text-sm font-mono transition-colors relative ${
                      activeTab === 'details' ? 'text-cyber-400' : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Overview
                    {activeTab === 'details' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-400 glow-cyan shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`py-3 text-sm font-mono transition-colors relative flex items-center gap-2 ${
                      activeTab === 'messages' ? 'text-cyber-400' : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Messages
                    {activeTab === 'messages' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-400 glow-cyan shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {activeTab === 'details' ? (
                  <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">{selectedIncident.title}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 text-sm capitalize font-mono">
                      {selectedIncident.incident_type.replaceAll('_', ' ')}
                    </span>
                    <span className={`cyber-badge text-xs px-2 py-1 rounded capitalize ${getSeverityBadge(selectedIncident.severity)}`}>
                      {selectedIncident.severity}
                    </span>
                    <span className={`cyber-badge text-xs px-2 py-1 rounded ${getStatusBadge(selectedIncident.status).className}`}>
                      {getStatusBadge(selectedIncident.status).label}
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-cyber-400 mb-2 font-mono uppercase tracking-wider">Description</h5>
                  <p className="text-slate-300 whitespace-pre-wrap">{selectedIncident.description}</p>
                </div>

                {selectedIncident.ai_risk_score !== null && (
                  <div className="cyber-card glow-cyan rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-cyber-400" />
                      <span className="text-cyber-400 font-medium font-mono">AI Insights</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm mb-1 font-mono">Risk Score</p>
                        <div className="flex items-center gap-2">
                          <div className="risk-bar flex-1">
                            <div
                              className="risk-bar-fill"
                              style={{ width: `${selectedIncident.ai_risk_score}%` }}
                            />
                          </div>
                          <span className={`font-mono font-bold ${getRiskScoreColor(selectedIncident.ai_risk_score)}`}>
                            {selectedIncident.ai_risk_score}
                          </span>
                        </div>
                      </div>
                      {selectedIncident.ai_suggested_category && (
                        <div>
                          <p className="text-slate-400 text-sm mb-1 font-mono">Suggested Category</p>
                          <p className="text-white capitalize">
                            {selectedIncident.ai_suggested_category.replaceAll('_', ' ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedIncident.file_url && (
                  <div>
                    <h5 className="text-sm font-medium text-cyber-400 mb-2 font-mono uppercase tracking-wider">Attached Screenshot / File</h5>
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
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-slate-400 font-mono py-8 bg-dark-800/50 rounded-lg border border-[rgba(56,189,248,0.1)]">
                          No messages yet. Send a message to communicate with the admin team.
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isOwn = msg.sender_id === user?.id;
                          return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <div 
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  isOwn 
                                    ? 'bg-cyber-900/40 border border-cyber-500/30 text-white' 
                                    : 'bg-dark-800 border border-slate-700/50 text-slate-200'
                                }`}
                              >
                                <div className="text-xs font-mono text-slate-400 mb-1 flex items-center gap-2 justify-between">
                                  <span>{isOwn ? 'You' : 'Admin'}</span>
                                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    
                    <form onSubmit={handleSendMessage} className="mt-auto">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="w-full bg-dark-800 border border-[rgba(56,189,248,0.2)] rounded-lg py-3 pl-4 pr-12 text-white focus:outline-none focus:border-cyber-400 font-mono text-sm transition-colors"
                          disabled={sending}
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          className="absolute right-2 p-2 text-cyber-400 hover:text-cyber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
