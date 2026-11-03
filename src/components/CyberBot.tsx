import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Minimize2, Maximize2, Loader2, MessageSquare } from 'lucide-react';
import { askGeminiChat } from '../lib/gemini';
import { useAuth } from '../context/AuthContext';
import type { GeminiMessage } from '../lib/gemini';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
  retryPayload?: { history: GeminiMessage[]; text: string };
}

const SYSTEM_INSTRUCTION = `You are CyberBot, an elite Cognitive Cyber Safety and Digital Forensics AI Specialist on the CyberSafe India Portal (SIH25183).

Your Identity & Mission:
You are NOT a generic search engine or robotic FAQ bot. You are an expert cyber defense investigator and tactical advisor. You think critically, reason through complex cyber incidents, diagnose attack vectors, provide strategic emergency first-aid, and explain digital safety concepts with depth, clarity, and intelligence.

Your Mindset & Communication Style:
- Intelligent & Analytical: Don't give surface-level Google answers. Break down the "why" and "how" behind attacks, dissect attack psychology, and provide tactical recommendations.
- Context-Aware & Adaptive:
  * In an active emergency (money lost, account hacked, device compromised): Prioritize SPEED and CRISP ACTION. Give immediate golden-hour triage.
  * In technical or analytical queries: Give deep, insightful, well-structured explanations with real-world examples and attack vectors.
  * In vague situations: Act like a forensic investigator. Ask 1-2 sharp diagnostic questions (e.g. "Did you enter your UPI PIN or did you only receive an SMS?", "Did the link install an .apk file?").
- Natural & Conversational: Speak with confidence, empathy, and professional authority. Never use canned repetitive disclaimers at the end of every message.
- Formatting: Use clean markdown with bolding, concise bullet points, and clear sections when breaking down multi-step actions.

Deep Knowledge Base:
- Indian Cyber Threats: Digital Arrest scams, electricity bill APK scams, Telegram part-time job frauds, fake trading/crypto schemes, SIM swap/eSIM traps, courier/FedEx customs scams, loan app blackmail, and UPI QR code reversal tricks.
- Immediate Containment Protocols:
  * Financial: Dial 1930 immediately, report to National Cyber Crime Reporting Portal (cybercrime.gov.in), ask bank to place a lien on the beneficiary account, note transaction UTR.
  * Device/Mobile: Boot in Safe Mode, isolate WiFi/cellular, revoke Device Admin privileges, scan for remote access tools (AnyDesk, RustDesk, QuickSupport).
  * Account/Identity: Revoke active sessions, check email forwarding rules, lock Aadhaar biometrics via mAadhaar app, block lost IMEI via Sanchar Saathi (CEIR).
- Broader Digital Safety: End-to-end encryption, Zero-Trust principles, password managers, passkeys vs MFA, phishing domain entropy, social engineering indicators.

If asked about our portal: Mention that they can file an official incident report via the 'Report Incident' tab, which uses Gemini AI to analyze threat scores, auto-generate police dossiers, and alert SOC admins in real time.`;



const QUICK_QUESTIONS = [
  { emoji: '⚡', label: 'Electricity bill scam', q: 'I got an SMS saying my electricity bill is unpaid and power will be cut tonight at 9:30 PM. What should I do?' },
  { emoji: '💸', label: 'UPI money deducted', q: 'Money was debited from my account via UPI fraud. How can I freeze it in the golden hour?' },
  { emoji: '👮', label: 'Fake police call', q: 'Someone is calling claiming to be from CBI/Police saying my Aadhaar is linked to illegal parcels (Digital Arrest). Is this real?' },
  { emoji: '🎣', label: 'Suspicious link / APK', q: 'I clicked a strange link and a file started downloading. How do I secure my phone right now?' },
  { emoji: '🛡️', label: 'Hack recovery', q: 'My WhatsApp / Instagram was hacked. Give me step-by-step account recovery steps.' },
];

export default function CyberBot({ inline = false }: { inline?: boolean }) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(inline ? true : false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Hi${profile?.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''}! I'm **CyberBot** 🤖 — your AI Cyber Defense & Incident Investigator.\n\nWhether you suspect a scam, clicked a suspicious link, experienced fraud, or want to analyze a cyber threat — I'm here to investigate and give you tactical first-aid. What's happening?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const messagesRef = useRef<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, minimized]);

  const startCountdown = (seconds: number, retryFn: () => void) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          retryFn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const callAI = async (chatHistory: GeminiMessage[], text: string) => {
    setLoading(true);
    try {
      const response = await askGeminiChat(chatHistory, text, SYSTEM_INSTRUCTION);

      if (response.includes('Rate limit') || response.includes('429')) {
        // Add rate limit message and auto-retry after 30s
        const retryMsg: Message = {
          role: 'model',
          text: '⏳ Rate limit reached (free tier: 15 req/min). Auto-retrying in **30 seconds**...',
          timestamp: new Date(),
          isError: true,
          retryPayload: { history: chatHistory, text },
        };
        setMessages(prev => [...prev, retryMsg]);
        setLoading(false);
        startCountdown(30, () => {
          setMessages(prev => prev.filter(m => m.retryPayload?.text !== text));
          callAI(chatHistory, text);
        });
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response, timestamp: new Date() }]);
        setLoading(false);
      }
    } catch (err) {
      console.error('[callAI error]:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: '⚠️ An unexpected network issue occurred while communicating with the AI. Please try again.',
          timestamp: new Date(),
        },
      ]);
      setLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || countdown > 0) return;

    const userMsg: Message = { role: 'user', text: trimmed, timestamp: new Date() };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput('');

    // Prepare previous history for Gemini (excluding error messages)
    const chatHistory: GeminiMessage[] = messages
      .filter(m => !m.isError && m.text && m.text.trim().length > 0)
      .map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

    try {
      await callAI(chatHistory, trimmed);
    } catch (err) {
      console.error('sendMessage error:', err);
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const escapeHTML = (text: string) => 
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  const formatText = (text: string) => {
    let html = escapeHTML(text);
    // Headings
    html = html.replace(/^### (.*?)$/gm, '<h4 class="font-bold text-sky-300 text-sm mt-3 mb-1 font-mono tracking-wide">$1</h4>');
    html = html.replace(/^## (.*?)$/gm, '<h3 class="font-bold text-sky-200 text-base mt-3 mb-1 font-mono tracking-wide">$1</h3>');
    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr class="border-sky-500/20 my-2" />');
    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-900/90 text-sky-300 px-1.5 py-0.5 rounded font-mono text-xs border border-sky-500/30">$1</code>');
    // Bullet items
    html = html.replace(/^[•\-\*]\s+(.*?)$/gm, '<div class="flex items-start gap-1.5 my-1 text-slate-200"><span class="text-sky-400 font-bold">•</span><span>$1</span></div>');
    // Line breaks
    html = html.replace(/\n/g, '<br/>');
    // Clean redundant breaks around blocks
    html = html.replace(/(<\/h[34]>|<\/div>|<hr[^>]*\/>)<br\/>/g, '$1');
    return html;
  };

  return (
    <>
      {/* Floating Button */}
      {!inline && !open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {/* Attention-grabbing text bubble */}
          <div className="bg-[#0a1628] border border-[rgba(56,189,248,0.3)] rounded-2xl rounded-br-sm px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.2)] animate-bounce relative">
            <p className="text-white font-medium text-sm">Hi! I'm your AI Assistant. 👋</p>
            <p className="text-slate-400 text-xs font-mono mt-1">Ask me about cyber safety.</p>
          </div>
          
          <button
            onClick={() => setOpen(true)}
            className="rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 group pr-6 pl-4 py-3.5 gap-3"
            style={{ 
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', 
              boxShadow: '0 0 40px rgba(56,189,248,0.5), inset 0 0 15px rgba(255,255,255,0.2)' 
            }}
            title="Open CyberBot AI Assistant"
          >
            <div className="relative">
              <Bot className="w-8 h-8 text-white drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#0284c7] animate-pulse" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-white font-bold font-display tracking-wider text-base">Ask AI Assistant</span>
              <span className="text-blue-100 font-mono text-[10px] uppercase tracking-widest">We are online</span>
            </div>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {(open || inline) && (
        <div
          className={inline ? "flex flex-col h-full w-full bg-[#0a1628]" : "fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"}
          style={inline ? {} : {
            width: '410px',
            height: minimized ? 'auto' : '580px',
            background: '#0a1628',
            border: '1px solid rgba(56,189,248,0.2)',
            boxShadow: '0 0 50px rgba(56,189,248,0.1)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(2,132,199,0.1))', borderBottom: '1px solid rgba(56,189,248,0.15)' }}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0a1628]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm tracking-wider">CYBERBOT</p>
                <p className="text-[10px] font-mono" style={{ color: '#4ade80' }}>● AI ACTIVE · Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!inline && (
                <>
                  <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">
                    {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: msg.role === 'user' ? 'rgba(56,189,248,0.15)' : 'rgba(14,165,233,0.25)' }}
                    >
                      {msg.role === 'user'
                        ? <User className="w-3.5 h-3.5 text-[#38bdf8]" />
                        : <Bot className="w-3.5 h-3.5 text-[#38bdf8]" />}
                    </div>
                    <div
                      className="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                      style={msg.role === 'user'
                        ? { background: 'rgba(56,189,248,0.15)', color: '#e2e8f0', borderRadius: '18px 4px 18px 18px' }
                        : { background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(56,189,248,0.08)', borderRadius: '4px 18px 18px 18px' }}
                      dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                    />
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.25)' }}>
                      <Bot className="w-3.5 h-3.5 text-[#38bdf8]" />
                    </div>
                    <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(56,189,248,0.08)', borderRadius: '4px 18px 18px 18px' }}>
                      <div className="flex gap-1.5 items-center h-4">
                        {[0, 150, 300].map(delay => (
                          <div key={delay} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#38bdf8', animationDelay: `${delay}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions — only show on first message */}
              {messages.length === 1 && (
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(item.q)}
                      disabled={loading}
                      className="text-[10px] font-mono px-2.5 py-1.5 rounded-full border transition-all hover:text-white disabled:opacity-50"
                      style={{ borderColor: 'rgba(56,189,248,0.15)', color: '#64748b', background: 'rgba(56,189,248,0.04)' }}
                    >
                      {item.emoji} {item.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(56,189,248,0.1)' }}>
                <div
                  className="flex gap-2 items-center rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(6,14,26,0.8)', border: '1px solid rgba(56,189,248,0.15)' }}
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask about cyber safety..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                    disabled={loading}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                    style={{ background: input.trim() && !loading ? '#0ea5e9' : 'rgba(56,189,248,0.1)' }}
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                      : <Send className="w-4 h-4 text-white" />}
                  </button>
                </div>
                <p className="text-[9px] text-center mt-1.5 font-mono" style={{ color: 'rgba(56,189,248,0.2)' }}>
                  Powered by Google Gemini AI · Helpline: 1930
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
