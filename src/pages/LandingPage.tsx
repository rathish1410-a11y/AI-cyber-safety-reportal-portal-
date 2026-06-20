import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, BarChart3, Users, Brain, Clock, ArrowRight, Lock, Database, Zap, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LandingPage() {
  const { user } = useAuth();
  const [liveRiskScore, setLiveRiskScore] = useState<number>(78);

  useEffect(() => {
    async function fetchLiveScore() {
      const { data, error } = await supabase.rpc('get_average_risk_score');
      if (!error && data !== null) {
        setLiveRiskScore(data);
      }
    }
    fetchLiveScore();
  }, []);

  const features = [
    { icon: Lock, title: 'Secure Reporting', description: 'Report cyber incidents safely with end-to-end encryption and privacy protection.' },
    { icon: AlertTriangle, title: 'Real-time Alerts', description: 'Stay informed with instant safety advisories and threat notifications.' },
    { icon: Brain, title: 'AI-Powered Analysis', description: 'Smart risk assessment and category suggestions for every incident reported.' },
    { icon: Users, title: 'Community Safety', description: 'Join thousands of citizens working together to combat cyber threats.' },
  ];

  const stats = [
    { value: '10,000+', label: 'Incidents Resolved' },
    { value: '50,000+', label: 'Protected Users' },
    { value: '99.9%', label: 'Response Rate' },
    { value: '24/7', label: 'Monitoring' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--dark-bg)' }}>
      {/* Animated circuit grid background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-100 pointer-events-none" />
      {/* Blue radial glows matching reference image */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(56,189,248,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(14,165,233,0.04) 0%, transparent 55%), radial-gradient(ellipse at 50% 90%, rgba(56,189,248,0.03) 0%, transparent 50%)'
      }} />

      {/* Header */}
      <header className="border-b sticky top-0 z-50 relative backdrop-blur-md" style={{ background: 'rgba(6,14,26,0.85)', borderColor: 'rgba(56,189,248,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* HUD Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'rgba(56,189,248,0.3)', boxShadow: '0 0 12px rgba(56,189,248,0.2)' }} />
                <div className="absolute inset-1.5 rounded-full flex items-center justify-center overflow-hidden" style={{ background: 'rgba(56,189,248,0.1)' }}>
                  <img src="/favicon.png" className="w-5 h-5 object-contain" style={{ filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.6))' }} />
                </div>
              </div>
              <div>
                <span className="text-base font-display font-bold text-white tracking-[0.15em]">CYBERSAFE</span>
                <p className="text-[9px] font-mono tracking-[0.15em] uppercase" style={{ color: 'rgba(56,189,248,0.45)' }}>India</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              {/* Features and Stats - Desktop only */}
              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm font-mono tracking-wider">FEATURES</a>
                <a href="#stats" className="text-slate-400 hover:text-white transition-colors text-sm font-mono tracking-wider">STATS</a>
              </div>

              {/* Authentication Actions - Mobile & Desktop */}
              {user ? (
                <Link to="/dashboard" className="cyber-btn-solid px-4 py-1.5 md:px-5 md:py-2 rounded-lg text-xs md:text-sm font-semibold font-mono">
                  DASHBOARD
                </Link>
              ) : (
                <div className="flex items-center gap-2 md:gap-3">
                  <Link to="/login" className="text-xs md:text-sm font-mono tracking-wider transition-colors px-2 py-1" style={{ color: 'rgba(56,189,248,0.7)' }} onMouseOver={e => (e.target as HTMLElement).style.color = 'var(--cyber-blue)'} onMouseOut={e => (e.target as HTMLElement).style.color = 'rgba(56,189,248,0.7)'}>
                    LOGIN
                  </Link>
                  <Link to="/signup" className="cyber-btn-solid px-4 py-1.5 md:px-5 md:py-2 rounded-lg text-xs md:text-sm font-semibold font-mono">
                    SIGN UP
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <section className="py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              {/* Live status badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-8 border" style={{ background: 'rgba(56,189,248,0.05)', borderColor: 'rgba(56,189,248,0.2)' }}>
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: 'var(--cyber-blue)', opacity: 0.4, transform: 'scale(2)' }} />
                  <div className="relative w-2 h-2 rounded-full" style={{ background: 'var(--cyber-blue)' }} />
                </div>
                <span className="text-sm font-mono tracking-wider" style={{ color: 'rgba(56,189,248,0.8)' }}>AI Engine Active — Scanning for Threats</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight tracking-wider">
                CYBER
                <br />
                <span className="text-glow-blue" style={{ color: 'var(--cyber-blue)', textShadow: '0 0 30px rgba(56,189,248,0.4), 0 0 60px rgba(56,189,248,0.1)' }}>SECURITY</span>
                <br />
                <span className="text-2xl md:text-3xl font-sans font-normal text-slate-300 tracking-normal">Incident & Safety Portal</span>
              </h1>

              <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Report cyber incidents and get instant AI-driven risk scoring, category detection, and real-time safety alerts — built for SIH Problem Statement #25183.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to={user ? '/dashboard/report' : '/signup'}
                  className="cyber-btn-solid px-8 py-4 rounded-lg font-semibold text-base flex items-center gap-2 font-mono"
                >
                  REPORT INCIDENT
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/alerts"
                  className="cyber-btn px-8 py-4 rounded-lg font-semibold text-base font-mono"
                >
                  VIEW ALERTS
                </Link>
              </div>
            </div>

            {/* HUD Visualization — matching reference image circles */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-80 h-80 md:w-[420px] md:h-[420px]">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 rounded-full border animate-ring-spin" style={{ borderColor: 'rgba(56,189,248,0.12)', borderTopColor: 'rgba(56,189,248,0.4)' }} />
                {/* Second ring */}
                <div className="absolute inset-6 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.08)' }} />
                {/* Third ring */}
                <div className="absolute inset-14 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.06)' }} />

                {/* Scan line effect */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute inset-0 animate-scan-line" style={{
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(56,189,248,0.08) 50%, transparent 100%)',
                    height: '100%',
                  }} />
                </div>

                {/* Center card */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-2xl p-6 text-center w-56 border" style={{ background: 'rgba(10,22,40,0.9)', borderColor: 'rgba(56,189,248,0.25)', boxShadow: '0 0 30px rgba(56,189,248,0.08), 0 0 60px rgba(56,189,248,0.03)' }}>
                    <div className="w-10 h-10 rounded-full border flex items-center justify-center mx-auto mb-3" style={{ borderColor: 'rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.08)' }}>
                      <Brain className="w-5 h-5" style={{ color: 'var(--cyber-blue)' }} />
                    </div>
                    <p className="text-white font-semibold mb-1 text-sm font-mono">AI THREAT ANALYSIS</p>
                    <p className="text-slate-500 text-xs mb-4 font-mono">Live system average<span className="terminal-cursor"></span></p>
                    <div className="space-y-2 text-left">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-mono">Risk Score</span>
                        <span className="font-mono font-bold" style={{ color: 'var(--cyber-amber)' }}>{liveRiskScore}%</span>
                      </div>
                      <div className="risk-bar">
                        <div className="risk-bar-fill transition-all duration-1000 ease-out" style={{ width: `${liveRiskScore}%`, background: 'linear-gradient(90deg, var(--cyber-blue-mid), var(--cyber-amber))' }} />
                      </div>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-slate-500 font-mono">Status</span>
                        <span className="font-mono" style={{ color: 'var(--cyber-blue)' }}>Monitoring</span>
                      </div>
                    </div>
                  </div>
                </div>


                {/* HUD icon nodes — like reference image */}
                {[
                  { icon: Lock, angle: 220, label: 'SECURE' },
                  { icon: Database, angle: 300, label: 'DATA' },
                  { icon: Radio, angle: 60, label: 'LIVE' },
                  { icon: Zap, angle: 140, label: 'AI' },
                ].map(({ icon: Icon, angle, label }) => {
                  const rad = (angle * Math.PI) / 180;
                  const x = 50 + Math.cos(rad) * 38;
                  const y = 50 + Math.sin(rad) * 38;
                  return (
                    <div key={label} className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}>
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.3)', boxShadow: '0 0 8px rgba(56,189,248,0.15)' }} />
                        <div className="absolute inset-1.5 rounded-full flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.08)' }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: 'var(--cyber-blue)' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-16 border-t border-b" style={{ borderColor: 'rgba(56,189,248,0.06)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold mb-2" style={{ color: 'var(--cyber-blue)', textShadow: '0 0 20px rgba(56,189,248,0.3)' }}>{stat.value}</div>
                <div className="text-slate-500 text-sm font-mono uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 tracking-wider">
              COMPREHENSIVE CYBER SECURITY
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-mono text-sm">
              Our platform provides everything you need to report and track cyber incidents, with AI-powered insights and real-time alerts.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="cyber-card cyber-frame p-6 hover:border-[rgba(56,189,248,0.25)] transition-all"
              >
                {/* HUD icon ring */}
                <div className="relative w-12 h-12 mb-5">
                  <div className="absolute inset-0 rounded-full border" style={{ borderColor: 'rgba(56,189,248,0.25)', boxShadow: '0 0 10px rgba(56,189,248,0.1)' }} />
                  <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.06)' }}>
                    <feature.icon className="w-5 h-5" style={{ color: 'var(--cyber-blue)' }} />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white mb-2 font-mono">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 tracking-wider">HOW IT WORKS</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-mono text-sm">Simple, fast, and secure incident reporting in just 3 steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up as a citizen to start reporting incidents' },
              { step: '02', title: 'Submit Report', desc: 'Fill in incident details with screenshots and descriptions' },
              { step: '03', title: 'Track Progress', desc: 'Monitor status updates and receive AI-powered insights' },
            ].map((item, index) => (
              <div key={index} className="text-center cyber-card p-8">
                <div className="text-5xl font-display font-bold mb-4" style={{ color: 'rgba(56,189,248,0.1)' }}>{item.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="rounded-2xl p-8 md:p-12 text-center border relative overflow-hidden" style={{ background: 'var(--dark-card)', borderColor: 'rgba(56,189,248,0.15)', boxShadow: '0 0 60px rgba(56,189,248,0.04)' }}>
            <div className="absolute inset-0 cyber-grid-bg opacity-50 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4 tracking-wider">
                MAKE INDIA'S CYBERSPACE SAFER
              </h2>
              <p className="mb-8 max-w-xl mx-auto text-sm font-mono" style={{ color: 'rgba(56,189,248,0.6)' }}>
                Join thousands of citizens who are actively contributing to cyber safety. Report incidents and help protect the community.
              </p>
              <Link
                to={user ? '/dashboard' : '/signup'}
                className="cyber-btn-solid inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold font-mono"
              >
                GET STARTED
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8" style={{ background: 'rgba(6,14,26,0.8)', borderColor: 'rgba(56,189,248,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: 'var(--cyber-blue)' }} />
              <span className="text-white font-mono font-semibold text-sm tracking-wider">CYBERSAFE INDIA</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'rgba(56,189,248,0.4)' }}>
              <Clock className="w-3.5 h-3.5" />
              <span>24/7 Security Monitoring</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
