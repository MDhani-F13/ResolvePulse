import React from 'react';
import { Ticket, TicketPriority, TicketStatus, SupportTier } from '../types/ticket';
import { Search, X, AlertCircle, ArrowUpRight } from 'lucide-react';

import { User } from '../types/user';

interface TicketQueueTableProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticket: Ticket) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  slaFilter: string;
  setSlaFilter: (sla: string) => void;
  searchQuery: string;
  setSearchQuery: (search: string) => void;
  isLoading: boolean;
  onResetFilters: () => void;
  currentUser: User | null;
}

export const TicketQueueTable: React.FC<TicketQueueTableProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  slaFilter,
  setSlaFilter,
  searchQuery,
  setSearchQuery,
  isLoading,
  onResetFilters,
  currentUser,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      {/* Customer Scoped Banner */}
      {currentUser?.role === 'customer' && (
        <div className="px-4 py-2.5 bg-sky-950/30 border-b border-sky-900/50 text-xs text-sky-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span>Customer Portal: Showing incidents submitted by <strong>{currentUser.email}</strong></span>
          </div>
          <span className="text-[11px] font-mono text-sky-400">Scoped by TicketPolicy</span>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket #, incident summary, customer, or tag..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls (Segmented buttons - Allowed interactive controls) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Segment */}
          <div className="flex items-center gap-0.5 p-1 bg-slate-950/80 border border-slate-800 rounded-md text-xs">
            {['all', 'open', 'in_progress', 'escalated', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap capitalize ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'in_progress' ? 'In Progress' : st}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-0.5 p-1 bg-slate-950/80 border border-slate-800 rounded-md text-xs">
            {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap capitalize ${
                  priorityFilter === p
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* SLA State Filter */}
          <div className="flex items-center gap-0.5 p-1 bg-slate-950/80 border border-slate-800 rounded-md text-xs">
            {[
              { id: 'all', label: 'All SLAs' },
              { id: 'warning', label: 'Warning (<2h)' },
              { id: 'breached', label: 'Breached' },
            ].map((sla) => (
              <button
                key={sla.id}
                onClick={() => setSlaFilter(sla.id)}
                className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                  slaFilter === sla.id
                    ? sla.id === 'breached'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                      : 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sla.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-950/90 text-slate-400 font-medium border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 w-28">Incident #</th>
              <th className="py-3 px-4 min-w-[280px]">Summary &amp; Customer</th>
              <th className="py-3 px-3 w-28">Severity</th>
              <th className="py-3 px-3 w-28">Tier</th>
              <th className="py-3 px-3 w-32">Assignee</th>
              <th className="py-3 px-3 w-32">Status</th>
              <th className="py-3 px-4 w-52">SLA Countdown</th>
              <th className="py-3 px-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div><div className="h-3 bg-slate-800/60 rounded w-1/2"></div></td>
                  <td className="py-4 px-3"><div className="h-4 bg-slate-800 rounded w-14"></div></td>
                  <td className="py-4 px-3"><div className="h-4 bg-slate-800 rounded w-12"></div></td>
                  <td className="py-4 px-3"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                  <td className="py-4 px-3"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-28"></div></td>
                  <td className="py-4 px-3"></td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={8} className="py-12 px-4 text-center">
                  <div className="max-w-sm mx-auto text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 text-slate-500" />
                    <p className="font-semibold text-slate-200 mb-1">No matching incidents found</p>
                    <p className="text-xs text-slate-500 mb-4">
                      Try broadening your search query or reset your status and priority filters.
                    </p>
                    <button
                      onClick={onResetFilters}
                      className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              // Populated Rows
              tickets.map((ticket) => {
                const isSelected = selectedTicketId === ticket.id;
                const evalData = ticket.sla_evaluation;

                // Priority style colors
                const priorityStyles: Record<TicketPriority, string> = {
                  urgent: 'text-rose-400 font-semibold',
                  high: 'text-amber-400 font-medium',
                  medium: 'text-sky-400',
                  low: 'text-slate-400',
                };

                // Status colors
                const statusStyles: Record<TicketStatus, string> = {
                  open: 'text-sky-300',
                  in_progress: 'text-indigo-300',
                  escalated: 'text-rose-300 font-semibold',
                  resolved: 'text-emerald-400',
                  closed: 'text-slate-500',
                };

                return (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className={`cursor-pointer transition-colors group ${
                      isSelected
                        ? 'bg-indigo-950/40 hover:bg-indigo-950/50'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Ticket Number */}
                    <td className="py-3 px-4 font-mono font-semibold tabular-nums text-indigo-400 whitespace-nowrap">
                      {ticket.ticket_number}
                    </td>

                    {/* Summary & Customer (Anti-Pill: Plain text with subtle separators) */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 line-clamp-1 group-hover:text-indigo-200 transition-colors">
                        {ticket.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <span>{ticket.customer_name}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-400 font-mono text-[11px]">{ticket.customer_email}</span>
                        {ticket.tags && ticket.tags.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-400 text-[11px]">{ticket.tags.slice(0, 2).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`capitalize ${priorityStyles[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>

                    {/* Support Tier */}
                    <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-400 font-mono">
                      {ticket.tier.replace('_', ' ').toUpperCase()}
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={ticket.assigned_to === 'Unassigned' ? 'text-slate-500 italic' : 'text-slate-300'}>
                        {ticket.assigned_to}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`capitalize ${statusStyles[ticket.status]}`}>
                        {ticket.status === 'in_progress' ? 'In Progress' : ticket.status}
                      </span>
                    </td>

                    {/* SLA Progress & Time Remaining */}
                    <td className="py-3 px-4">
                      {evalData ? (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1 font-mono tabular-nums">
                            <span
                              className={
                                evalData.is_breached
                                  ? 'text-rose-400 font-semibold'
                                  : evalData.is_warning
                                  ? 'text-amber-400 font-medium'
                                  : ticket.status === 'resolved' || ticket.status === 'closed'
                                  ? 'text-emerald-400'
                                  : 'text-slate-300'
                              }
                            >
                              {evalData.formatted_remaining}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {ticket.sla_target_hours}h target
                            </span>
                          </div>
                          {/* Progress track */}
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                evalData.is_breached
                                  ? 'bg-rose-500'
                                  : evalData.is_warning
                                  ? 'bg-amber-500'
                                  : ticket.status === 'resolved' || ticket.status === 'closed'
                                  ? 'bg-emerald-500'
                                  : 'bg-indigo-500'
                              }`}
                              style={{ width: `${evalData.percentage_elapsed}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">
                          {ticket.sla_target_hours}h target
                        </span>
                      )}
                    </td>

                    {/* Action Arrow */}
                    <td className="py-3 px-3 text-right">
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
        <span>Showing {tickets.length} incident records</span>
        <span className="font-mono">SLA calculation updated in real-time</span>
      </div>
    </div>
  );
};
