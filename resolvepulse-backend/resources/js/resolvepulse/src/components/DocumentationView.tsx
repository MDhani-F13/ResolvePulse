import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Workflow, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight,
  Code2, 
  Terminal,
  Palette,
  Database,
  Search
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'flow' | 'sectors' | 'playbook' | 'styling'>('flow');
  const [sectorSearch, setSectorSearch] = useState('');

  const sectorFiles = [
    {
      sector: '0. Authorization Policies & RBAC (TicketPolicy)',
      purpose: 'Enforces Role-Based Access Control across Customer, Support Engineer, and Lead Admin via dedicated Policy classes invoked in FormRequest::authorize().',
      files: [
        { path: 'server/policies/TicketPolicy.ts', tech: 'TS', desc: 'TicketPolicy class with canView, canUpdateStatus, canEscalate, canAssign' },
        { path: 'laravel-backend/app/Policies/TicketPolicy.php', tech: 'PHP', desc: 'Laravel Policy class registered in AuthServiceProvider' },
        { path: 'server/domain/User.ts', tech: 'TS', desc: 'User domain model with UserRole (customer, support_engineer, lead_admin)' },
        { path: 'laravel-backend/app/Models/User.php', tech: 'PHP', desc: 'Eloquent User model with role helpers (isCustomer, isSupportEngineer, isLeadAdmin)' },
      ]
    },
    {
      sector: '1. Validation & Input Sanitization (FormRequests)',
      purpose: 'Enforces Single Responsibility Principle. Isolates input validation rules so controllers remain clean and decoupled from raw HTTP bodies.',
      files: [
        { path: 'server/requests/FormRequest.ts', tech: 'TS', desc: 'Base FormRequest class producing RFC 7807/Laravel style 422 JSON errors' },
        { path: 'server/requests/TicketRequests.ts', tech: 'TS', desc: 'StoreTicketRequest, UpdateStatusRequest, EscalateRequest, AssignRequest' },
        { path: 'laravel-backend/app/Http/Requests/StoreTicketRequest.php', tech: 'PHP', desc: 'Laravel FormRequest validating title, description, customer email, priority' },
        { path: 'laravel-backend/app/Http/Requests/EscalateTicketRequest.php', tech: 'PHP', desc: 'Enforces minimum 10-character justification for tier escalation' },
      ]
    },
    {
      sector: '2. Presentation & API Transport (Controllers)',
      purpose: 'Translates HTTP verbs and JSON parameters into DTOs and calls domain services. Contains zero SQL queries and zero business algorithms.',
      files: [
        { path: 'server/controllers/TicketController.ts', tech: 'TS', desc: 'Express controller dispatching to ITicketService and returning resource JSON' },
        { path: 'laravel-backend/app/Http/Controllers/Api/TicketController.php', tech: 'PHP', desc: 'Laravel controller using constructor dependency injection' },
        { path: 'laravel-backend/routes/api.php', tech: 'PHP', desc: 'RESTful API routing table for tickets and metrics' },
      ]
    },
    {
      sector: '3. Domain Service Layer (Pure Business Rules & State Machine)',
      purpose: 'Encapsulates domain invariants: SLA deadline computation, status progressions, and automated audit event dispatching.',
      files: [
        { path: 'server/services/SlaEvaluationService.ts', tech: 'TS', desc: 'Computes SLA target hours (2h, 4h, 8h, 24h), remaining time, and breach state' },
        { path: 'server/services/TicketService.ts', tech: 'TS', desc: 'Orchestrates ticket lifecycle and enforces domain invariants' },
        { path: 'laravel-backend/app/Services/SlaEvaluationService.php', tech: 'PHP', desc: 'Equivalent Carbon-based SLA deadline and countdown engine' },
        { path: 'laravel-backend/app/Services/TicketService.php', tech: 'PHP', desc: 'Laravel service orchestrating business use cases' },
      ]
    },
    {
      sector: '4. Repository & Persistence Contracts (Dependency Inversion)',
      purpose: 'Decouples business services from storage mechanisms. Allows swapping SQLite, Postgres, or In-Memory drivers with 0 service edits.',
      files: [
        { path: 'server/contracts/ITicketRepository.ts', tech: 'TS', desc: 'TypeScript repository contract interface' },
        { path: 'server/repositories/InMemoryTicketRepository.ts', tech: 'TS', desc: 'High-fidelity in-memory repository seeded with 12 enterprise tickets' },
        { path: 'laravel-backend/app/Repositories/Contracts/TicketRepositoryInterface.php', tech: 'PHP', desc: 'PHP repository contract interface' },
        { path: 'laravel-backend/app/Repositories/Eloquent/EloquentTicketRepository.php', tech: 'PHP', desc: 'Eloquent ORM implementation with query filters' },
      ]
    },
    {
      sector: '5. Domain Entities & Database Schema',
      purpose: 'Defines entity models, relationships, and indexed schema migrations.',
      files: [
        { path: 'server/domain/Ticket.ts', tech: 'TS', desc: 'Domain models, TicketPriority, TicketStatus, and SupportTier types' },
        { path: 'laravel-backend/app/Models/Ticket.php', tech: 'PHP', desc: 'Eloquent Model with casts, fillables, and auditLogs relation' },
        { path: 'laravel-backend/app/Models/TicketAuditLog.php', tech: 'PHP', desc: 'Eloquent Model for immutable audit trail' },
        { path: 'laravel-backend/database/migrations/*', tech: 'PHP', desc: 'Database migration files creating tickets and audit tables' },
      ]
    },
    {
      sector: '6. Frontend UI Components (React 19)',
      purpose: 'Enterprise SaaS interface adhering to Zero-Pill discipline, tabular figures, and responsive split-views.',
      files: [
        { path: 'src/components/TopBar.tsx', tech: 'TSX', desc: '3-zone Top Bar Contract with wordmark, navigation tabs, and + New CTA' },
        { path: 'src/components/SlaMetricStrip.tsx', tech: 'TSX', desc: '4-card metric strip for Active, Breached, Warning, and Resolved counts' },
        { path: 'src/components/TicketQueueTable.tsx', tech: 'TSX', desc: 'High-density data grid with live search, filters, and countdown bars' },
        { path: 'src/components/TicketDetailDrawer.tsx', tech: 'TSX', desc: 'Slide-over drawer for status transitions, escalations, and audit logs' },
        { path: 'src/components/CreateTicketModal.tsx', tech: 'TSX', desc: 'Incident creation modal displaying FormRequest 422 validation errors' },
        { path: 'src/components/ArchitectureExplorer.tsx', tech: 'TSX', desc: 'Interactive code inspector comparing TypeScript and Laravel' },
      ]
    }
  ];

  const filteredSectors = sectorFiles.filter(sec => 
    sec.sector.toLowerCase().includes(sectorSearch.toLowerCase()) ||
    sec.purpose.toLowerCase().includes(sectorSearch.toLowerCase()) ||
    sec.files.some(f => f.path.toLowerCase().includes(sectorSearch.toLowerCase()) || f.desc.toLowerCase().includes(sectorSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1 font-semibold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>ResolvePulse Developer Manual</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Architecture, Flow &amp; Modification Playbook
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Complete technical documentation covering system request lifecycles, sector breakdown, and developer modification guides for junior, mid, and senior engineers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
              Clean Architecture v1.0
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs sm:text-sm">
        <button
          onClick={() => setActiveSection('flow')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeSection === 'flow' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>System Flow &amp; Usage</span>
        </button>

        <button
          onClick={() => setActiveSection('sectors')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeSection === 'sectors' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>File &amp; Sector Directory</span>
        </button>

        <button
          onClick={() => setActiveSection('playbook')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeSection === 'playbook' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Developer Modification Playbook</span>
        </button>

        <button
          onClick={() => setActiveSection('styling')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeSection === 'styling' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Design &amp; Styling Rules</span>
        </button>
      </div>

      {/* SECTION 1: SYSTEM FLOW & HOW TO USE */}
      {activeSection === 'flow' && (
        <div className="space-y-6">
          {/* Step by Step Sequence */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-400">Step 01</span>
              <h3 className="text-sm font-bold text-white">1. Ingest Incident</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client submits payload. <code className="text-indigo-300 font-mono">StoreTicketRequest</code> checks inputs before reaching controller. If invalid, halts with HTTP 422.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-400">Step 02</span>
              <h3 className="text-sm font-bold text-white">2. Compute SLA Target</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                <code className="text-indigo-300 font-mono">SlaEvaluationService</code> computes exact deadline: Urgent=2h, High=4h, Medium=8h, Low=24h, and stores <code className="text-slate-200 font-mono">sla_due_at</code>.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-400">Step 03</span>
              <h3 className="text-sm font-bold text-white">3. Enforce State Machine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Engineers progress ticket. Invariants prevent invalid states (e.g., cannot resolve unassigned ticket, cannot close without resolving).
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-400">Step 04</span>
              <h3 className="text-sm font-bold text-white">4. Write Audit Trail</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every mutation triggers <code className="text-indigo-300 font-mono">createAuditLog()</code>. An immutable event is stored with actor, timestamp, and delta details.
              </p>
            </div>
          </div>

          {/* Detailed Walkthrough Box */}
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>How to Use the Application Features</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="space-y-1.5 p-3.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <strong className="text-white block font-semibold">Triage &amp; Prioritize:</strong>
                <p className="text-slate-400">
                  Use the <strong>Incident Queue</strong> table to sort by SLA risk or filter by severity. Click any incident to open the <strong>Action Drawer</strong>.
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <strong className="text-white block font-semibold">SLA Breach Radar:</strong>
                <p className="text-slate-400">
                  Switch to the <strong>SLA Breach Radar</strong> to immediately view incidents approaching breach (&lt; 2h) or already breached for quick escalation.
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <strong className="text-white block font-semibold">Code &amp; Laravel Export:</strong>
                <p className="text-slate-400">
                  Open the <strong>Architecture &amp; Laravel</strong> view to inspect the PHP and TypeScript code side-by-side or download the complete ready-to-run ZIP archive.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: FILE & SECTOR DIRECTORY */}
      {activeSection === 'sectors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={sectorSearch}
                onChange={(e) => setSectorSearch(e.target.value)}
                placeholder="Search files or architectural sectors..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Showing {filteredSectors.length} sectors
            </span>
          </div>

          <div className="space-y-4">
            {filteredSectors.map((sector, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{sector.sector}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{sector.purpose}</p>
                </div>

                <div className="divide-y divide-slate-800/60 bg-slate-950 rounded-md border border-slate-800/80 overflow-hidden">
                  {sector.files.map((file, fIdx) => (
                    <div key={fIdx} className="p-2.5 flex items-center justify-between text-xs gap-4">
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-mono text-slate-200 truncate">{file.path}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-slate-400 text-[11px] hidden sm:inline">{file.desc}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                          {file.tech}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: DEVELOPER MODIFICATION PLAYBOOK */}
      {activeSection === 'playbook' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
            <h3 className="text-sm font-bold text-indigo-300 mb-1">
              Checklist for Adding or Modifying Features
            </h3>
            <p className="text-xs text-slate-400">
              When altering functionality, ensure modifications preserve Single Responsibility Principle across all five tiers:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Playbook 1 */}
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Code2 className="w-4 h-4" />
                <span>Feature: Adding a New Field (e.g. root_cause)</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed font-sans">
                <li><strong className="text-white">Domain:</strong> Update <code className="font-mono text-indigo-300">server/domain/Ticket.ts</code> and <code className="font-mono text-indigo-300">$fillable</code> in <code className="font-mono text-indigo-300">app/Models/Ticket.php</code>.</li>
                <li><strong className="text-white">Validation:</strong> Add rule to <code className="font-mono text-indigo-300">server/requests/TicketRequests.ts</code> and <code className="font-mono text-indigo-300">StoreTicketRequest.php</code>.</li>
                <li><strong className="text-white">Migration:</strong> Add column in <code className="font-mono text-indigo-300">database/migrations/xxxx_create_tickets_table.php</code>.</li>
                <li><strong className="text-white">Service:</strong> Update <code className="font-mono text-indigo-300">CreateTicketDTO</code> in <code className="font-mono text-indigo-300">TicketService.ts</code>.</li>
                <li><strong className="text-white">UI:</strong> Add form input in <code className="font-mono text-indigo-300">CreateTicketModal.tsx</code>.</li>
              </ol>
            </div>

            {/* Playbook 2 */}
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Feature: Modifying SLA Thresholds or Priorities</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed font-sans">
                <li><strong className="text-white">Domain Service:</strong> Edit <code className="font-mono text-indigo-300">getTargetHours()</code> in <code className="font-mono text-indigo-300">SlaEvaluationService.ts</code> and <code className="font-mono text-indigo-300">SlaEvaluationService.php</code>.</li>
                <li><strong className="text-white">Validation:</strong> Update the <code className="font-mono text-indigo-300">in:urgent,high,medium,low</code> rule in FormRequests.</li>
                <li><strong className="text-white">UI:</strong> Update the severity selection buttons in <code className="font-mono text-indigo-300">CreateTicketModal.tsx</code>.</li>
                <li><strong className="text-white">Invariant:</strong> Controllers require ZERO edits because SLA computation is fully encapsulated in the service.</li>
              </ol>
            </div>

            {/* Playbook 3 */}
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2.5">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Feature: Adding New State Transition Rules</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed font-sans">
                <li><strong className="text-white">Rule Location:</strong> Add business invariant checks exclusively in <code className="font-mono text-indigo-300">TicketService.updateStatus()</code>.</li>
                <li><strong className="text-white">Never In Controllers:</strong> Controllers must never contain <code className="font-mono text-slate-400">if (status === 'resolved')</code> business checks.</li>
                <li><strong className="text-white">Throw Domain Error:</strong> Throw <code className="font-mono text-indigo-300">DomainValidationError</code> which automatically translates to HTTP 422.</li>
                <li><strong className="text-white">Audit Entry:</strong> Service handles appending to <code className="font-mono text-indigo-300">ITicketRepository.createAuditLog()</code>.</li>
              </ol>
            </div>

            {/* Playbook 4 */}
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Database className="w-4 h-4" />
                <span>Feature: Swapping Database Persistence Driver</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed font-sans">
                <li><strong className="text-white">Implement Interface:</strong> Create a new class implementing <code className="font-mono text-indigo-300">ITicketRepository</code>.</li>
                <li><strong className="text-white">Bind in Composition Root:</strong> In <code className="font-mono text-indigo-300">server.ts</code>, pass your new instance to <code className="font-mono text-indigo-300">new TicketService(myRepository)</code>.</li>
                <li><strong className="text-white">Zero Service Changes:</strong> Notice how <code className="font-mono text-slate-400">TicketService</code> and <code className="font-mono text-slate-400">TicketController</code> require no changes whatsoever (Dependency Inversion Principle).</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: DESIGN & STYLING RULES */}
      {activeSection === 'styling' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
              <h4 className="font-bold text-white text-sm">60-30-10 Color Budget</h4>
              <p className="text-slate-400 leading-relaxed">
                <strong>60%</strong> Neutral slate canvas (<code className="font-mono text-slate-300">bg-slate-950</code>), <strong>30%</strong> structural surfaces (<code className="font-mono text-slate-300">bg-slate-900</code>, <code className="font-mono text-slate-300">border-slate-800</code>), and <strong>10%</strong> high-intent accent (<code className="font-mono text-indigo-400">bg-indigo-600</code>).
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
              <h4 className="font-bold text-white text-sm">Zero-Pill Discipline</h4>
              <p className="text-slate-400 leading-relaxed">
                Static metadata (categories, tags, timestamps, statuses) must never be enclosed in pill capsules or colored badge sandwiches. Render metadata as clean, unboxed text separated with subtle typographic dots (<code className="font-mono text-slate-300">·</code>).
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
              <h4 className="font-bold text-white text-sm">Tabular Numerals</h4>
              <p className="text-slate-400 leading-relaxed">
                All countdown counters, timestamps, metric figures, and ticket numbers must strictly use <code className="font-mono text-indigo-300">tabular-nums font-mono</code> to align decimal points vertically and eliminate layout jitter.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
