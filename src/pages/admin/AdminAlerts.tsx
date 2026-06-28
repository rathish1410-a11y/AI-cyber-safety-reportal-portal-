import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, AlertTriangle, X, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Alert, Severity } from '../../types/database';

export default function AdminAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    severity: 'medium' as Severity,
  });
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      
      setAlerts(data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts. Please refresh the page.');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({ title: '', content: '', severity: 'medium' });
    setEditingAlert(null);
    setShowForm(false);
    setActionError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);

    if (editingAlert) {
      const { error: updateError } = await supabase
        .from('alerts')
        .update({
          title: formData.title,
          content: formData.content,
          severity: formData.severity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingAlert.id);

      if (updateError) {
        console.error('Failed to update alert:', updateError);
        setActionError('Failed to update alert. Please try again.');
        setSaving(false);
        return;
      } else {
        setAlerts(
          alerts.map((a) =>
            a.id === editingAlert.id
              ? { ...a, title: formData.title, content: formData.content, severity: formData.severity }
              : a
          )
        );
      }
    } else {
      const { data, error: insertError } = await supabase
        .from('alerts')
        .insert({
          author_id: user!.id,
          title: formData.title,
          content: formData.content,
          severity: formData.severity,
          is_active: true,
        })
        .select();

      if (insertError) {
        console.error('Failed to create alert:', insertError);
        setActionError('Failed to create alert. Please try again.');
        setSaving(false);
        return;
      } else if (data) {
        setAlerts([data[0], ...alerts]);
      }
    }

    resetForm();
    setSaving(false);
  };

  const toggleAlertStatus = async (alertId: string, currentStatus: boolean) => {
    setActionError(null);
    const { error: toggleError } = await supabase
      .from('alerts')
      .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
      .eq('id', alertId);

    if (toggleError) {
      console.error('Failed to toggle alert:', toggleError);
      setActionError('Failed to change alert status.');
    } else {
      setAlerts(
        alerts.map((a) =>
          a.id === alertId ? { ...a, is_active: !currentStatus } : a
        )
      );
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    setActionError(null);
    const { error: deleteError } = await supabase.from('alerts').delete().eq('id', alertId);
    
    if (deleteError) {
      console.error('Failed to delete alert:', deleteError);
      setActionError('Failed to delete alert.');
    } else {
      setAlerts(alerts.filter((a) => a.id !== alertId));
    }
  };

  const editAlert = (alert: Alert) => {
    setEditingAlert(alert);
    setFormData({
      title: alert.title,
      content: alert.content,
      severity: alert.severity,
    });
    setShowForm(true);
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      high: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      critical: 'bg-red-500/20 text-red-300 border-red-500/50',
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getSeverityGlow = (severity: string) => {
    const glows: Record<string, string> = {
      low: 'glow-blue',
      medium: 'glow-amber',
      high: 'glow-red',
      critical: 'glow-red',
    };
    return glows[severity] || 'glow-blue';
  };

  const severities: Severity[] = ['low', 'medium', 'high', 'critical'];

  return (
    <div className="relative p-6 lg:p-8 min-h-screen">
      {/* Background effects */}
      <div className="cyber-grid-bg fixed inset-0 pointer-events-none" />
      <div className="scanline-overlay fixed inset-0 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2 font-display tracking-wider">
              SECURITY <span className="text-neon-cyan">ALERTS</span>
            </h1>
            <p className="terminal-text text-slate-400 text-sm">
              &gt; Create and manage public safety advisories_
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="cyber-btn-solid px-5 py-2.5 font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
          >
            <Plus className="w-5 h-5" />
            Create Alert
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 font-mono text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Form Modal */}
        {showForm && (
          <div className="cyber-modal-overlay">
            <div className="cyber-modal cyber-frame w-full max-w-lg">
              <div className="border-b border-[rgba(56,189,248,0.15)] p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white font-mono">
                  {editingAlert ? '[ EDIT ALERT ]' : '[ NEW ALERT ]'}
                </h3>
                <button onClick={resetForm} className="text-slate-400 hover:text-cyber-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {actionError && (
                <div className="mx-6 mt-6 p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200 font-mono text-xs shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p>{actionError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 font-mono tracking-wide">
                    TITLE
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="cyber-input w-full"
                    placeholder="Alert title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 font-mono tracking-wide">
                    SEVERITY
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {severities.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, severity: s })}
                        className={`p-2 rounded border text-center capitalize font-mono text-sm transition-all duration-200 ${
                          formData.severity === s
                            ? 'bg-[rgba(56,189,248,0.1)] border-cyber-400 text-cyber-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                            : 'bg-dark-900/50 border-[rgba(56,189,248,0.1)] text-slate-400 hover:border-[rgba(56,189,248,0.3)] hover:text-slate-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 font-mono tracking-wide">
                    CONTENT
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={5}
                    className="cyber-input w-full resize-none"
                    placeholder="Alert content..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="cyber-btn px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="cyber-btn-solid px-6 py-2 font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : editingAlert ? 'Update Alert' : 'Create Alert'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Alerts List */}
        {loading ? (
          <div className="text-center py-12 terminal-text text-neon-cyan text-lg">
            &gt; Loading security alerts<span className="terminal-cursor" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="cyber-card cyber-frame rounded-xl p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-cyber-400/40 mx-auto mb-4" />
            <p className="text-slate-400 mb-4 terminal-text">&gt; No alerts created yet_</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-cyber-400 hover:text-cyber-300 font-medium font-mono tracking-wide transition-colors"
            >
              [ Create your first alert ]
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`cyber-card rounded-xl p-6 ${getSeverityGlow(alert.severity)} ${
                  alert.is_active
                    ? 'neon-border'
                    : 'opacity-50 border border-[rgba(56,189,248,0.05)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        alert.is_active
                          ? 'bg-[rgba(56,189,248,0.1)] border border-[rgba(56,189,248,0.2)]'
                          : 'bg-dark-900/50 border border-[rgba(56,189,248,0.05)]'
                      }`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 ${alert.is_active ? 'text-cyber-400' : 'text-slate-600'}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-lg font-semibold text-white font-mono">{alert.title}</h3>
                        <span
                          className={`cyber-badge text-xs px-2 py-1 rounded border capitalize ${getSeverityBadge(
                            alert.severity
                          )}`}
                        >
                          {alert.severity}
                        </span>
                        {!alert.is_active && (
                          <span className="cyber-badge text-xs px-2 py-1 rounded bg-slate-600/30 text-slate-500 border border-slate-600/50">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{alert.content}</p>
                      <p className="text-slate-600 text-xs font-mono">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => editAlert(alert)}
                      className="cyber-btn p-2 rounded-lg transition-all duration-200"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleAlertStatus(alert.id, alert.is_active)}
                      className={`text-sm px-3 py-1.5 rounded-lg font-mono border transition-all duration-200 ${
                        alert.is_active
                          ? 'bg-[rgba(255,170,0,0.1)] text-[#ffaa00] border-[rgba(255,170,0,0.3)] hover:bg-[rgba(255,170,0,0.2)] shadow-[0_0_8px_rgba(255,170,0,0.1)]'
                          : 'bg-[rgba(52,211,153,0.1)] text-matrix-400 border-[rgba(52,211,153,0.3)] hover:bg-[rgba(52,211,153,0.2)] shadow-[0_0_8px_rgba(52,211,153,0.1)]'
                      }`}
                    >
                      {alert.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="cyber-btn-danger p-2 rounded-lg transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
