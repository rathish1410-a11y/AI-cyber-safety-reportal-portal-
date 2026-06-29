import React, { useState } from 'react';
import { TerminalSquare, ShieldAlert, Cpu, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { analyzeRawSecurityLogs } from '../../utils/aiInsights';

export default function AdminLogAnalyzer() {
  const [logs, setLogs] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    anomaliesDetected: boolean;
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    mitigationSteps: string[];
    summary: string;
  } | null>(null);

  const handleAnalyze = async () => {
    if (!logs.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const analysis = await analyzeRawSecurityLogs(logs);
      setResult(analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500 border-red-500 bg-red-500/10';
      case 'HIGH': return 'text-orange-500 border-orange-500 bg-orange-500/10';
      case 'MEDIUM': return 'text-yellow-500 border-yellow-500 bg-yellow-500/10';
      case 'LOW': return 'text-green-500 border-green-500 bg-green-500/10';
      default: return 'text-slate-400 border-slate-600 bg-dark-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 font-display tracking-wider uppercase flex items-center gap-3">
            <TerminalSquare className="w-8 h-8 text-cyber-400" />
            Zero-Trust Log Analyzer (ATI)
          </h1>
          <p className="text-slate-400">Ingest raw security logs for automated threat intelligence analysis.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="bg-dark-900/60 p-6 rounded-xl border border-white/10 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 mb-4 text-cyber-400">
            <Activity className="w-5 h-5" />
            <h2 className="font-semibold uppercase tracking-wider">Raw Input Stream</h2>
          </div>
          <textarea
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder="Paste raw syslog, firewall drops, or server access logs here..."
            className="w-full h-96 bg-dark-950/80 border border-white/5 rounded-lg p-4 text-slate-300 font-mono text-xs focus:border-cyber-400/50 focus:ring-1 focus:ring-cyber-400/50 transition-all placeholder:text-slate-600"
          ></textarea>
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !logs.trim()}
            className="w-full mt-4 bg-cyber-500 hover:bg-cyber-400 text-dark-950 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_15px_rgba(56,189,248,0.4)]"
          >
            {isAnalyzing ? (
              <>
                <Cpu className="w-5 h-5 animate-spin" />
                Processing Telemetry...
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Initialize Threat Analysis
              </>
            )}
          </button>
        </div>

        {/* Output Column */}
        <div className="bg-dark-900/60 p-6 rounded-xl border border-white/10 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-cyber-400">
            <Cpu className="w-5 h-5" />
            <h2 className="font-semibold uppercase tracking-wider">Automated Threat Intelligence</h2>
          </div>

          {!result && !isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
              <TerminalSquare className="w-16 h-16 opacity-20" />
              <p>Awaiting raw log stream for analysis...</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-cyber-400 space-y-4 animate-pulse">
              <Cpu className="w-16 h-16 animate-spin" />
              <p className="font-mono text-sm uppercase tracking-widest">Running ML Signatures...</p>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className={`p-4 border rounded-lg flex items-start gap-4 ${getThreatColor(result.threatLevel)}`}>
                {result.threatLevel === 'CRITICAL' || result.threatLevel === 'HIGH' ? (
                  <AlertTriangle className="w-8 h-8 shrink-0 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-8 h-8 shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-lg mb-1 tracking-wider">
                    THREAT LEVEL: {result.threatLevel}
                  </h3>
                  <p className="text-sm opacity-90">{result.summary}</p>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2 uppercase tracking-wide text-sm">
                  <ShieldAlert className="w-4 h-4 text-cyber-400" />
                  Recommended Containment Protocols
                </h3>
                <ul className="space-y-2">
                  {result.mitigationSteps.map((step, idx) => (
                    <li key={idx} className="bg-dark-800/50 p-3 rounded border border-white/5 text-sm text-slate-300 font-mono flex gap-3">
                      <span className="text-cyber-400">[{idx + 1}]</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-3 bg-dark-950 rounded border border-white/5">
                <span className="text-xs text-slate-500 font-mono uppercase">System Diagnostic: </span>
                <span className="text-xs text-slate-300 font-mono">
                  {result.anomaliesDetected ? "Anomalous patterns confirmed in dataset." : "No significant deviations detected."}
                </span>
              </div>
              {/* Invisible spacer to prevent chatbot overlap */}
              <div className="h-24 w-full shrink-0"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
