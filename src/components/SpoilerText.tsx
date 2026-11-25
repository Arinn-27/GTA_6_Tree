import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface SpoilerTextProps {
  children: ReactNode;
  label?: string;
}

export function SpoilerText({
  children,
  label = 'Story spoiler',
}: SpoilerTextProps) {
  // Never persist reveal state so spoilers automatically re-blur on page reload.
  const [revealed, setRevealed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!confirmOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setConfirmOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmOpen]);

  if (revealed) {
    return (
      <span className="inline-flex flex-wrap items-baseline gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-sm text-amber-100">
        <span>{children}</span>
        <button
          type="button"
          onClick={() => setRevealed(false)}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20 hover:text-amber-100"
          title="Re-blur spoiler"
        >
          <EyeOff className="h-3 w-3" />
          Hide
        </button>
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        aria-label={`Reveal hidden ${label.toLowerCase()}`}
        className="group inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-slate-700/80 bg-slate-900/90 px-2.5 py-1.5 text-left text-xs font-medium text-slate-300 transition hover:border-amber-400/60 hover:bg-slate-800/90 sm:flex-nowrap"
      >
        <EyeOff className="h-3.5 w-3.5 shrink-0 text-amber-400 transition group-hover:scale-105" />
        <span className="shrink-0 text-slate-200">{label}</span>
        <span
          aria-hidden="true"
          className="min-w-0 max-w-full select-none truncate rounded bg-slate-800/80 px-1.5 py-0.5 text-slate-400 blur-[5px] pointer-events-none"
        >
          Hidden mission &amp; plot consequence details
        </span>
        <span className="shrink-0 text-[11px] font-semibold text-amber-300 group-hover:text-amber-200">
          Click to reveal
        </span>
      </button>

      {confirmOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="spoiler-confirm-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-surface-elevated p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3
                    id="spoiler-confirm-title"
                    className="text-base font-semibold text-white"
                  >
                    Are you sure? This contains a story spoiler.
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    This reveals specific mission names, character outcomes, or
                    ending consequences. Revealed spoilers automatically reset
                    to blurred when you reload this page.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmOpen(false);
                    setRevealed(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                >
                  <Eye className="h-4 w-4" />
                  Reveal Spoiler
                </button>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />
                Spoiler reveal state is never saved to localStorage.
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
