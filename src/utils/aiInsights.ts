import { IncidentType } from '../types/database';
import { askGemini } from '../lib/gemini';

export async function analyzeIncidentWithGemini(
  description: string,
  severity: string,
  platform: string,
  indicators?: {
    attackerIp?: string | null;
    maliciousUrl?: string | null;
    cryptoWallet?: string | null;
  }
): Promise<{ riskScore: number; suggestedCategory: IncidentType }> {
  const systemInstruction = `You are an expert Ministry of Defence (MoD) cybersecurity AI analyst. Analyze the given incident report and return ONLY a valid JSON object with exactly two keys:
1. "riskScore": A number from 0 to 100 indicating the severity and risk level of the incident to national security. High risk = APT intrusion, state-sponsored attack, zero-day, secure comms compromise. Low risk = routine scanning, minor policy violation.
2. "suggestedCategory": Must be exactly one of these strings: "apt_intrusion", "network_malware", "insider_threat", "comms_interception", "zero_day", "unauthorized_device", "other".
Do not return any markdown formatting, backticks, or other text. Just the raw JSON object.`;

  let prompt = `Incident Details:
Severity Level: ${severity}
Platform/Network Segment: ${platform || 'Not specified'}
Description: ${description}`;

  if (indicators) {
    if (indicators.attackerIp) prompt += `\nAttacker IP: ${indicators.attackerIp}`;
    if (indicators.maliciousUrl) prompt += `\nMalicious URL/C2: ${indicators.maliciousUrl}`;
    if (indicators.cryptoWallet) prompt += `\nCrypto Wallet/Threat Actor ID: ${indicators.cryptoWallet}`;
  }

  try {
    const response = await askGemini(prompt, systemInstruction);
    const cleanResponse = response.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanResponse);

    const validCategories = ['apt_intrusion', 'network_malware', 'insider_threat', 'comms_interception', 'zero_day', 'unauthorized_device', 'other'];
    const suggestedCategory = validCategories.includes(parsed.suggestedCategory)
      ? (parsed.suggestedCategory as IncidentType)
      : 'other';

    const riskScore = typeof parsed.riskScore === 'number'
      ? Math.max(0, Math.min(100, parsed.riskScore))
      : 50;

    return { riskScore, suggestedCategory };
  } catch (error) {
    console.error('AI Analysis failed, falling back to defaults:', error);
    // Fallback logic
    return {
      riskScore: severity === 'critical' ? 95 : severity === 'high' ? 75 : severity === 'medium' ? 50 : 25,
      suggestedCategory: 'other',
    };
  }
}

export async function analyzeRawSecurityLogs(
  rawLogs: string
): Promise<{ anomaliesDetected: boolean; threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; mitigationSteps: string[]; summary: string }> {
  const systemInstruction = `You are a Zero-Trust AI Threat Intelligence engine for the Ministry of Defence. Your task is to ingest raw server logs, syslog, or firewall dumps and output a structured JSON analysis.
Return ONLY valid JSON with exactly these keys:
- "anomaliesDetected": boolean (true if malicious patterns are found).
- "threatLevel": string, exactly one of "LOW", "MEDIUM", "HIGH", "CRITICAL".
- "mitigationSteps": array of strings (military-style containment protocols, e.g., "Isolate Subnet 192.168.x.x", "Revoke VPN Certs").
- "summary": A 1-2 sentence executive summary of the threat.
No markdown, no backticks, just raw JSON.`;

  const prompt = `Raw Logs to Analyze:\n\n${rawLogs}`;

  try {
    const response = await askGemini(prompt, systemInstruction);
    const cleanResponse = response.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error('Log Analysis failed:', error);
    return {
      anomaliesDetected: false,
      threatLevel: 'LOW',
      mitigationSteps: ['Unable to parse logs via AI. Manual review required.'],
      summary: 'AI analysis failed due to formatting or network error.',
    };
  }
}

