import CyberBot from '../../components/CyberBot';
import { Bot, ShieldAlert } from 'lucide-react';

export default function AIAssistantPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col relative">
      <div className="scanline-overlay" />
      
      {/* Header */}
      <div className="mb-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bot className="w-8 h-8 text-cyber-400 animate-pulse" />
            <h1 className="text-2xl font-bold text-white font-display tracking-widest uppercase">
              CyberBot AI Assistant
            </h1>
          </div>
          <p className="terminal-text text-slate-400 text-sm">
            Your dedicated government-grade AI for immediate cyber safety guidance and incident resolution.
          </p>
        </div>
        
        <div className="cyber-card p-3 flex items-center gap-3 border-[rgba(56,189,248,0.2)]">
          <ShieldAlert className="w-5 h-5 text-neon-green" />
          <div>
            <p className="text-xs text-slate-400 font-mono">SYSTEM STATUS</p>
            <p className="text-sm text-neon-green font-mono font-bold tracking-wider">SECURE & ONLINE</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 min-h-[500px] relative z-10 cyber-card cyber-frame overflow-hidden flex flex-col">
        <CyberBot inline={true} />
      </div>
    </div>
  );
}
