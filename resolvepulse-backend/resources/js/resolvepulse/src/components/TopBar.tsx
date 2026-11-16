import React, { useState } from 'react';
import { Layers, Plus, BookOpen, User as UserIcon, ChevronDown, LogOut, Check } from 'lucide-react';
import { User, UserRole } from '../types/user';

interface TopBarProps {
  currentTab: 'queue' | 'radar' | 'architecture' | 'docs';
  onSelectTab: (tab: 'queue' | 'radar' | 'architecture' | 'docs') => void;
  onOpenNewTicket: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onSwitchPersona: (email: string) => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTicket,
  currentUser,
  onOpenAuth,
  onSwitchPersona,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    customer: { label: 'Customer', color: 'text-sky-400 border-sky-800/80 bg-sky-950/40' },
    support_engineer: { label: 'Support Engineer', color: 'text-indigo-400 border-indigo-800/80 bg-indigo-950/40' },
    lead_admin: { label: 'Lead Admin', color: 'text-rose-400 border-rose-800/80 bg-rose-950/40' },
  };

  const personas = [
    { name: 'Elena Rostova', email: 'elena.rostova@fintechscale.io', role: 'customer' as UserRole, desc: 'Customer (My tickets only)' },
    { name: 'Sarah Chen', email: 'sarah.c@resolvepulse.internal', role: 'support_engineer' as UserRole, desc: 'Support Engineer (Investigation & Triage)' },
    { name: 'Marcus Vance', email: 'marcus.v@resolvepulse.internal', role: 'lead_admin' as UserRole, desc: 'Lead Admin (Tier 3 approval & Close)' },
  ];

  const currentRoleStyle = currentUser ? roleLabels[currentUser.role] : roleLabels.support_engineer;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-6 py-3">
      <div className="flex items-center justify-between gap-6 max-w-7xl mx-auto">
        {/* Zone 1: Single Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
            RP
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            ResolvePulse
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline-block font-mono">
            / SLA Engine
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('queue')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'queue'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Incident Queue
          </button>
          <button
            onClick={() => onSelectTab('radar')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'radar'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            SLA Breach Radar
          </button>
          <button
            onClick={() => onSelectTab('architecture')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'architecture'
                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60'
                : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Architecture &amp; Laravel</span>
          </button>
          <button
            onClick={() => onSelectTab('docs')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'docs'
                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Developer Docs</span>
          </button>
        </nav>

        {/* Zone 3: Active User Switcher & Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* User Profile / Quick Switcher */}
          <div className="relative">
            {currentUser ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-[11px]">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-slate-200 truncate max-w-[120px] leading-tight">
                    {currentUser.name}
                  </div>
                  <div className={`text-[10px] font-mono leading-none ${currentRoleStyle.color.split(' ')[0]}`}>
                    {currentRoleStyle.label}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-md border border-slate-800 transition-colors"
              >
                Sign In
              </button>
            )}

            {/* User Dropdown */}
            {showUserMenu && currentUser && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl p-2 z-50 text-xs animate-in fade-in duration-100">
                <div className="p-2 border-b border-slate-800/80 mb-1.5">
                  <span className="font-bold text-white block truncate">{currentUser.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono block truncate">{currentUser.email}</span>
                  <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase border ${currentRoleStyle.color}`}>
                    {currentRoleStyle.label}
                  </span>
                </div>

                <div className="py-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider px-2 block mb-1">
                    Switch Test Persona:
                  </span>
                  {personas.map((p) => {
                    const isCurrent = currentUser.email.toLowerCase() === p.email.toLowerCase();
                    return (
                      <button
                        key={p.email}
                        onClick={() => {
                          onSwitchPersona(p.email);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left p-1.5 rounded flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-indigo-950/60 text-indigo-300'
                            : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="truncate pr-1">
                          <span className="font-semibold block truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{p.desc}</span>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1.5 border-t border-slate-800/80 mt-1 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setShowUserMenu(false);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 p-1"
                  >
                    Manage Account
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 p-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA */}
          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-md transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Incident</span>
          </button>
        </div>
      </div>
    </header>
  );
};
