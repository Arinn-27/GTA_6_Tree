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
      <span className="inline-flex flex-wrap items-baseline gap-2 rounded-xl border border-amber-400/30 bg-amber-500/[0.08] px-3 py-1.5 text-sm leading-relaxed text-amber-50">
        <span>{children}</span>
        <button
          type="button"
          onClick={() => setRevealed(false)}
          className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-200 transition hover:bg-amber-500/25"
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
        className="group inline-flex min-h-10 min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.03] px-3 py-1.5 text-left text-xs font-medium text-slate-300 transition hover:border-amber-400/45 hover:bg-amber-500/[0.06]"
      >
        <EyeOff className="h-3.5 w-3.5 shrink-0 text-amber-400/90 transition group-hover:scale-105" />
        <span className="shrink-0 text-slate-200">{label}</span>
        <span
          aria-hidden="true"
          className="min-w-0 max-w-full select-none truncate rounded bg-white/[0.07] px-2 py-0.5 text-slate-400 blur-[5px] pointer-events-none"
        >
          Hidden mission &amp; plot details
        </span>
        <span className="shrink-0 text-[11px] font-semibold text-amber-300/90 group-hover:text-amber-200">
          Reveal
        </span>
      </button>

      {confirmOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="spoiler-confirm-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            onClick={() => setConfirmOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-amber-400/35 bg-[#101626] p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/15 text-amber-300">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3
                    id="spoiler-confirm-title"
                    className="font-display text-base font-bold text-white"
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

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmOpen(false);
                    setRevealed(true);
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  <Eye className="h-4 w-4" />
                  Reveal Spoiler
                </button>
              </div>
              <div className="mt-4 flex items-center gap-1.5 border-t border-white/[0.07] pt-3 text-[11px] text-slate-400">
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
