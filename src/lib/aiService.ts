import { askGemini } from './gemini';

/* ─── Smart Incident Analyzer ─── */
export interface AIIncidentAnalysis {
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  reasoning: string;
  keywords: string[];
  recommendations: string[];
  confidence: number;
}

export async function analyzeIncident(description: string, title: string): Promise<AIIncidentAnalysis> {
  const prompt = `You are a cybersecurity AI expert for India's National Cyber Safety Portal (SIH25183).
Analyze this cyber incident report and respond ONLY with valid JSON.

Title: "${title}"
Description: "${description}"

Respond with this exact JSON structure:
{
  "incidentType": "phishing|fraud|hacking|harassment|identity_theft|malware|other",
  "severity": "low|medium|high|critical",
  "riskScore": <number 0-100>,
  "reasoning": "<1-2 sentence explanation of why you chose these values>",
  "keywords": ["<detected red-flag keyword 1>", "<keyword 2>", "<keyword 3>"],
  "recommendations": ["<immediate action 1>", "<action 2>", "<action 3>"],
  "confidence": <number 0-100>
}`;

  try {
    const raw = await askGemini(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as AIIncidentAnalysis;
  } catch {}

  // Fallback
  return {
    incidentType: 'other', severity: 'medium', riskScore: 50,
    reasoning: 'Could not analyze automatically. Please fill in manually.',
    keywords: [], recommendations: ['Document all evidence', 'Contact cybercrime helpline 1930'],
    confidence: 0,
  };
}

/* ─── Phishing Detector ─── */
export interface PhishingAnalysis {
  verdict: 'safe' | 'suspicious' | 'dangerous';
  threatScore: number;
  redFlags: string[];
  explanation: string;
  recommendation: string;
  category: string;
}

export async function analyzePhishing(input: string): Promise<PhishingAnalysis> {
  const prompt = `You are a cybersecurity expert specialized in phishing detection for India's cyber safety portal.
Analyze this URL or email text for phishing/scam indicators. Respond ONLY with valid JSON.

Input: "${input}"

Respond with:
{
  "verdict": "safe|suspicious|dangerous",
  "threatScore": <0-100>,
  "redFlags": ["<specific red flag 1>", "<red flag 2>", "<red flag 3>"],
  "explanation": "<2-3 sentence analysis>",
  "recommendation": "<what the user should do>",
  "category": "<type: phishing|scam|malware|legitimate|unknown>"
}`;

  try {
    const raw = await askGemini(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as PhishingAnalysis;
  } catch {}

  return {
    verdict: 'suspicious', threatScore: 50, redFlags: ['Unable to analyze'],
    explanation: 'Analysis failed. Treat this with caution.',
    recommendation: 'Do not click any links. Contact cybercrime helpline 1930.',
    category: 'unknown',
  };
}

/* ─── Admin Report Generator ─── */
export interface AdminReport {
  summary: string;
  criticalFindings: string[];
  topIncidentTypes: string;
  riskLevel: string;
  recommendedActions: string[];
  alertDraft: string;
}

export async function generateAdminReport(incidents: any[]): Promise<AdminReport> {
  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    high: incidents.filter(i => i.severity === 'high').length,
    pending: incidents.filter(i => i.status === 'pending').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    types: [...new Set(incidents.map(i => i.incident_type))].join(', '),
    avgRisk: incidents.length ? Math.round(incidents.reduce((s, i) => s + (i.ai_risk_score || 0), 0) / incidents.length) : 0,
  };

  const prompt = `You are a cybersecurity analyst for India's National Cyber Safety Portal (SIH25183).
Generate an executive incident report based on this data. Respond ONLY with valid JSON.

Data: ${JSON.stringify(stats)}

Respond with:
{
  "summary": "<2-3 sentence executive summary>",
  "criticalFindings": ["<finding 1>", "<finding 2>", "<finding 3>"],
  "topIncidentTypes": "<description of dominant incident types>",
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "recommendedActions": ["<action 1>", "<action 2>", "<action 3>"],
  "alertDraft": "<draft text for a public safety alert based on these incidents>"
}`;

  try {
    const raw = await askGemini(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as AdminReport;
  } catch {}

  return {
    summary: `${stats.total} incidents recorded. ${stats.critical} critical cases require immediate attention.`,
    criticalFindings: [`${stats.critical} critical severity incidents`, `${stats.pending} pending review`, `Average risk score: ${stats.avgRisk}%`],
    topIncidentTypes: stats.types,
    riskLevel: stats.critical > 2 ? 'CRITICAL' : stats.high > 3 ? 'HIGH' : 'MEDIUM',
    recommendedActions: ['Review all critical incidents immediately', 'Issue public safety advisory', 'Escalate to CERT-In'],
    alertDraft: `Security Advisory: Multiple cyber incidents have been reported. Citizens are advised to remain vigilant and report suspicious activity to helpline 1930.`,
  };
}
