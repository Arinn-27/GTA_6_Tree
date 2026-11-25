import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import type { PersistedAppState } from '../types/tracker';
import { decodeSyncCode, encodeSyncCode } from '../utils/syncCodec';

interface SyncModalProps {
  open: boolean;
  onClose: () => void;
  state: PersistedAppState;
  onImportState: (next: PersistedAppState) => void;
  onResetState: () => void;
}

export function SyncModal({
  open,
  onClose,
  state,
  onImportState,
  onResetState,
}: SyncModalProps) {
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const exportCode = useMemo(() => encodeSyncCode(state), [state]);

  const decodedPreview = useMemo(() => {
    if (!importText.trim()) {
      return null;
    }
    return decodeSyncCode(importText);
  }, [importText]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setConfirmReset(false);
      setImportSuccess(false);
      setCopied(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback selection copy if clipboard permissions are blocked.
      const input = document.getElementById(
        'sync-export-textarea'
      ) as HTMLTextAreaElement | null;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleApplyImport = () => {
    if (!decodedPreview || !decodedPreview.ok) {
      return;
    }
    onImportState(decodedPreview.state);
    setImportSuccess(true);
    setImportText('');
    window.setTimeout(() => setImportSuccess(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-subtle bg-surface-elevated p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="sync-modal-title"
              className="text-lg font-bold text-white"
            >
              Backup &amp; Cross-Device Sync
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              100% offline Base64 sync codes. No account or cloud server needed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sync modal"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Export Section */}
        <section className="mt-5 space-y-2.5 rounded-xl border border-border-subtle bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
              <Upload className="h-4 w-4 text-cyan-400" />
              Export Current Progress
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-400/40 transition hover:bg-cyan-500/25"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <textarea
            id="sync-export-textarea"
            readOnly
            value={exportCode}
            rows={3}
            aria-label="Exported Base64 sync code"
            className="w-full resize-none rounded-lg border border-slate-800 bg-canvas px-3 py-2 font-mono text-xs text-slate-300 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">
            Includes {state.checkedSlots.length}/12 checkpoints,{' '}
            {state.completedEndings.length}/8 endings, and Chapter{' '}
            {state.currentChapter}. Spoiler reveal state is never exported.
          </p>
        </section>

        {/* Import Section */}
        <section className="mt-4 space-y-2.5 rounded-xl border border-border-subtle bg-surface p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Download className="h-4 w-4 text-emerald-400" />
            Import Sync Code
          </div>
          <textarea
            value={importText}
            onChange={(event) => {
              setImportText(event.target.value);
              setImportSuccess(false);
            }}
            placeholder="Paste a Base64 sync code from another device..."
            rows={3}
            aria-label="Paste Base64 sync code to import"
            className="w-full resize-none rounded-lg border border-slate-700 bg-canvas px-3 py-2 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />

          {decodedPreview && !decodedPreview.ok && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <span>{decodedPreview.error}</span>
            </div>
          )}

          {decodedPreview && decodedPreview.ok && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>
                  Valid backup: {decodedPreview.state.checkedSlots.length}/12
                  slots · {decodedPreview.state.completedEndings.length}/8
                  endings · Ch. {decodedPreview.state.currentChapter}
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyImport}
                className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Apply Backup
              </button>
            </div>
          )}

          {importSuccess && (
            <p className="text-xs font-medium text-emerald-300">
              Backup imported and saved to localStorage.
            </p>
          )}
        </section>

        {/* Danger Zone */}
        <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/25 bg-rose-950/20 p-4">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-rose-200">Reset Progress:</span>{' '}
            Clears saved checkpoints, endings, and current chapter locally.
          </div>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Local Data
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetState();
                  setConfirmReset(false);
                }}
                className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-400"
              >
                Confirm Reset
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
