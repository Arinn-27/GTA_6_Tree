import { useEffect, useState } from 'react';
import { ArrowLeftRight, Coffee, Info, Shield, X } from 'lucide-react';
import { ADSENSE_CONFIG, SUPPORT_LABEL, SUPPORT_URL } from '../config/site';
import type { AppTab } from '../types/tracker';

interface FooterProps {
  onSelectTab: (tab: AppTab) => void;
  onOpenSync: () => void;
}

type FooterModalKind = 'privacy' | 'about' | null;

export function Footer({ onSelectTab, onOpenSync }: FooterProps) {
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

  const jumpToTab = (tab: AppTab) => {
    onSelectTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 border-t border-white/[0.08] bg-[#06080f] pb-12 pt-10">
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
        {/* Subtle, CLS-safe AdSense placement */}
        <div
          aria-label="Advertisement slot placeholder"
          data-ad-client={ADSENSE_CONFIG.publisherIdPlaceholder}
          data-ad-slot={ADSENSE_CONFIG.slotIdPlaceholder}
          className="flex min-h-[100px] items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 text-center sm:min-h-[90px]"
        >
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Sponsored Placement · AdSense Ready
            </p>
            <p className="text-xs text-slate-600">
              Non-intrusive reserved footer slot — zero popups, zero layout shift
            </p>
          </div>
        </div>

        {/* Multi-column Website Footer */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="space-y-3 lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-rose-500/20"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 32 32"
                  className="h-4 w-4"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 16h8l6-7h6M14 16l6 7h6"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="6" cy="16" r="2.6" fill="#22d3ee" />
                  <circle cx="26" cy="9" r="2.6" fill="#34d399" />
                  <circle cx="26" cy="23" r="2.6" fill="#fb7185" />
                </svg>
              </span>
              <span className="font-display text-base font-bold text-white">
                ViceBranch
              </span>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-slate-400">
              A spoiler-free 15-slot save planner and deterministic 8-ending
              branch navigator built to keep your campaign organized without
              ruining story moments.
            </p>
            <div className="pt-1">
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-500/20"
              >
                <Coffee className="h-3.5 w-3.5 text-rose-300" />
                {SUPPORT_LABEL}
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="space-y-3 lg:col-span-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300">
              Tools &amp; Guides
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => jumpToTab('save-tracker')}
                  className="transition hover:text-cyan-200"
                >
                  15-Slot Save Tracker
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpToTab('branch-tree')}
                  className="transition hover:text-cyan-200"
                >
                  Anchor &amp; Branch Tree
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpToTab('ending-nav')}
                  className="transition hover:text-cyan-200"
                >
                  8-Ending Simulator
                </button>
              </li>
              <li>
                <a href="#guide" className="transition hover:text-cyan-200">
                  Core Mechanics Handbook
                </a>
              </li>
              <li>
                <a href="#faq" className="transition hover:text-cyan-200">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Resources & Legal Column */}
          <div className="space-y-3 lg:col-span-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300">
              Privacy &amp; Backup
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenSync}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-400" />
                Sync / Backup
              </button>
              <button
                type="button"
                onClick={() => setModal('privacy')}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/25 hover:text-white"
              >
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setModal('about')}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/25 hover:text-white"
              >
                <Info className="h-3.5 w-3.5 text-cyan-400" />
                About
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Unofficial fan-made save planning tool. Not affiliated with,
              endorsed by, or connected to Rockstar Games or Take-Two
              Interactive. Contains zero copyrighted game logos, artwork, or map
              tiles.
            </p>
          </div>
        </div>
      </div>

      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="footer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#101626] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                id="footer-modal-title"
                className="font-display text-lg font-bold text-white"
              >
                {modal === 'privacy'
                  ? 'Privacy Policy'
                  : 'About This Companion Tool'}
              </h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Close modal"
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
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
                  <code className="rounded bg-canvas px-1.5 py-0.5 text-xs text-cyan-300">
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
                  If Google AdSense is enabled on the deployed domain,
                  third-party ad scripts may use cookies or local identifiers in
                  accordance with Google&apos;s advertising policies to serve
                  non-intrusive footer ads.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
                <p>
                  <strong className="text-white">ViceBranch</strong> is a
                  spoiler-free GTA 6 15-slot save tracker and ending branch
                  navigator built to help players explore all 8 confirmed
                  endings in a single campaign without accidental autosave
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

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="min-h-11 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
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
