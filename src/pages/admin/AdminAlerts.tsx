import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, AlertTriangle, X, Save } from 'lucide-react';
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

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAlerts(data);
    setLoading(false);
  }

  const resetForm = () => {
    setFormData({ title: '', content: '', severity: 'medium' });
    setEditingAlert(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingAlert) {
      const { error } = await supabase
        .from('alerts')
        .update({
          title: formData.title,
          content: formData.content,
          severity: formData.severity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingAlert.id);

      if (!error) {
        setAlerts(
          alerts.map((a) =>
            a.id === editingAlert.id
              ? { ...a, title: formData.title, content: formData.content, severity: formData.severity }
              : a
          )
        );
      }
    } else {
      const { data, error } = await supabase
        .from('alerts')
        .insert({
          author_id: user!.id,
          title: formData.title,
          content: formData.content,
          severity: formData.severity,
          is_active: true,
        })
        .select();

      if (!error && data) {
        setAlerts([data[0], ...alerts]);
      }
    }

    resetForm();
    setSaving(false);
  };

  const toggleAlertStatus = async (alertId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('alerts')
      .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
      .eq('id', alertId);

    if (!error) {
      setAlerts(
        alerts.map((a) =>
          a.id === alertId ? { ...a, is_active: !currentStatus } : a
        )
      );
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    const { error } = await supabase.from('alerts').delete().eq('id', alertId);
    if (!error) {
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

  const severities: Severity[] = ['low', 'medium', 'high', 'critical'];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Safety Alerts</h1>
          <p className="text-slate-400">Create and manage public safety advisories</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Alert
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg">
            <div className="border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {editingAlert ? 'Edit Alert' : 'Create New Alert'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                  placeholder="Alert title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Severity</label>
                <div className="grid grid-cols-4 gap-2">
                  {severities.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity: s })}
                      className={`p-2 rounded-lg border text-center capitalize ${
                        formData.severity === s
                          ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                          : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={5}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 resize-none"
                  placeholder="Alert content..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : editingAlert ? 'Update Alert' : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No alerts created yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-teal-400 hover:text-teal-300 font-medium"
          >
            Create your first alert
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-slate-800/50 border rounded-xl p-6 ${
                alert.is_active ? 'border-slate-700' : 'border-slate-700/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.is_active ? 'bg-teal-500/10' : 'bg-slate-700/30'
                    }`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 ${alert.is_active ? 'text-teal-400' : 'text-slate-500'}`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded border capitalize ${getSeverityBadge(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                      {!alert.is_active && (
                        <span className="text-xs px-2 py-1 rounded bg-slate-600 text-slate-300">Inactive</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{alert.content}</p>
                    <p className="text-slate-500 text-xs">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editAlert(alert)}
                    className="text-slate-400 hover:text-teal-400 p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleAlertStatus(alert.id, alert.is_active)}
                    className={`text-sm px-3 py-1.5 rounded-lg ${
                      alert.is_active
                        ? 'bg-yellow-500/10 text-yellow-300'
                        : 'bg-green-500/10 text-green-300'
                    }`}
                  >
                    {alert.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
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
  );
}
