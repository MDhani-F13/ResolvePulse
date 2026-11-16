import React from 'react';
import { Ticket } from '../types/ticket';
import { ShieldAlert, Clock, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';

interface SlaBreachRadarProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onOpenNewTicket: () => void;
}

export const SlaBreachRadar: React.FC<SlaBreachRadarProps> = ({
  tickets,
  onSelectTicket,
}) => {
  // Filter for active tickets with breach or warning status
  const atRiskTickets = tickets
    .filter(t => t.status !== 'resolved' && t.status !== 'closed')
    .filter(t => {
      const evalData = t.sla_evaluation;
      return evalData?.is_breached || evalData?.is_warning;
    })
    .sort((a, b) => {
      const aRem = a.sla_evaluation?.minutes_remaining || 0;
      const bRem = b.sla_evaluation?.minutes_remaining || 0;
      return aRem - bRem; // Most urgent/overdue first
    });

  const breached = atRiskTickets.filter(t => t.sla_evaluation?.is_breached);
  const approaching = atRiskTickets.filter(t => !t.sla_evaluation?.is_breached && t.sla_evaluation?.is_warning);

  return (
    <div className="space-y-6">
      {/* Radar Overview Banner */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Real-Time SLA Violation Detection</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              SLA Breach Radar &amp; Escalation Command
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Monitors dynamic resolution thresholds. Tickets breaching agreed enterprise service levels are flagged for auto-escalation to Tier 2 and Tier 3 engineering units.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <div className="px-3.5 py-2 bg-rose-950/40 border border-rose-900/80 rounded-lg text-rose-300">
              <span className="text-rose-400 font-bold text-lg block">{breached.length}</span>
              <span>Breached Incidents</span>
            </div>
            <div className="px-3.5 py-2 bg-amber-950/40 border border-amber-900/80 rounded-lg text-amber-300">
              <span className="text-amber-400 font-bold text-lg block">{approaching.length}</span>
              <span>At Risk (&lt; 2h)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical List */}
      {atRiskTickets.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-xl">
          <Clock className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-slate-200 mb-1">
            All SLAs Nominal &amp; Healthy
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Zero active incidents are currently in SLA violation or warning thresholds. All customer commitments are within compliance windows.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {atRiskTickets.map(ticket => {
            const evalData = ticket.sla_evaluation;
            const isBreach = evalData?.is_breached;

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className={`p-5 rounded-xl border transition-all cursor-pointer group ${
                  isBreach
                    ? 'bg-rose-950/20 border-rose-900/70 hover:border-rose-600'
                    : 'bg-amber-950/20 border-amber-900/70 hover:border-amber-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold tabular-nums text-white">
                      {ticket.ticket_number}
                    </span>
                    <span className="text-slate-500 font-mono text-xs">·</span>
                    <span className="text-xs font-mono uppercase text-slate-400">
                      {ticket.tier.replace('_', ' ')}
                    </span>
                  </div>

                  <span className={`text-xs font-mono font-bold tabular-nums ${
                    isBreach ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {evalData?.formatted_remaining}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-white mb-2 line-clamp-1">
                  {ticket.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {ticket.description}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 mb-3 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${isBreach ? 'bg-rose-500' : 'bg-amber-500'}`}
                    style={{ width: `${evalData?.percentage_elapsed}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 truncate">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ticket.assigned_to}</span>
                  </div>

                  <div className="flex items-center gap-1 text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Manage Incident</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
