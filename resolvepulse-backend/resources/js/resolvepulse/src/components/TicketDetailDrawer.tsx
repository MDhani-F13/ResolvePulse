import React, { useState } from 'react';
import { TicketDetail, TicketStatus, SupportTier } from '../types/ticket';
import { User, UserRole } from '../types/user';
import { ticketApi } from '../api/ticketClient';
import { 
  X, 
  Clock, 
  User as UserIcon, 
  Mail, 
  ArrowRight, 
  History, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw,
  AlertTriangle,
  Lock
} from 'lucide-react';

interface TicketDetailDrawerProps {
  ticket: TicketDetail | null;
  onClose: () => void;
  onRefresh: () => void;
  currentUser: User | null;
}

export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
  ticket,
  onClose,
  onRefresh,
  currentUser,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Note form state
  const [noteContent, setNoteContent] = useState('');

  // Escalation form state
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateTier, setEscalateTier] = useState<SupportTier>('tier_2');
  const [escalateReason, setEscalateReason] = useState('');

  // Reassignment form state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newAssignee, setNewAssignee] = useState('Marcus Vance');

  if (!ticket) return null;

  const evalData = ticket.sla_evaluation;
  const isCustomer = currentUser?.role === 'customer';
  const isEngineer = currentUser?.role === 'support_engineer';
  const isAdmin = currentUser?.role === 'lead_admin';

  const actorLabel = currentUser 
    ? `${currentUser.name} (${currentUser.role.replace('_', ' ')})` 
    : 'Sarah Chen (Engineer)';

  // Handle status update
  const handleStatusChange = async (nextStatus: TicketStatus) => {
    try {
      setIsUpdating(true);
      setErrorMessage(null);
      await ticketApi.updateStatus(ticket.id, nextStatus, actorLabel, `Status updated to ${nextStatus}`);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle escalation
  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateReason || escalateReason.length < 10) {
      setErrorMessage('Escalation justification must be at least 10 characters.');
      return;
    }
    try {
      setIsUpdating(true);
      setErrorMessage(null);
      await ticketApi.escalate(ticket.id, escalateTier, actorLabel, escalateReason);
      setShowEscalateModal(false);
      setEscalateReason('');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to escalate ticket.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle assignment
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setErrorMessage(null);
      await ticketApi.assign(ticket.id, newAssignee, actorLabel);
      setShowAssignModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reassign ticket.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle note submission
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      setIsUpdating(true);
      setErrorMessage(null);
      await ticketApi.addNote(ticket.id, noteContent.trim(), actorLabel);
      setNoteContent('');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to post note.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:max-w-2xl bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mb-1">
            <span>Incidents</span>
            <span aria-hidden="true">/</span>
            <span className="text-indigo-400 font-semibold">{ticket.ticket_number}</span>
            <span aria-hidden="true">/</span>
            <span className="capitalize text-slate-400">{ticket.status.replace('_', ' ')}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
            {ticket.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-3 bg-rose-950/80 border-b border-rose-800 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Drawer Body (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* SLA Status Card */}
        {evalData && (
          <div className={`p-4 rounded-lg border ${
            evalData.is_breached 
              ? 'bg-rose-950/30 border-rose-900/60' 
              : evalData.is_warning 
              ? 'bg-amber-950/30 border-amber-900/60' 
              : ticket.status === 'resolved' || ticket.status === 'closed'
              ? 'bg-emerald-950/20 border-emerald-900/60'
              : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Service Level Agreement (SLA)</span>
              </div>
              <span className={`text-xs font-mono font-bold tabular-nums ${
                evalData.is_breached 
                  ? 'text-rose-400' 
                  : evalData.is_warning 
                  ? 'text-amber-400' 
                  : 'text-slate-300'
              }`}>
                {evalData.formatted_remaining}
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2 mb-2 overflow-hidden border border-slate-800">
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

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Target: {ticket.sla_target_hours}h max resolution</span>
              <span>Due: {new Date(ticket.sla_due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        )}

        {/* Incident Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-md">
            <span className="text-slate-500 block mb-1">Severity</span>
            <span className="font-semibold capitalize text-slate-200">{ticket.priority}</span>
          </div>
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-md">
            <span className="text-slate-500 block mb-1">Support Tier</span>
            <span className="font-mono font-medium text-slate-200">{ticket.tier.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-md">
            <span className="text-slate-500 block mb-1">Status</span>
            <span className="font-medium text-indigo-300 capitalize">{ticket.status.replace('_', ' ')}</span>
          </div>
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-md">
            <span className="text-slate-500 block mb-1">Assignee</span>
            <span className="font-medium text-slate-200 truncate block">{ticket.assigned_to}</span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer &amp; Contact</h3>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium">{ticket.customer_name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono text-slate-400">{ticket.customer_email}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Incident Description</h3>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
            {ticket.description}
          </div>
        </div>

        {/* Workflow Actions (Governed by TicketPolicy RBAC) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Workflow Actions
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Policy: {currentUser?.role.replace('_', ' ') || 'Guest'}
            </span>
          </div>

          {isCustomer ? (
            /* Customer View: Read-only workflow with notification message */
            <div className="p-3.5 rounded-lg bg-sky-950/20 border border-sky-900/50 text-xs text-sky-300 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-sky-200">Customer Self-Service View:</span>
                Your incident is actively queued and tracked against SLA. Support engineers have exclusive authorization to advance workflow status and route escalations. You may post replies below.
              </div>
            </div>
          ) : (
            /* Staff View (Engineer & Lead Admin) */
            <div className="flex flex-wrap gap-2">
              {ticket.status === 'open' && (
                <button
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('in_progress')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <span>Accept &amp; Begin Investigation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {ticket.status === 'in_progress' && (
                <button
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('resolved')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Resolved</span>
                </button>
              )}

              {ticket.status === 'resolved' && (
                isAdmin ? (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleStatusChange('closed')}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <span>Verify &amp; Close Incident</span>
                  </button>
                ) : (
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Closing incidents requires Lead Admin verification.</span>
                  </div>
                )
              )}

              {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <>
                  <button
                    disabled={isUpdating}
                    onClick={() => setShowEscalateModal(true)}
                    className="px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Escalate Tier</span>
                  </button>

                  <button
                    disabled={isUpdating}
                    onClick={() => setShowAssignModal(true)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reassign Engineer</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Escalation Modal Dialog */}
        {showEscalateModal && (
          <form onSubmit={handleEscalateSubmit} className="p-4 bg-slate-900 border border-rose-900/80 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Escalate Incident</span>
              <button type="button" onClick={() => setShowEscalateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Target Support Tier</label>
              <select
                value={escalateTier}
                onChange={(e) => setEscalateTier(e.target.value as SupportTier)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              >
                <option value="tier_2">Tier 2 - Specialized Engineering</option>
                {isAdmin ? (
                  <option value="tier_3">Tier 3 - Core Architecture / SRE</option>
                ) : (
                  <option value="tier_3" disabled>Tier 3 - Core Architecture (Lead Admin Only)</option>
                )}
              </select>
              {!isAdmin && (
                <p className="text-[10px] text-slate-500 mt-1">
                  * Support Engineers can escalate to Tier 2. Tier 3 requires Lead Admin approval.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Justification Reason (min 10 chars)</label>
              <textarea
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="Explain why this requires escalation..."
                rows={2}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded transition-colors"
              >
                Confirm Escalation
              </button>
            </div>
          </form>
        )}

        {/* Reassign Dialog */}
        {showAssignModal && (
          <form onSubmit={handleAssignSubmit} className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Assign Incident</span>
              <button type="button" onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Select Engineer</label>
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              >
                <option value="Sarah Chen">Sarah Chen (Tier 2 Lead)</option>
                <option value="Marcus Vance">Marcus Vance (Tier 3 SRE)</option>
                <option value="Alex Rivera">Alex Rivera (Tier 1 Support)</option>
                <option value="Devon Price">Devon Price (Security Specialist)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
              >
                Assign
              </button>
            </div>
          </form>
        )}

        {/* Immutable Audit Log Timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Immutable Audit Trail</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">SOC2 / ITIL Compliant</span>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
            {ticket.audit_logs && ticket.audit_logs.length > 0 ? (
              ticket.audit_logs.map((log) => (
                <div key={log.id} className="relative flex items-start gap-3 pl-7">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-indigo-500 -translate-x-1/2" />
                  <div className="flex-1 bg-slate-900/50 border border-slate-800/80 rounded-md p-3 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-slate-200">{log.actor}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 font-sans">{log.details}</p>
                    {log.from_state && log.to_state && (
                      <div className="mt-1.5 text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <span>{log.from_state}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-indigo-400 font-semibold">{log.to_state}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 pl-7">No audit logs recorded yet.</p>
            )}
          </div>
        </div>

        {/* Internal Note / Comment Form */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            {isCustomer ? 'Append Customer Comment' : 'Append Investigation Note'}
          </h4>
          <form onSubmit={handleAddNote} className="space-y-2">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder={isCustomer ? 'Provide more details or reply to engineering...' : 'Record investigation hypothesis, reproduction steps, or action item...'}
              rows={2}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-md p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Author: <strong className="text-slate-400">{actorLabel}</strong>
              </span>
              <button
                type="submit"
                disabled={isUpdating || !noteContent.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-md transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
