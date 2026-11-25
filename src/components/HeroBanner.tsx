import {
  ArrowRight,
  BookmarkCheck,
  Compass,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';
import type { AppTab, ChapterNumber } from '../types/tracker';

interface HeroBannerProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  checkedSlotsCount: number;
  totalCheckpoints: number;
  completedEndingsCount: number;
  totalEndings: number;
  currentChapter: ChapterNumber;
}

export function HeroBanner({
  activeTab,
  onSelectTab,
  checkedSlotsCount,
  totalCheckpoints,
  completedEndingsCount,
  totalEndings,
  currentChapter,
}: HeroBannerProps) {
  const savesPct = Math.round((checkedSlotsCount / totalCheckpoints) * 100);
  const endingsPct = Math.round((completedEndingsCount / totalEndings) * 100);

  return (
    <section className="relative overflow-hidden border-b border-white/[0.07]">
      <div
        aria-hidden="true"
        className="hero-grid-pattern pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-11">
        <div className="grid items-end gap-7 lg:grid-cols-12">
          {/* Editorial Headline & Value Prop */}
          <div className="min-w-0 space-y-4 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/[0.08] px-3 py-1 text-xs font-medium text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Spoiler-Free Companion · 100% Local &amp; Private</span>
            </div>

            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
              Unlock{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-rose-300 bg-clip-text text-transparent">
                All 8 GTA 6 Endings
              </span>{' '}
              in One Playthrough.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              With no mission replay menu and only one autosave slot, a single
              missed checkpoint can cost dozens of hours. Plan your 15 manual
              slots, follow clean rewind anchors, and map every finale branch
              without spoiling the story.
            </p>

            {/* Quick Workspace Jump Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onSelectTab('save-tracker')}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${
                  activeTab === 'save-tracker'
                    ? 'bg-white text-slate-950 shadow-md shadow-white/10'
                    : 'border border-white/12 bg-white/[0.04] text-slate-200 hover:border-white/25 hover:bg-white/[0.08]'
                }`}
              >
                <BookmarkCheck className="h-4 w-4" />
                Save Checklist
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('branch-tree')}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${
                  activeTab === 'branch-tree'
                    ? 'bg-white text-slate-950 shadow-md shadow-white/10'
                    : 'border border-white/12 bg-white/[0.04] text-slate-200 hover:border-white/25 hover:bg-white/[0.08]'
                }`}
              >
                <GitBranch className="h-4 w-4" />
                Branch Tree
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('ending-nav')}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${
                  activeTab === 'ending-nav'
                    ? 'bg-white text-slate-950 shadow-md shadow-white/10'
                    : 'border border-white/12 bg-white/[0.04] text-slate-200 hover:border-white/25 hover:bg-white/[0.08]'
                }`}
              >
                <Compass className="h-4 w-4" />
                Ending Simulator
                <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </button>
            </div>
          </div>

          {/* Live Campaign Summary Strip */}
          <div className="min-w-0 lg:col-span-5">
            <div className="surface-card grid grid-cols-3 divide-x divide-white/[0.07] rounded-2xl border border-white/[0.09] p-1">
              <button
                type="button"
                onClick={() => onSelectTab('save-tracker')}
                className="group flex flex-col justify-between rounded-xl p-3 text-left transition hover:bg-white/[0.03] sm:p-4"
              >
                <span className="text-[11px] font-medium text-slate-400">
                  Saves Locked
                </span>
                <div className="mt-2 font-display text-xl font-bold tabular-nums text-white sm:text-2xl">
                  {checkedSlotsCount}
                  <span className="text-sm font-medium text-slate-500">
                    /{totalCheckpoints}
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-300 transition-all duration-300"
                    style={{ width: `${savesPct}%` }}
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('ending-nav')}
                className="group flex flex-col justify-between rounded-xl p-3 text-left transition hover:bg-white/[0.03] sm:p-4"
              >
                <span className="text-[11px] font-medium text-slate-400">
                  Endings Seen
                </span>
                <div className="mt-2 font-display text-xl font-bold tabular-nums text-white sm:text-2xl">
                  {completedEndingsCount}
                  <span className="text-sm font-medium text-slate-500">
                    /{totalEndings}
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-300"
                    style={{ width: `${endingsPct}%` }}
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('save-tracker')}
                className="group flex flex-col justify-between rounded-xl p-3 text-left transition hover:bg-white/[0.03] sm:p-4"
              >
                <span className="text-[11px] font-medium text-slate-400">
                  Active Progress
                </span>
                <div className="mt-2 font-display text-xl font-bold tabular-nums text-cyan-200 sm:text-2xl">
                  Ch. {currentChapter}
                </div>
                <span className="mt-2 text-[11px] font-medium text-slate-400 group-hover:text-cyan-300">
                  of 5 chapters
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
