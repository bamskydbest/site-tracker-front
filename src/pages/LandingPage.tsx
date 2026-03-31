import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Shield, Wrench, UserPlus, ArrowRight, MapPin, Cloud, CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type SystemStatus = 'checking' | 'online' | 'offline';

const portals = [
  {
    icon: Shield,
    title: 'Admin Portal',
    description:
      'Manage visits, review reports, and oversee field operations from a centralised dashboard.',
    cta: 'Enter Portal',
    route: '/admin/login',
    highlighted: true,
  },
  {
    icon: Wrench,
    title: 'Technician',
    description:
      'Log site visits, capture photos, and submit installation records in real-time from the field.',
    cta: 'Start Session',
    route: '/technician',
    highlighted: false,
  },
  {
    icon: UserPlus,
    title: 'Register',
    description:
      'Create a new account to join the K-NET field operations team.',
    cta: 'Get Started',
    route: '/register',
    highlighted: false,
  },
];

const features = [
  { icon: MapPin, label: 'GPS-verified check-ins' },
  { icon: Cloud, label: 'Cloud photo storage' },
  { icon: CheckCircle2, label: 'Real-time approval flow' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SystemStatus>('checking');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch(API_URL, { signal: controller.signal })
      .then(() => setStatus('online'))
      .catch(() => setStatus('offline'))
      .finally(() => clearTimeout(timeout));
  }, []);

  return (
    <div className="min-h-screen bg-[#001a3e] relative overflow-hidden flex flex-col">

      {/* ── Background decorative layer ── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-[#2e94eb]/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-[#002f6c]/40 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#2e94eb]/5 blur-[160px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 sm:px-10 lg:px-16 py-4">

          {/* Left: logo + divider + label */}
          <div className="flex items-center gap-4">
            <img src="/k-NET.png" alt="K-NET" className="h-8 sm:h-9 w-auto" />
            <div className="w-px h-9 bg-gray-200" />
            <span className="text-[#002f6c] text-sm font-semibold tracking-wider uppercase hidden sm:block">
              Site Tracker
            </span>
          </div>

          {/* Right: system status */}
          {status === 'checking' && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <span className="text-gray-500 text-xs font-semibold tracking-wide">Checking…</span>
            </div>
          )}
          {status === 'online' && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 text-xs font-semibold tracking-wide">System Online</span>
            </div>
          )}
          {status === 'offline' && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-red-700 text-xs font-semibold tracking-wide">System Offline</span>
            </div>
          )}

        </div>
      </header>

      {/* ── Main content ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 sm:py-16 lg:py-20">

        {/* Hero */}
        <div className="text-center mb-10 sm:mb-14 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-[#2e94eb]/10 border border-[#2e94eb]/25 text-[#5aadf4] text-[11px] font-semibold px-3.5 py-1.5 rounded-full mb-6 tracking-[0.12em] uppercase">
            Field Operations Platform
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white/90 leading-[1.12] tracking-tight mb-5">
            K-NET Site Tracker
          </h1>

          <p className="text-base sm:text-lg text-white/45 leading-relaxed max-w-xl mx-auto mb-8">
            Log site visits, capture installation photos, and keep your entire
            team in sync — all in real-time, from any device.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/40 text-sm">
                <Icon className="w-3.5 h-3.5 text-[#2e94eb]/70 shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Portal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl items-stretch">
          {portals.map(({ icon: Icon, title, description, cta, route, highlighted }) => (
            <button
              key={route}
              onClick={() => navigate(route)}
              className={[
                'group flex flex-col text-left rounded-2xl p-6 border transition-all duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#2e94eb]/60',
                highlighted
                  ? 'bg-[#2e94eb] border-[#2e94eb]/60 hover:bg-[#5aadf4] hover:border-[#5aadf4] shadow-xl shadow-[#2e94eb]/20'
                  : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20',
              ].join(' ')}
            >
              {/* Icon */}
              <div
                className={[
                  'w-10 h-10 rounded-xl flex items-center justify-center mb-5',
                  highlighted ? 'bg-white/20' : 'bg-white/8',
                ].join(' ')}
              >
                <Icon
                  className={['w-5 h-5', highlighted ? 'text-white' : 'text-white/60'].join(' ')}
                />
              </div>

              {/* Text */}
              <h2 className="text-white font-semibold text-lg mb-2 leading-snug">{title}</h2>
              <p
                className={[
                  'text-sm leading-relaxed flex-1',
                  highlighted ? 'text-white/75' : 'text-white/40',
                ].join(' ')}
              >
                {description}
              </p>

              {/* CTA — always at the bottom */}
              <div
                className={[
                  'flex items-center gap-1.5 text-sm font-semibold mt-7',
                  highlighted ? 'text-white' : 'text-[#5aadf4]',
                ].join(' ')}
              >
                {cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[#2e94eb]/20 py-5 px-4">
        <p className="text-center text-white/30 text-xs tracking-wide">
          © {new Date().getFullYear()} K-NET · Swift Route Ltd · All rights reserved
        </p>
      </footer>
    </div>
  );
}
