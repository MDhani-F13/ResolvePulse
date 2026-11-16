import React, { useState, useEffect } from 'react';
import { ArchitectureLayer } from '../types/ticket';
import { ticketApi } from '../api/ticketClient';
import { 
  Download, 
  Copy, 
  Check, 
  Code2, 
  FileCode, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  FolderTree,
  Terminal,
  ExternalLink
} from 'lucide-react';

export const ArchitectureExplorer: React.FC = () => {
  const [layers, setLayers] = useState<ArchitectureLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('requests');
  const [activeCodeLang, setActiveCodeLang] = useState<'laravel' | 'typescript'>('laravel');
  const [fileContent, setFileContent] = useState<string>('');
  const [currentFilePath, setCurrentFilePath] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Laravel files browser list
  const laravelFiles = [
    { name: 'TicketPolicy.php', path: 'laravel-backend/app/Policies/TicketPolicy.php', layer: 'policies', tag: 'Policy' },
    { name: 'StoreTicketRequest.php', path: 'laravel-backend/app/Http/Requests/StoreTicketRequest.php', layer: 'requests', tag: 'FormRequest' },
    { name: 'UpdateTicketStatusRequest.php', path: 'laravel-backend/app/Http/Requests/UpdateTicketStatusRequest.php', layer: 'requests', tag: 'FormRequest' },
    { name: 'TicketController.php', path: 'laravel-backend/app/Http/Controllers/Api/TicketController.php', layer: 'controllers', tag: 'Controller' },
    { name: 'AuthController.php', path: 'laravel-backend/app/Http/Controllers/Api/AuthController.php', layer: 'controllers', tag: 'Controller' },
    { name: 'TicketService.php', path: 'laravel-backend/app/Services/TicketService.php', layer: 'services', tag: 'Service' },
    { name: 'SlaEvaluationService.php', path: 'laravel-backend/app/Services/SlaEvaluationService.php', layer: 'services', tag: 'Service' },
    { name: 'TicketRepositoryInterface.php', path: 'laravel-backend/app/Repositories/Contracts/TicketRepositoryInterface.php', layer: 'repositories', tag: 'Interface' },
    { name: 'EloquentTicketRepository.php', path: 'laravel-backend/app/Repositories/Eloquent/EloquentTicketRepository.php', layer: 'repositories', tag: 'Eloquent' },
    { name: 'Ticket.php', path: 'laravel-backend/app/Models/Ticket.php', layer: 'domain', tag: 'Model' },
    { name: 'User.php', path: 'laravel-backend/app/Models/User.php', layer: 'domain', tag: 'Model' },
    { name: 'TicketAuditLog.php', path: 'laravel-backend/app/Models/TicketAuditLog.php', layer: 'domain', tag: 'Model' },
    { name: 'api.php', path: 'laravel-backend/routes/api.php', layer: 'controllers', tag: 'Routes' },
    { name: '2026_10_20_000001_create_tickets_table.php', path: 'laravel-backend/database/migrations/2026_10_20_000001_create_tickets_table.php', layer: 'domain', tag: 'Migration' },
    { name: 'README.md', path: 'laravel-backend/README.md', layer: 'docs', tag: 'Guide' }
  ];

  // TypeScript files equivalent
  const tsFiles: Record<string, string> = {
    requests: 'server/requests/TicketRequests.ts',
    controllers: 'server/controllers/TicketController.ts',
    services: 'server/services/TicketService.ts',
    repositories: 'server/contracts/ITicketRepository.ts',
    domain: 'server/domain/Ticket.ts'
  };

  useEffect(() => {
    loadLayers();
  }, []);

  const loadLayers = async () => {
    try {
      const data = await ticketApi.getArchitectureLayers();
      setLayers(data.layers);
      if (data.layers.length > 0) {
        loadFile(data.layers[0].laravel_file);
      }
    } catch (err) {
      console.error('Failed to load layers:', err);
    }
  };

  const loadFile = async (path: string) => {
    setIsLoadingFile(true);
    setCurrentFilePath(path);
    try {
      const res = await ticketApi.getFileContent(path);
      setFileContent(res.content);
    } catch (err) {
      console.error('Failed to load file content:', err);
      setFileContent('// File could not be loaded.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleLayerSelect = (layer: ArchitectureLayer) => {
    setSelectedLayerId(layer.id);
    const targetPath = activeCodeLang === 'laravel' ? layer.laravel_file : layer.typescript_file;
    loadFile(targetPath);
  };

  const handleLangToggle = (lang: 'laravel' | 'typescript') => {
    setActiveCodeLang(lang);
    const activeLayer = layers.find(l => l.id === selectedLayerId);
    if (activeLayer) {
      const targetPath = lang === 'laravel' ? activeLayer.laravel_file : activeLayer.typescript_file;
      loadFile(targetPath);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      await ticketApi.downloadLaravelZip();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  return (
    <div className="space-y-6">
      {/* Banner / Hero Card */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Clean Architecture &amp; SRP Blueprint</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Laravel 11 &amp; TypeScript Dual Implementation
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Inspect how the Single Responsibility Principle separates HTTP Request Validation, Presentation Controllers, Domain Service Rules, and Repository Contracts. Export the complete Laravel codebase directly to run locally with <code className="text-indigo-300 font-mono">php artisan</code>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Bundling ZIP...' : exportSuccess ? 'Downloaded!' : 'Export Laravel (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Layer Interactive Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
        {layers.map((layer, index) => {
          const isSelected = selectedLayerId === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => handleLayerSelect(layer)}
              className={`p-3.5 rounded-lg border text-left transition-all relative ${
                isSelected
                  ? 'bg-indigo-950/70 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className={isSelected ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                  0{index + 1}
                </span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
              </div>
              <h3 className={`text-xs font-bold leading-tight mb-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                {layer.name.split('(')[0].trim()}
              </h3>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {layer.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Dual Code Viewer & File Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Laravel Files Tree & Principles (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* File Explorer Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
                <span>Laravel Source Files</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">12 files</span>
            </div>

            <div className="space-y-1">
              {laravelFiles.map((file) => {
                const isActive = currentFilePath === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => {
                      setActiveCodeLang('laravel');
                      loadFile(file.path);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate font-mono">{file.name}</span>
                    </div>
                    <span className={`text-[10px] uppercase font-mono px-1 rounded ${
                      isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {file.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clean Architecture Principles Card */}
          {selectedLayer && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Why this passes Code Review
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedLayer.description}
              </p>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Core Invariants Enforced:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLayer.rules_demonstrated.map((rule) => (
                    <span
                      key={rule}
                      className="px-2 py-0.5 text-[11px] font-mono bg-slate-950 border border-slate-800 text-indigo-300 rounded"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Local Deployment Guide */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 text-xs text-slate-400 space-y-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Run Laravel Locally</span>
            </span>
            <div className="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-slate-300 space-y-1">
              <div>$ composer install</div>
              <div>$ cp .env.example .env</div>
              <div>$ php artisan migrate --seed</div>
              <div>$ php artisan serve</div>
            </div>
          </div>
        </div>

        {/* Right Column: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
          {/* Code Viewer Toolbar */}
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-4">
            {/* Language Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
              <button
                onClick={() => handleLangToggle('laravel')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeCodeLang === 'laravel'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                PHP / Laravel 11
              </button>
              <button
                onClick={() => handleLangToggle('typescript')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeCodeLang === 'typescript'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                TypeScript / Express
              </button>
            </div>

            {/* Path and Copy button */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 truncate max-w-xs hidden sm:inline">
                {currentFilePath}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 overflow-x-auto flex-1 max-h-[580px] font-mono text-xs leading-relaxed text-slate-200 bg-slate-950">
            {isLoadingFile ? (
              <div className="flex items-center justify-center py-24 text-slate-500">
                Loading source code...
              </div>
            ) : (
              <pre className="whitespace-pre">
                <code>{fileContent}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
