import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, BarChart3, Users, Lock, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: Shield,
      title: 'Secure Reporting',
      description: 'Report cyber incidents safely with end-to-end encryption and privacy protection.',
    },
    {
      icon: AlertTriangle,
      title: 'Real-time Alerts',
      description: 'Stay informed with instant safety advisories and threat notifications.',
    },
    {
      icon: BarChart3,
      title: 'AI-Powered Analysis',
      description: 'Smart risk assessment and category suggestions for every incident reported.',
    },
    {
      icon: Users,
      title: 'Community Safety',
      description: 'Join thousands of citizens working together to combat cyber threats.',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Incidents Resolved' },
    { value: '50,000+', label: 'Protected Users' },
    { value: '99.9%', label: 'Response Rate' },
    { value: '24/7', label: 'Monitoring' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-teal-400" />
              <span className="text-xl font-bold text-white">CyberSafe India</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#stats" className="text-slate-300 hover:text-white transition-colors">Statistics</a>
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-slate-300 hover:text-white transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-full px-4 py-2 mb-6">
              <Lock className="w-4 h-4 text-teal-400" />
              <span className="text-teal-300 text-sm font-medium">AI-Enabled Cyber Security Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Report Cyber Incidents
              <br />
              <span className="text-teal-400">Stay Safe Online</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              India's comprehensive cyber incident reporting portal. Report phishing, fraud, hacking, and other cyber threats. Get AI-powered insights and real-time safety alerts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={user ? '/dashboard/report' : '/signup'}
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-teal-500/25"
              >
                Report an Incident
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/alerts"
                className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all border border-slate-600"
              >
                View Safety Alerts
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-16 border-t border-b border-slate-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal-400 mb-2">{stat.value}</div>
                <div className="text-slate-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comprehensive Cyber Security Reporting
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Our platform provides everything you need to report and track cyber incidents, with AI-powered insights and real-time alerts.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-teal-500/50 transition-all hover:transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Simple, fast, and secure incident reporting in just 3 steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up as a citizen to start reporting incidents' },
              { step: '02', title: 'Submit Report', desc: 'Fill in incident details with screenshots and descriptions' },
              { step: '03', title: 'Track Progress', desc: 'Monitor status updates and receive AI-powered insights' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-teal-500/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to make India's cyberspace safer?
            </h2>
            <p className="text-teal-100 mb-8 max-w-xl mx-auto">
              Join thousands of citizens who are actively contributing to cyber safety. Report incidents and help protect the community.
            </p>
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-teal-400" />
              <span className="text-white font-semibold">CyberSafe India</span>
            </div>
            <p className="text-slate-400 text-sm">
              Smart India Hackathon 2024 - Problem Statement #25183
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>24/7 Security Monitoring</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
