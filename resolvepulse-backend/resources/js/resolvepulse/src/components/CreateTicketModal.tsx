import React, { useState } from 'react';
import { TicketPriority } from '../types/ticket';
import { ticketApi, ApiError } from '../api/ticketClient';
import { X, AlertCircle, ShieldCheck, Clock } from 'lucide-react';

import { User } from '../types/user';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser?: User | null;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [priority, setPriority] = useState<TicketPriority>('high');
  const [tagsInput, setTagsInput] = useState('API, Production');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Sync if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      await ticketApi.createTicket({
        title,
        description,
        customer_name: customerName,
        customer_email: customerEmail,
        priority,
        tags
      });

      // Reset and close
      setTitle('');
      setDescription('');
      setCustomerName('');
      setCustomerEmail('');
      setPriority('high');
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
        setGeneralError('Validation failed according to FormRequest constraints.');
      } else {
        setGeneralError(err.message || 'Failed to submit incident ticket.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const slaTargets: Record<TicketPriority, { hours: number; desc: string }> = {
    urgent: { hours: 2, desc: 'Critical Outage / Revenue Loss' },
    high: { hours: 4, desc: 'Core Function Impairment' },
    medium: { hours: 8, desc: 'Degraded Performance' },
    low: { hours: 24, desc: 'Minor Bug / General Inquiry' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-semibold block mb-0.5">
              FormRequest Validation Flow
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Report Support Incident
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div className="px-5 py-3 bg-rose-950/80 border-b border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Incident Summary <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., PgBouncer connection pool saturation on /api/v1/checkout"
              className={`w-full text-xs sm:text-sm bg-slate-900 border rounded-md p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none ${
                fieldErrors.title ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              }`}
            />
            {fieldErrors.title && (
              <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.title[0]}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Reproduction Steps &amp; Impact <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, error codes, and customer business impact (min 15 characters)..."
              rows={3}
              className={`w-full text-xs sm:text-sm bg-slate-900 border rounded-md p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none ${
                fieldErrors.description ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.description[0]}</p>
            )}
          </div>

          {/* Customer info 2-column split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Customer Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., Jordan Davis"
                className={`w-full text-xs bg-slate-900 border rounded-md p-2 text-slate-100 placeholder-slate-500 focus:outline-none ${
                  fieldErrors.customer_name ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
              {fieldErrors.customer_name && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.customer_name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Customer Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="jordan@clientcorp.com"
                className={`w-full text-xs bg-slate-900 border rounded-md p-2 text-slate-100 placeholder-slate-500 focus:outline-none ${
                  fieldErrors.customer_email ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
              {fieldErrors.customer_email && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.customer_email[0]}</p>
              )}
            </div>
          </div>

          {/* Priority selection & SLA target preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Incident Severity &amp; Computed SLA Target
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['urgent', 'high', 'medium', 'low'] as TicketPriority[]).map((p) => {
                const target = slaTargets[p];
                const isSelected = priority === p;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? p === 'urgent'
                          ? 'bg-rose-950/40 border-rose-600 text-rose-200'
                          : p === 'high'
                          ? 'bg-amber-950/40 border-amber-600 text-amber-200'
                          : 'bg-indigo-950/40 border-indigo-600 text-indigo-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold capitalize text-xs">{p}</span>
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold block text-white">
                      {target.hours}h SLA
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Incident Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Postgres, API, Checkout"
              className="w-full text-xs bg-slate-900 border border-slate-800 rounded-md p-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Educational Callout on Single Responsibility Principle */}
          <div className="p-3 bg-slate-900/60 border border-indigo-900/50 rounded-lg flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400 leading-normal">
              <span className="font-semibold text-indigo-300">Clean Architecture in action: </span>
              Submitting this form triggers <code className="text-slate-200 font-mono">StoreTicketRequest</code>. Validation errors are returned as a standard HTTP 422 payload without ever reaching or polluting the database layer.
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-md transition-colors shadow-sm"
            >
              {isSubmitting ? 'Validating & Registering...' : 'Submit Incident Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
