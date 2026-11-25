import { ArrowRight, Compass, GitBranch, ShieldCheck } from 'lucide-react';
import { ENDINGS } from '../data/endings';
import type { AppTab } from '../types/tracker';

interface HeroBannerProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  completedEndings: string[];
  totalEndings: number;
}

export function HeroBanner({
  activeTab,
  onSelectTab,
  completedEndings,
  totalEndings,
}: HeroBannerProps) {
  const completedSet = new Set(completedEndings);
  const completedCount = completedEndings.length;
  const endingsPct = Math.round((completedCount / totalEndings) * 100);

  const routeATotal = ENDINGS.filter((e) => e.route === 'route-a').length;
  const routeACompleted = ENDINGS.filter(
    (e) => e.route === 'route-a' && completedSet.has(e.id)
  ).length;
  const routeBTotal = ENDINGS.filter((e) => e.route === 'route-b').length;
  const routeBCompleted = ENDINGS.filter(
    (e) => e.route === 'route-b' && completedSet.has(e.id)
  ).length;

  return (
    <section className="relative overflow-hidden border-b border-white/[0.07]">
      <div
        aria-hidden="true"
        className="hero-grid-pattern pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid items-end gap-7 lg:grid-cols-12">
          {/* Editorial Headline & Value Prop */}
          <div className="min-w-0 space-y-4 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/[0.08] px-3 py-1 text-xs font-medium text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Spoiler-Free Story Branch Companion · 100% Local</span>
            </div>

            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.65rem] lg:leading-[1.08]">
              Map Every{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-rose-300 bg-clip-text text-transparent">
                GTA 6 Choice &amp; Ending
              </span>{' '}
              Without Spoilers.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Follow the campaign chronologically from Chapter 1 to Chapter 5—see
              where choices rejoin the spine, where{' '}
              <span className="font-mono text-xs text-cyan-300">SPLIT ON</span>{' '}
              stat gates branch, and how all 8 endings converge without spoilers.
            </p>

            {/* Primary & Secondary Workspace Switchers */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onSelectTab('story-tree')}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${
                  activeTab === 'story-tree'
                    ? 'bg-white text-slate-950 shadow-md shadow-white/10'
                    : 'border border-white/12 bg-white/[0.04] text-slate-200 hover:border-white/25 hover:bg-white/[0.08]'
                }`}
              >
                <GitBranch className="h-4 w-4" />
                Story Decision Tree
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
                Ending Simulator &amp; Checklist
                <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </button>
            </div>
          </div>

          {/* Live Endings Progress Strip */}
          <div className="min-w-0 lg:col-span-5">
            <div className="surface-card grid grid-cols-3 divide-x divide-white/[0.07] rounded-2xl border border-white/[0.09] p-1">
              <button
                type="button"
                onClick={() => onSelectTab('ending-nav')}
                className="group flex flex-col justify-between rounded-xl p-3 text-left transition hover:bg-white/[0.03] sm:p-4"
              >
                <span className="text-[11px] font-medium text-slate-400">
                  Endings Seen
                </span>
                <div className="mt-2 font-display text-xl font-bold tabular-nums text-white sm:text-2xl">
                  {completedCount}
                  <span className="text-sm font-medium text-slate-500">
                    /{totalEndings}
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${endingsPct}%` }}
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('story-tree')}
                className="group flex flex-col justify-between rounded-xl p-3 text-left transition hover:bg-white/[0.03] sm:p-4"
              >
                <span className="text-[11px] font-medium text-slate-400">
                  Route A
                </span>
                <div className="mt-2 font-display text-xl font-bold tabular-nums text-cyan-200 sm:text-2xl">
                  {routeACompleted}
                  <span className="text-sm font-medium text-slate-500">
                    /{routeATotal}
                  </span>
                </div>
                <span className="mt-2 text-[11px] font-medium text-slate-400 group-hover:text-cyan-300">
                  Strong Bond
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('story-tree')}
                className="group flex flex-col justify-between rounded-xl p-3 text-left transition hover:bg-white/[0.03] sm:p-4"
              >
                <span className="text-[11px] font-medium text-slate-400">
                  Route B
                </span>
                <div className="mt-2 font-display text-xl font-bold tabular-nums text-amber-200 sm:text-2xl">
                  {routeBCompleted}
                  <span className="text-sm font-medium text-slate-500">
                    /{routeBTotal}
                  </span>
                </div>
                <span className="mt-2 text-[11px] font-medium text-slate-400 group-hover:text-amber-300">
                  Low / Break Up
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
