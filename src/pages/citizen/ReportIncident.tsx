import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Upload, Brain, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { IncidentType, Severity } from '../../types/database';
import { analyzeIncidentWithGemini } from '../../utils/aiInsights';

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

const severityDotColors = ['bg-matrix-400', 'bg-amber-400', 'bg-orange-500', 'bg-danger-400'];
const severityGlowColors = ['shadow-[0_0_6px_rgba(0,255,136,0.6)]', 'shadow-[0_0_6px_rgba(255,170,0,0.6)]', 'shadow-[0_0_6px_rgba(249,115,22,0.6)]', 'shadow-[0_0_6px_rgba(255,0,64,0.6)]'];

export default function ReportIncident() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [incidentType, setIncidentType] = useState<IncidentType>('other');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [platform, setPlatform] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [financialLoss, setFinancialLoss] = useState('');
  const [attackerIp, setAttackerIp] = useState('');
  const [maliciousUrl, setMaliciousUrl] = useState('');
  const [cryptoWallet, setCryptoWallet] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Submitting...');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const handleDescriptionChange = (value: string) => {
    setDescription(value);
  };

  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected && selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(selected);
    } else {
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Calculate AI insights using Gemini
      setLoadingText('AI Analyzing Incident...');
      const { riskScore, suggestedCategory } = await analyzeIncidentWithGemini(description, severity, platform, {
        attackerIp: attackerIp || null,
        maliciousUrl: maliciousUrl || null,
        cryptoWallet: cryptoWallet || null
      });

      // Upload file to Supabase Storage if a file is selected
      setLoadingText('Uploading files...');
      let fileUrl: string | null = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('incident-files')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('File upload error:', uploadError);
          setError(`Screenshot upload failed: ${uploadError.message}. Your report will still be submitted without the file.`);
          // Wait 3 seconds so user sees the warning, then continue
          await new Promise(r => setTimeout(r, 3000));
          setError(null);
        } else {
          const { data: urlData } = supabase.storage
            .from('incident-files')
            .getPublicUrl(fileName);
          fileUrl = urlData?.publicUrl || null;
        }
      }

      setLoadingText('Saving report...');
      // Insert incident with file URL
      const { error: insertError } = await supabase.from('incidents').insert({
        user_id: user!.id,
        title,
        incident_type: incidentType,
        severity,
        description,
        phone_number: phoneNumber || null,
        platform: platform || null,
        incident_date: incidentDate || null,
        financial_loss: financialLoss || null,
        attacker_ip: attackerIp || null,
        malicious_url: maliciousUrl || null,
        crypto_wallet: cryptoWallet || null,
        file_url: fileUrl,
        ai_risk_score: riskScore,
        ai_suggested_category: suggestedCategory,
        status: 'pending',
      });

      if (insertError) {
        console.error("Supabase Insert Error:", insertError);
        setError(`Submission failed: ${insertError.message} - Please ensure your Supabase database schema is up to date.`);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/dashboard/incidents'), 2000);
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError(err.message || 'An unexpected error occurred while submitting the report.');
      setLoading(false);
    }
  };


  if (success) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[80vh] relative">
        <div className="scanline-overlay" />
        <div className="cyber-card cyber-frame p-10 text-center relative z-10">
          <div className="w-16 h-16 bg-matrix-400/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,255,136,0.3)]">
            <CheckCircle className="w-8 h-8 text-neon-green" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2 tracking-wider">REPORT SUBMITTED</h2>
          <p className="text-slate-400 font-mono text-sm">Redirecting to your incidents<span className="terminal-cursor" /></p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto relative">
      <div className="scanline-overlay" />

      <div className="mb-8 relative z-10">
        <h1 className="text-2xl font-display font-bold text-white mb-2 tracking-widest">REPORT CYBER INCIDENT</h1>
        <p className="text-slate-400 font-mono text-sm">Provide details about the cyber incident you've encountered</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {error && (
          <div className="glow-red bg-danger-400/5 border border-danger-400/30 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-danger-400 flex-shrink-0" />
            <p className="text-danger-400 text-sm font-mono">{error}</p>
          </div>
        )}

        {/* Title */}
        <div className="cyber-card cyber-frame p-6">
          <label className="block text-sm font-mono font-medium text-cyber-400 mb-2 uppercase tracking-wider">
            Incident Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief title describing the incident"
            required
            className="cyber-input w-full"
          />
        </div>

        {/* Incident Type */}
        <div className="cyber-card cyber-frame p-6">
          <label className="block text-sm font-mono font-medium text-cyber-400 mb-3 uppercase tracking-wider">
            Type of Incident
          </label>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {incidentTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setIncidentType(type.value)}
                className={`p-3 rounded-lg border text-left transition-all font-mono text-sm ${
                  incidentType === type.value
                    ? 'bg-cyber-400/10 border-cyber-400 text-cyber-400 shadow-[0_0_10px_rgba(56,189,248,0.15)]'
                    : 'bg-dark-900/60 border-[rgba(56,189,248,0.1)] text-slate-300 hover:border-cyber-400/40 hover:bg-cyber-400/5'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div className="cyber-card cyber-frame p-6">
          <label className="block text-sm font-mono font-medium text-cyber-400 mb-3 uppercase tracking-wider">
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
                    ? 'bg-cyber-400/10 border-cyber-400 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                    : 'bg-dark-900/60 border-[rgba(56,189,248,0.1)] hover:border-cyber-400/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-mono font-medium tracking-wide ${severity === level.value ? 'text-cyber-400' : 'text-white'}`}>
                    {level.label}
                  </span>
                  <div className="flex gap-1.5">
                    {[...Array(4)].map((_, i) => {
                      const activeIdx = severityLevels.findIndex((l) => l.value === severity);
                      const isActive = i <= activeIdx;
                      return (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            isActive
                              ? `${severityDotColors[i]} ${severityGlowColors[i]} animate-pulse`
                              : 'bg-slate-700'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-mono">{level.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Info: Phone Number */}
        <div className="cyber-card cyber-frame p-6">
          <label className="block text-sm font-mono font-medium text-cyber-400 mb-2 uppercase tracking-wider">
            Contact Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. +91 9876543210 (Optional)"
            className="cyber-input w-full"
          />
        </div>

        {/* Platform of Incident */}
        <div className="cyber-card cyber-frame p-6">
          <label className="block text-sm font-mono font-medium text-cyber-400 mb-2 uppercase tracking-wider">
            Platform / Medium
          </label>
          <input
            type="text"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="e.g. WhatsApp, Facebook, Bank Website (Optional)"
            className="cyber-input w-full"
          />
        </div>

        {/* Incident Date & Financial Loss */}
        <div className="grid sm:grid-cols-2 gap-8">
          <div className="cyber-card cyber-frame p-6">
            <label className="block text-sm font-mono font-medium text-cyber-400 mb-2 uppercase tracking-wider">
              Date of Incident
            </label>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="cyber-input w-full"
            />
          </div>

          <div className="cyber-card cyber-frame p-6">
            <label className="block text-sm font-mono font-medium text-cyber-400 mb-2 uppercase tracking-wider">
              Financial Loss Amount
            </label>
            <input
              type="text"
              value={financialLoss}
              onChange={(e) => setFinancialLoss(e.target.value)}
              placeholder="e.g. ₹ 50,000 (Optional)"
              className="cyber-input w-full"
            />
          </div>
        </div>

        {/* Description */}
        <div className="cyber-card cyber-frame p-6">
          <label className="block text-sm font-mono font-medium text-cyber-400 mb-2 uppercase tracking-wider">
            Incident Description
          </label>
          <textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Describe what happened in detail. Include relevant information like websites, emails, phone numbers, etc."
            required
            rows={6}
            className="cyber-input w-full resize-none"
          />

        </div>

        {/* Technical Indicators */}
        <div className="cyber-card cyber-frame p-6">
          <label className="block text-sm font-mono font-medium text-cyber-400 mb-4 uppercase tracking-wider">
            Technical Indicators (Optional)
          </label>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">Attacker IP</label>
              <input
                type="text"
                value={attackerIp}
                onChange={(e) => setAttackerIp(e.target.value)}
                placeholder="e.g. 192.168.1.1"
                className="cyber-input w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">Malicious URL</label>
              <input
                type="text"
                value={maliciousUrl}
                onChange={(e) => setMaliciousUrl(e.target.value)}
                placeholder="e.g. http://fake-site.com"
                className="cyber-input w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">Crypto Wallet</label>
              <input
                type="text"
                value={cryptoWallet}
                onChange={(e) => setCryptoWallet(e.target.value)}
                placeholder="e.g. bc1q..."
                className="cyber-input w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="cyber-card cyber-frame p-6">
          <label className="block text-sm font-mono font-medium text-cyber-400 mb-2 uppercase tracking-wider">
            Attach Screenshot / File (Optional)
          </label>
          <div className="border-2 border-dashed border-[rgba(56,189,248,0.2)] rounded-lg p-8 text-center hover:border-cyber-400/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.1)] transition-all duration-300 bg-dark-900/40">
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer"
            >
              <Upload className="w-10 h-10 text-cyber-400/40 mx-auto mb-3" />
              {file ? (
                <p className="text-cyber-400 font-mono font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="text-slate-300 mb-1 font-mono text-sm">Click to upload or drag and drop</p>
                  <p className="text-slate-600 text-xs font-mono">PNG, JPG, PDF up to 10MB</p>
                </>
              )}
            </label>
            {filePreview && (
              <div className="mt-4 border border-cyber-400/20 rounded-lg overflow-hidden inline-block">
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-h-48 max-w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="cyber-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title || !description}
            className="cyber-btn-solid disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-cyber-400/30 border-t-cyber-400 rounded-full animate-spin" />
                {loadingText}
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
