import React, { useState } from 'react';
import { User, UserRole } from '../types/user';
import { authClient } from '../api/authClient';
import { X, Lock, Mail, User as UserIcon, Shield, AlertCircle, Building, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  
  // Signin fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('customer');
  const [regOrg, setRegOrg] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setFieldErrors({});

    try {
      const user = await authClient.login(loginEmail, loginPassword);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setFieldErrors({});

    try {
      const user = await authClient.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        organization: regOrg
      });
      onSuccess(user);
      onClose();
    } catch (err: any) {
      if (err.errors) {
        setFieldErrors(err.errors);
      }
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPersona = async (email: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await authClient.switchPersona(email);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Signin / Register Tabs */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
            <button
              onClick={() => { setTab('signin'); setErrorMsg(null); }}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                tab === 'signin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setErrorMsg(null); }}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                tab === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="px-4 py-2.5 bg-rose-950/80 border-b border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {tab === 'signin' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="sarah.c@resolvepulse.internal"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-md transition-colors shadow-sm"
              >
                {isLoading ? 'Signing In...' : 'Sign In to ResolvePulse'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Jordan Mitchell"
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                {fieldErrors.name && <p className="text-[11px] text-rose-400 mt-0.5">{fieldErrors.name[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jordan@company.com"
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                {fieldErrors.email && <p className="text-[11px] text-rose-400 mt-0.5">{fieldErrors.email[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                {fieldErrors.password && <p className="text-[11px] text-rose-400 mt-0.5">{fieldErrors.password[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                  {[
                    { id: 'customer', label: 'Customer' },
                    { id: 'support_engineer', label: 'Engineer' },
                    { id: 'lead_admin', label: 'Lead Admin' }
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRegRole(r.id as UserRole)}
                      className={`p-1.5 rounded border text-xs font-medium transition-colors ${
                        regRole === r.id
                          ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Organization / Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={regOrg}
                    onChange={(e) => setRegOrg(e.target.value)}
                    placeholder="e.g. Acme Corp or SRE Team"
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-md transition-colors shadow-sm"
              >
                {isLoading ? 'Registering...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Quick Demo Persona Switcher */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
              Or Instant 1-Click Demo Login:
            </span>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickPersona('elena.rostova@fintechscale.io')}
                className="w-full p-2 rounded bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-semibold text-slate-200 block group-hover:text-indigo-300">Elena Rostova</span>
                  <span className="text-[11px] text-slate-500">Customer Persona (Reports &amp; tracks own issues)</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-slate-950 px-1.5 py-0.5 rounded text-sky-400 border border-slate-800">
                  Customer
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona('sarah.c@resolvepulse.internal')}
                className="w-full p-2 rounded bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-semibold text-slate-200 block group-hover:text-indigo-300">Sarah Chen</span>
                  <span className="text-[11px] text-slate-500">Engineer Persona (Investigates, resolves, Tier 2 escalation)</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-slate-950 px-1.5 py-0.5 rounded text-indigo-400 border border-slate-800">
                  Engineer
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona('marcus.v@resolvepulse.internal')}
                className="w-full p-2 rounded bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-semibold text-slate-200 block group-hover:text-indigo-300">Marcus Vance</span>
                  <span className="text-[11px] text-slate-500">Lead Admin Persona (Full rights, Tier 3 approval, closes)</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-slate-950 px-1.5 py-0.5 rounded text-rose-400 border border-slate-800">
                  Lead Admin
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
