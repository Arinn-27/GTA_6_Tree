import {
  ArrowLeftRight,
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
  completedEndingsCount: number;
  totalEndings: number;
  onOpenSync: () => void;
}

export function Header({
  activeTab,
  onSelectTab,
  completedEndingsCount,
  totalEndings,
  onOpenSync,
}: HeaderProps) {
  const tabs: {
    id: AppTab;
    label: string;
    mobileLabel: string;
    badge: string;
    icon: typeof GitBranch;
  }[] = [
    {
      id: 'story-tree',
      label: 'Story Decision Tree',
      mobileLabel: 'Decision Tree',
      badge: '8 Endings',
      icon: GitBranch,
    },
    {
      id: 'ending-nav',
      label: 'Ending Simulator',
      mobileLabel: 'Simulator',
      badge: `${completedEndingsCount}/${totalEndings}`,
      icon: Compass,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#070911]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            onSelectTab('story-tree');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex shrink-0 items-center gap-2.5 text-left"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-rose-500/20"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 32 32"
              className="h-5 w-5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 6v8l-7 6v6M16 14l7 6v6"
                stroke="#22d3ee"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="6" r="2.6" fill="#22d3ee" />
              <circle cx="9" cy="26" r="2.6" fill="#34d399" />
              <circle cx="23" cy="26" r="2.6" fill="#fb7185" />
            </svg>
          </span>
          <span className="flex items-center gap-2">
            <span className="font-display whitespace-nowrap text-base font-bold tracking-tight text-white sm:text-lg">
              ViceBranch
            </span>
            <span className="hidden items-center gap-1 whitespace-nowrap rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 lg:inline-flex">
              <ShieldCheck className="h-3 w-3 shrink-0" />
              Spoiler-Free
            </span>
          </span>
        </button>

        {/* Desktop Single-Row Website Navigation */}
        <nav
          aria-label="Primary sections"
          role="tablist"
          className="hidden h-full items-center gap-1 md:flex"
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
                className={`relative flex h-full shrink-0 items-center gap-1.5 whitespace-nowrap px-3 text-[13px] font-medium transition ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isActive ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-200'
                      : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-300"
                  />
                )}
              </button>
            );
          })}
          <a
            href="#guide"
            className="flex h-full shrink-0 items-center whitespace-nowrap px-2.5 text-[13px] font-medium text-slate-400 transition hover:text-slate-200"
          >
            Mechanics
          </a>
          <a
            href="#faq"
            className="flex h-full shrink-0 items-center whitespace-nowrap px-2.5 text-[13px] font-medium text-slate-400 transition hover:text-slate-200"
          >
            FAQ
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenSync}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/[0.08] hover:text-white sm:min-h-9"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-400" />
            <span>Sync</span>
          </button>
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={SUPPORT_LABEL}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:border-rose-400/60 hover:bg-rose-500/20 sm:min-h-9"
          >
            <Coffee className="h-3.5 w-3.5 text-rose-300" />
            <span>Ko-fi</span>
          </a>
        </div>
      </div>

      {/* Clean Mobile Underline Tab Bar (<md) */}
      <nav
        aria-label="Mobile sections"
        role="tablist"
        className="grid grid-cols-2 border-t border-white/[0.06] bg-[#070911]/95 md:hidden"
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
              className={`relative flex min-h-11 items-center justify-center gap-1.5 px-2 text-xs font-semibold transition ${
                isActive ? 'text-white' : 'text-slate-400'
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${
                  isActive ? 'text-cyan-400' : 'text-slate-500'
                }`}
              />
              <span className="whitespace-nowrap">{tab.mobileLabel}</span>
              <span
                className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-200'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-cyan-400"
                />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
