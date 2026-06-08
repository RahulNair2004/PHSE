/**
 * Sidebar Layout Component
 * Full Tailwind rewrite — terminal/cyber-ops aesthetic.
 * Features: live UTC clock, glitch logo, animated active indicator,
 * scan-line overlay, staggered nav entry animations, user strip + logout.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

const useClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

export const Sidebar = () => {
  const navigate         = useNavigate();
  const location         = useLocation();
  const { user, logout } = useAuth();
  const time             = useClock();
  const [hovered, setHovered] = useState(null);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&display=swap');

        .s-mono    { font-family: 'Share Tech Mono', monospace; }
        .s-display { font-family: 'Rajdhani', sans-serif; }

        @keyframes scanbeam {
          from { transform: translateY(-80px); }
          to   { transform: translateY(100vh); }
        }
        @keyframes blink-cur {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes glitch-clip {
          0%   { clip-path: inset(85% 0 0 0);  transform: translateX(-3px); }
          12%  { clip-path: inset(15% 0 65% 0); transform: translateX(3px);  }
          25%  { clip-path: inset(55% 0 25% 0); transform: translateX(-1px); }
          40%  { clip-path: inset(0 0 0 0);     transform: translateX(0);    }
          100% { clip-path: inset(0 0 0 0);     transform: translateX(0);    }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(52,211,153,0.55); }
          70%  { box-shadow: 0 0 0 5px rgba(52,211,153,0);  }
          100% { box-shadow: 0 0 0 0 rgba(52,211,153,0);    }
        }
        @keyframes nav-in {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0);     }
        }

        .scan-beam   { animation: scanbeam 5s linear infinite; }
        .blink-cur   { animation: blink-cur 1s step-end infinite; }
        .glitch-ghost { animation: glitch-clip 7s steps(1) infinite; }
        .pulse-ring  { animation: pulse-ring 2.5s ease infinite; }

        .nav-item { opacity: 0; animation: nav-in 0.3s ease forwards; }
        .nav-item:nth-child(1) { animation-delay: 60ms;  }
        .nav-item:nth-child(2) { animation-delay: 110ms; }
        .nav-item:nth-child(3) { animation-delay: 160ms; }
        .nav-item:nth-child(4) { animation-delay: 210ms; }
        .nav-item:nth-child(5) { animation-delay: 260ms; }
        .nav-item:nth-child(6) { animation-delay: 310ms; }
        .nav-item:nth-child(7) { animation-delay: 360ms; }
      `}</style>

      <aside className="s-mono relative flex flex-col w-65 min-w-65 h-screen bg-[#060a0e] border-r border-[#101d28] overflow-hidden">

        {/* Scan-line texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(52,211,153,0.013) 2px,rgba(52,211,153,0.013) 4px)',
          }}
        />

        {/* Moving beam */}
        <div
          aria-hidden
          className="scan-beam pointer-events-none absolute left-0 right-0 h-20 z-0"
          style={{ background: 'linear-gradient(transparent,rgba(52,211,153,0.04),transparent)' }}
        />

        {/* All content above overlays */}
        <div className="relative z-10 flex flex-col h-full">

          {/* ── Logo ── */}
          <div className="px-6 pt-7 pb-5 border-b border-[#0e1c28]">
            <p className="text-[9px] tracking-[0.28em] uppercase text-emerald-400/50 mb-2">
              SYS://PHSE-CORE v2.4.1
            </p>

            {/* Glitch word mark */}
            <div className="relative inline-block">
              <h1 className="s-display text-[28px] font-bold tracking-wide text-white leading-none">
                <span className="text-emerald-400">PH</span>SE
              </h1>
              <h1
                aria-hidden
                className="glitch-ghost s-display absolute inset-0 text-[28px] font-bold tracking-wide leading-none pointer-events-none text-red-400/55"
              >
                <span className="text-red-400/55">PH</span>SE
              </h1>
            </div>

            <p className="text-[9px] tracking-[0.22em] text-gray-700 mt-1 uppercase">
              Risk Intelligence Platform
            </p>
          </div>

          {/* ── Live clock ── */}
          <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#0a1520]">
            <span className="text-[10px] tracking-widest text-gray-700 uppercase">UTC</span>
            <span className="text-[11px] tracking-[0.15em] text-emerald-400">
              {time.toUTCString().slice(17, 25)}
              <span className="blink-cur ml-0.5">█</span>
            </span>
          </div>

          {/* ── Nav ── */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <p className="text-[9px] tracking-[0.28em] uppercase text-gray-700 px-3 mb-3">
              Navigation
            </p>

            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              const hover  = hovered === item.path;

              return (
                <button
                  key={item.path}
                  className="nav-item w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 text-left rounded-r-lg border-l-2 transition-all duration-150"
                  style={{
                    borderColor:     active ? '#34d399' : 'transparent',
                    backgroundColor: active ? 'rgba(52,211,153,0.07)' : hover ? 'rgba(255,255,255,0.025)' : 'transparent',
                    color:           active ? '#e2e8f0' : hover ? '#94a3b8' : '#4b5563',
                  }}
                  onClick={() => navigate(item.path)}
                  onMouseEnter={() => setHovered(item.path)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Icon */}
                  <span className={`text-sm w-4 text-center shrink-0 transition-opacity duration-150 ${active ? 'opacity-100' : 'opacity-55'}`}>
                    {item.icon}
                  </span>

                  {/* Label */}
                  <span className={`s-display flex-1 text-[13px] tracking-[0.06em] ${active ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>

                  {/* Pulse dot when active */}
                  {active && (
                    <span className="pulse-ring shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}

                  {/* Hover chevron */}
                  {!active && hover && (
                    <span className="text-[11px] text-gray-700">›</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Gradient divider */}
          <div className="mx-4 h-px bg-linear-to-r from-transparent via-[#1a2d3d] to-transparent" />

          {/* ── User strip ── */}
          {user && (
            <div className="flex items-center gap-3 px-4 py-4">
              {/* Avatar initial */}
              <div className="shrink-0 w-8 h-8 rounded-md bg-emerald-950 border border-emerald-800/60 flex items-center justify-center">
                <span className="s-display text-xs font-bold text-emerald-400 tracking-wide leading-none">
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
                </span>
              </div>

              {/* Name + ID */}
              <div className="flex-1 min-w-0">
                <p className="s-display text-[13px] font-semibold text-slate-200 tracking-wide truncate leading-none mb-0.5">
                  {user.name}
                </p>
                <p className="text-[10px] text-gray-700 tracking-widest truncate">
                  ID #{user.id}
                </p>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                title="Sign out"
                className="shrink-0 px-2 py-1 border border-[#1a2d3d] rounded text-[10px] tracking-widest text-gray-700 hover:border-red-900 hover:text-red-500 transition-all duration-150"
              >
                EXIT
              </button>
            </div>
          )}

          {/* ── Status bar ── */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#030507] border-t border-[#0a1520]">
            <span className="pulse-ring shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] tracking-[0.25em] text-emerald-900 uppercase">
              System Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;