import { IncidentType } from '../types/database';

const incidentKeywords: Record<IncidentType, string[]> = {
  phishing: ['phishing', 'email', 'link', 'fake', 'impersonat', 'credential', 'password', 'login', 'bank', 'account verified', 'suspended', 'click here', 'urgent'],
  fraud: ['fraud', 'scam', 'money', 'payment', 'transaction', 'transfer', 'investment', 'lottery', 'prize', 'refund', 'fake product', 'selling'],
  hacking: ['hack', 'unauthorized', 'access', 'breach', 'compromised', 'intrusion', 'vulnerability', 'exploit', 'backdoor', 'remote', 'control'],
  harassment: ['harass', 'threat', 'abuse', 'stalking', 'bully', 'offensive', 'hate', 'discriminat', 'sexual', 'message', 'repeated'],
  identity_theft: ['identity', 'stolen', 'ssn', 'pan', 'aadhaar', 'personal information', 'impersonat', 'credit', 'loan', 'account opened'],
  malware: ['malware', 'virus', 'trojan', 'ransomware', 'spyware', 'adware', 'infected', 'download', 'attach', 'executable', 'slow', 'popup'],
  other: [],
};

export function calculateAIRiskScore(description: string, severity: string): number {
  const descLower = description.toLowerCase();
  let score = severity === 'critical' ? 80 : severity === 'high' ? 60 : severity === 'medium' ? 40 : 20;

  const highRiskKeywords = ['bank', 'financial', 'password', 'ssn', 'identity', 'unauthorized access', 'money', 'ransom'];
  const mediumRiskKeywords = ['click', 'email', 'download', 'account', 'personal'];

  highRiskKeywords.forEach(keyword => {
    if (descLower.includes(keyword)) score += 10;
  });
  mediumRiskKeywords.forEach(keyword => {
    if (descLower.includes(keyword)) score += 5;
  });

  return Math.min(100, score);
}

export function suggestIncidentCategory(description: string): IncidentType {
  const descLower = description.toLowerCase();
  const scores: Record<IncidentType, number> = {
    phishing: 0,
    fraud: 0,
    hacking: 0,
    harassment: 0,
    identity_theft: 0,
    malware: 0,
    other: 0,
  };

  Object.entries(incidentKeywords).forEach(([type, keywords]) => {
    keywords.forEach(keyword => {
      if (descLower.includes(keyword)) {
        scores[type as IncidentType] += 1;
      }
    });
  });

  let maxScore = 0;
  let maxType: IncidentType = 'other';
  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxType = type as IncidentType;
    }
  });

  return maxType;
}
