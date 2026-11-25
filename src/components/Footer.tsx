import { useEffect, useState } from 'react';
import { Info, Shield, X } from 'lucide-react';
import { ADSENSE_CONFIG } from '../config/site';

type FooterModalKind = 'privacy' | 'about' | null;

export function Footer() {
  const [modal, setModal] = useState<FooterModalKind>(null);

  useEffect(() => {
    if (!modal) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal]);

  return (
    <footer className="mt-10 border-t border-border-subtle bg-[#080b14] pb-10 pt-8">
      <div className="mx-auto max-w-6xl space-y-6 px-3 sm:px-6">
        {/* Non-intrusive, CLS-safe AdSense placeholder */}
        <div
          aria-label="Advertisement slot placeholder"
          data-ad-client={ADSENSE_CONFIG.publisherIdPlaceholder}
          data-ad-slot={ADSENSE_CONFIG.slotIdPlaceholder}
          className="flex min-h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-surface/60 px-4 py-3 text-center sm:min-h-[90px]"
        >
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              {ADSENSE_CONFIG.slotLabel}
            </p>
            <p className="text-xs text-slate-500">
              Reserved responsive footer placement (no layout shift, zero popups)
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-border-subtle/70 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p className="max-w-2xl leading-relaxed">
            Unofficial fan-made save planning tool. Not affiliated with,
            endorsed by, or connected to Rockstar Games or Take-Two Interactive.
            Contains zero copyrighted game logos, artwork, or map tiles.
          </p>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setModal('privacy')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-surface px-3 py-1.5 font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setModal('about')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-surface px-3 py-1.5 font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              About
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="footer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border-subtle bg-surface-elevated p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                id="footer-modal-title"
                className="text-lg font-bold text-white"
              >
                {modal === 'privacy'
                  ? 'Privacy Policy'
                  : 'About This Companion Tool'}
              </h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modal === 'privacy' ? (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
                <p>
                  <strong className="text-white">Local-Only Storage:</strong>{' '}
                  This application runs 100% client-side as a static site. Your
                  checked save slots, completed endings, and current chapter are
                  stored exclusively in your browser&apos;s{' '}
                  <code className="rounded bg-slate-900 px-1.5 py-0.5 text-xs text-cyan-300">
                    localStorage
                  </code>
                  . We do not collect, transmit, or store personal data on any
                  backend server.
                </p>
                <p>
                  <strong className="text-white">Offline Sync Codes:</strong>{' '}
                  Exported sync codes are Base64-encoded snapshots of your
                  progress JSON generated locally in your browser.
                </p>
                <p>
                  <strong className="text-white">Advertising Notice:</strong>{' '}
                  If Google AdSense is enabled on the deployed domain, third-party
                  ad scripts may use cookies or local identifiers in accordance
                  with Google&apos;s advertising policies to serve non-intrusive
                  footer ads.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
                <p>
                  The <strong className="text-white">GTA 6 15-Slot Save Tracker &amp; Ending Branch Navigator</strong>{' '}
                  is built to help players explore all 8 confirmed endings in a
                  single campaign without story spoilers or accidental autosave
                  losses.
                </p>
                <p>
                  <strong className="text-white">Spoiler Protection:</strong>{' '}
                  All mission titles, plot pivots, and ending outcomes stay
                  blurred behind a confirmation prompt and automatically reset
                  to blurred whenever you reload the page.
                </p>
                <p>
                  <strong className="text-white">Launch-Week Notes:</strong>{' '}
                  Certain Route B standoff edge cases (e6 &amp; e7) include
                  verification notes reflecting early launch-week community
                  testing. Keep Slots 8 and 10 backed up until confirmed on your
                  patch.
                </p>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
