import React from 'react';
import { DashboardMetrics } from '../types/ticket';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SlaMetricStripProps {
  metrics: DashboardMetrics | null;
  onFilterClick?: (filterType: string) => void;
}

export const SlaMetricStrip: React.FC<SlaMetricStripProps> = ({ metrics, onFilterClick }) => {
  const activeCount = metrics ? metrics.open + metrics.in_progress + metrics.escalated : 0;
  const breachedCount = metrics ? metrics.breached : 0;
  const warningCount = metrics ? metrics.warning : 0;
  const resolvedCount = metrics ? metrics.resolved : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Metric 1: Active Incidents */}
      <div 
        onClick={() => onFilterClick && onFilterClick('active')}
        className="p-4 rounded-lg bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
          <span>Active Incidents</span>
          <AlertTriangle className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
          {activeCount}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {metrics ? `${metrics.open} open · ${metrics.in_progress} in progress · ${metrics.escalated} escalated` : 'Calculating...'}
        </div>
      </div>

      {/* Metric 2: SLA Breached */}
      <div 
        onClick={() => onFilterClick && onFilterClick('breached')}
        className={`p-4 rounded-lg border transition-colors cursor-pointer group ${
          breachedCount > 0 
            ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700' 
            : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-rose-400 mb-2 font-medium">
          <span>SLA Breached</span>
          <ShieldAlert className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-rose-400 tracking-tight">
          {breachedCount}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Requires immediate Tier 3 intervention
        </div>
      </div>

      {/* Metric 3: Approaching SLA Limit (< 2h) */}
      <div 
        onClick={() => onFilterClick && onFilterClick('warning')}
        className={`p-4 rounded-lg border transition-colors cursor-pointer group ${
          warningCount > 0 
            ? 'bg-amber-950/20 border-amber-900/50 hover:border-amber-700' 
            : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-amber-400 mb-2 font-medium">
          <span>SLA Warning (&lt; 2h)</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-400 tracking-tight">
          {warningCount}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          At risk of breach within 120 minutes
        </div>
      </div>

      {/* Metric 4: Resolved Today */}
      <div 
        onClick={() => onFilterClick && onFilterClick('resolved')}
        className="p-4 rounded-lg bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs text-emerald-400 mb-2 font-medium">
          <span>Resolved Incidents</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-400 tracking-tight">
          {resolvedCount}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Root cause resolved &amp; audited
        </div>
      </div>
    </div>
  );
};
