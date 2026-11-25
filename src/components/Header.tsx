import {
  ArrowLeftRight,
  BookmarkCheck,
  Coffee,
  Compass,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';
import { SUPPORT_LABEL, SUPPORT_URL } from '../config/site';
import type { AppTab } from '../types/tracker';

interface HeaderProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  checkedSlotsCount: number;
  totalCheckpoints: number;
  completedEndingsCount: number;
  totalEndings: number;
  onOpenSync: () => void;
}

export function Header({
  activeTab,
  onSelectTab,
  checkedSlotsCount,
  totalCheckpoints,
  completedEndingsCount,
  totalEndings,
  onOpenSync,
}: HeaderProps) {
  const tabs: {
    id: AppTab;
    label: string;
    mobileLabel: string;
    badge: string;
    icon: typeof BookmarkCheck;
  }[] = [
    {
      id: 'save-tracker',
      label: 'Save Tracker',
      mobileLabel: 'Saves',
      badge: `${checkedSlotsCount}/${totalCheckpoints}`,
      icon: BookmarkCheck,
    },
    {
      id: 'branch-tree',
      label: 'Branch Tree',
      mobileLabel: 'Tree',
      badge: '15 Slots',
      icon: GitBranch,
    },
    {
      id: 'ending-nav',
      label: 'Ending Navigator',
      mobileLabel: 'Endings',
      badge: `${completedEndingsCount}/${totalEndings}`,
      icon: Compass,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle/80 bg-[#080b14]/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-rose-500/20 shadow-inner"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 32 32"
                className="h-6 w-6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 16h8l6-7h6M14 16l6 7h6"
                  stroke="#22d3ee"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="6" cy="16" r="2.6" fill="#22d3ee" />
                <circle cx="26" cy="9" r="2.6" fill="#34d399" />
                <circle cx="26" cy="23" r="2.6" fill="#fb7185" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-sm font-bold tracking-tight text-white sm:text-lg">
                  GTA 6 Save &amp; Branch Tracker
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  Spoiler-Free
                </span>
              </div>
              <p className="hidden text-xs text-slate-400 sm:block">
                15-Slot Manual Save Planner &amp; Deterministic 8-Ending Branch Navigator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSync}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/90 bg-surface-elevated px-2.5 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-cyan-400/60 hover:text-cyan-200 sm:px-3 sm:py-2"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-400" />
              <span>Sync</span>
            </button>
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/35 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-200 transition hover:border-rose-400/70 hover:bg-rose-500/20 sm:px-3 sm:py-2"
            >
              <Coffee className="h-3.5 w-3.5 text-rose-300" />
              <span className="hidden sm:inline">{SUPPORT_LABEL}</span>
              <span className="sm:hidden">Ko-fi</span>
            </a>
          </div>
        </div>

        <nav
          aria-label="Primary sections"
          role="tablist"
          className="mt-3 grid grid-cols-3 gap-1.5 rounded-xl border border-border-subtle bg-surface p-1"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition sm:gap-2 sm:px-3 sm:text-sm ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-200 shadow-sm ring-1 ring-cyan-400/40'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-cyan-300' : 'text-slate-400'
                  }`}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.mobileLabel}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold sm:px-2 sm:text-[11px] ${
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-200'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
