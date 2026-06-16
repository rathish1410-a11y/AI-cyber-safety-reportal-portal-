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

const SYSTEM_INSTRUCTION = `You are CyberBot, an AI assistant on the CyberSafe India Portal — a government-grade cyber incident reporting platform for Indian citizens (SIH25183).

Your tone: Professional, clear, and warm — like a knowledgeable support officer who genuinely wants to help. Not robotic or cold. Not overly casual or buddy-like. Think: calm, confident, helpful.

Response style:
- Keep it concise — 3 to 5 sentences max for most answers
- Write in a natural, readable way — not stiff corporate language
- Acknowledge the user's concern briefly before giving advice
- Use simple English — avoid heavy technical jargon
- No excessive bullet points — use them only when listing steps
- Do not start with "Certainly!", "Of course!", "Great question!" or similar filler phrases

When a user describes a cyber incident:
1. Briefly acknowledge their situation with empathy (one short sentence)
2. Give 2-3 clear, actionable steps
3. Always end with: "👉 You can also report this directly on our portal — click **Report Incident** in the sidebar. Our team will review your case within 24 hours."
4. If relevant, mention: Helpline 1930 | cybercrime.gov.in

Focus areas: UPI fraud, spam calls, phishing, online scams, identity theft, hacking, Aadhaar misuse — all in the Indian context.

If asked something unrelated to cyber safety, politely let them know you can only assist with cyber safety topics.`;



const QUICK_QUESTIONS = [
  { emoji: '🎣', label: 'Phishing email help', q: 'I got a phishing email. What should I do immediately?' },
  { emoji: '💸', label: 'UPI fraud', q: 'I lost money in a UPI fraud. How can I recover it?' },
  { emoji: '🔐', label: 'Identity theft', q: 'How do I report identity theft in India?' },
  { emoji: '📞', label: 'Helpline number', q: 'What is the national cybercrime helpline number?' },
  { emoji: '🛡️', label: 'Secure accounts', q: 'How can I secure my online accounts and prevent hacking?' },
];

export default function CyberBot() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Hi${profile?.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''}! I'm **CyberBot** 🤖 — your AI cyber safety assistant.\n\nHow can I help you today? You can ask me about phishing, fraud, hacking, or anything cyber safety related.`,
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
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || countdown > 0) return;

    const userMsg: Message = { role: 'user', text: trimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    await callAI([], trimmed);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const formatText = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 0 30px rgba(56,189,248,0.4)' }}
          title="Open CyberBot AI Assistant"
        >
          <MessageSquare className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#060e1a] animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: '370px',
            height: minimized ? 'auto' : '540px',
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
              <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">
                {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
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
