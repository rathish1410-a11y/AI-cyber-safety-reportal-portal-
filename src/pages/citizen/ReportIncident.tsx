import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileWarning, AlertCircle, CheckCircle, Upload, Brain, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { IncidentType, Severity } from '../../types/database';
import { calculateAIRiskScore, suggestIncidentCategory } from '../../utils/aiInsights';

const incidentTypes: { value: IncidentType; label: string }[] = [
  { value: 'phishing', label: 'Phishing' },
  { value: 'fraud', label: 'Fraud / Scam' },
  { value: 'hacking', label: 'Hacking / Unauthorized Access' },
  { value: 'harassment', label: 'Harassment / Cyberbullying' },
  { value: 'identity_theft', label: 'Identity Theft' },
  { value: 'malware', label: 'Malware / Ransomware' },
  { value: 'other', label: 'Other' },
];

const severityLevels: { value: Severity; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'Minor inconvenience, no significant damage' },
  { value: 'medium', label: 'Medium', description: 'Some financial or data loss possible' },
  { value: 'high', label: 'High', description: 'Significant risk to personal data or finances' },
  { value: 'critical', label: 'Critical', description: 'Urgent threat requiring immediate attention' },
];

export default function ReportIncident() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [incidentType, setIncidentType] = useState<IncidentType>('other');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [aiInsight, setAiInsight] = useState<{
    riskScore: number;
    suggestedCategory: IncidentType;
  } | null>(null);

  // Generate AI insight when description changes
  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (value.length > 20) {
      const riskScore = calculateAIRiskScore(value, severity);
      const suggestedCategory = suggestIncidentCategory(value);
      setAiInsight({ riskScore, suggestedCategory });
    } else {
      setAiInsight(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let fileUrl: string | null = null;

    // Upload file if selected
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('incident-files')
        .upload(fileName, file);

      if (uploadError) {
        setError('Failed to upload file. Please try again.');
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('incident-files')
        .getPublicUrl(fileName);
      fileUrl = publicUrl;
    }

    // Calculate AI insights for final submission
    const riskScore = calculateAIRiskScore(description, severity);
    const suggestedCategory = suggestIncidentCategory(description);

    const { error: insertError } = await supabase.from('incidents').insert({
      user_id: user!.id,
      title,
      incident_type: incidentType,
      severity,
      description,
      file_url: fileUrl,
      ai_risk_score: riskScore,
      ai_suggested_category: suggestedCategory,
      status: 'pending',
    });

    if (insertError) {
      setError('Failed to submit incident. Please try again.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/dashboard/incidents'), 2000);
  };

  if (success) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted!</h2>
          <p className="text-slate-400">Redirecting to your incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Report a Cyber Incident</h1>
        <p className="text-slate-400">Provide details about the cyber incident you've encountered</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Title */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Incident Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief title describing the incident"
            required
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Incident Type */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Type of Incident
          </label>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {incidentTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setIncidentType(type.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  incidentType === type.value
                    ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                    : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Severity Level
          </label>
          <div className="space-y-3">
            {severityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setSeverity(level.value)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  severity === level.value
                    ? 'bg-teal-500/10 border-teal-500'
                    : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${severity === level.value ? 'text-teal-400' : 'text-white'}`}>
                    {level.label}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < severityLevels.findIndex((l) => l.value === severity) + 1
                            ? 'bg-teal-400'
                            : 'bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-400 text-sm">{level.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Incident Description
          </label>
          <textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Describe what happened in detail. Include relevant information like websites, emails, phone numbers, etc."
            required
            rows={6}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
          />

          {/* AI Insight */}
          {aiInsight && (
            <div className="mt-4 p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-teal-400" />
                <span className="text-teal-400 font-medium">AI Insight</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Risk Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all"
                        style={{ width: `${aiInsight.riskScore}%` }}
                      />
                    </div>
                    <span className="text-white font-medium">{aiInsight.riskScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Suggested Category</p>
                  <p className="text-white capitalize">
                    {aiInsight.suggestedCategory.replace('_', ' ')}
                    {aiInsight.suggestedCategory !== incidentType && (
                      <button
                        type="button"
                        onClick={() => setIncidentType(aiInsight.suggestedCategory)}
                        className="ml-2 text-teal-400 text-sm hover:underline"
                      >
                        (Apply)
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Attach Screenshot / File (Optional)
          </label>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept="image/*,.pdf"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer"
            >
              <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              {file ? (
                <p className="text-teal-400 font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="text-slate-300 mb-1">Click to upload or drag and drop</p>
                  <p className="text-slate-500 text-sm">PNG, JPG, PDF up to 10MB</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title || !description}
            className="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
