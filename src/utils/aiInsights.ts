import { IncidentType } from '../types/database';
import { askGemini } from '../lib/gemini';

export async function analyzeIncidentWithGemini(
  description: string,
  severity: string,
  platform: string
): Promise<{ riskScore: number; suggestedCategory: IncidentType }> {
  const systemInstruction = `You are an expert cybersecurity AI. Analyze the given incident report and return ONLY a valid JSON object with exactly two keys:
1. "riskScore": A number from 0 to 100 indicating the severity and risk level of the incident. High risk = data loss, financial loss, identity theft, ransomware. Low risk = spam, minor harassment.
2. "suggestedCategory": Must be exactly one of these strings: "phishing", "fraud", "hacking", "harassment", "identity_theft", "malware", "other".
Do not return any markdown formatting, backticks, or other text. Just the raw JSON object.`;

  const prompt = `Incident Details:
Severity Level: ${severity}
Platform/App: ${platform || 'Not specified'}
Description: ${description}`;

  try {
    const response = await askGemini(prompt, systemInstruction);
    const cleanResponse = response.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanResponse);

    const validCategories = ['phishing', 'fraud', 'hacking', 'harassment', 'identity_theft', 'malware', 'other'];
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
      riskScore: severity === 'critical' ? 80 : severity === 'high' ? 60 : severity === 'medium' ? 40 : 20,
      suggestedCategory: 'other',
    };
  }
}

