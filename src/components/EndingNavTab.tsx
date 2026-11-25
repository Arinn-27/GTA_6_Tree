import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronDown,
  Circle,
  Compass,
  GitBranch,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ENDINGS, resolveEnding } from '../data/endings';
import type {
  CriminalProfile,
  EndingDefinition,
  EndingId,
  EndingSimulationInput,
  EndingTier,
  RelationshipRoute,
  SavingsTier,
  Step2Choice,
  Step3Choice,
  Step4Choice,
} from '../types/tracker';
import { SpoilerText } from './SpoilerText';

interface EndingNavTabProps {
  completedEndings: string[];
  onToggleEnding: (endingId: string) => void;
  simulatorInput: EndingSimulationInput;
  onChangeSimulatorInput: (next: EndingSimulationInput) => void;
  onViewEndingInTree: (endingId: EndingId) => void;
}

type EndingFilter =
  | 'all'
  | 'good-tier'
  | 'bad-tier'
  | 'route-a'
  | 'route-b'
  | 'incomplete';

function tierBadgeClass(tier: EndingTier): string {
  switch (tier) {
    case 'best':
      return 'border-emerald-400/45 bg-emerald-500/15 text-emerald-200';
    case 'good':
      return 'border-cyan-400/45 bg-cyan-500/15 text-cyan-200';
    case 'bad':
      return 'border-rose-400/45 bg-rose-500/15 text-rose-200';
    case 'worst':
      return 'border-red-400/55 bg-red-950/60 text-red-200';
  }
}

function tierAccentBarClass(tier: EndingTier): string {
  switch (tier) {
    case 'best':
      return 'from-emerald-400 via-teal-300 to-cyan-400';
    case 'good':
      return 'from-cyan-400 to-sky-300';
    case 'bad':
      return 'from-amber-400 to-rose-500';
    case 'worst':
      return 'from-rose-500 to-red-600';
  }
}

const STEP3_LABELS: Record<Step3Choice, { label: string; hint: string }> = {
  swim: { label: 'Swim', hint: 'Bail out and attempt the water escape' },
  'no-surrender': {
    label: 'No Surrender',
    hint: 'Ram the roadblock head-on',
  },
  'stay-down': {
    label: 'Stay Down',
    hint: 'Hold position under cover during the standoff',
  },
  defend: {
    label: 'Defend',
    hint: 'Stand up and return fire during the standoff',
  },
};

export function EndingNavTab({
  completedEndings,
  onToggleEnding,
  simulatorInput,
  onChangeSimulatorInput,
  onViewEndingInTree,
}: EndingNavTabProps) {
  const [filter, setFilter] = useState<EndingFilter>('all');
  const [expandedCardIds, setExpandedCardIds] = useState<Set<EndingId>>(
    () => new Set(['e1'])
  );

  const completedSet = useMemo(
    () => new Set(completedEndings),
    [completedEndings]
  );

  const resolution = useMemo(
    () => resolveEnding(simulatorInput),
    [simulatorInput]
  );

  const toggleCardExpanded = (id: EndingId) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const updateRoute = (route: RelationshipRoute) => {
    const nextBase: EndingSimulationInput = { ...simulatorInput, route };
    const probe = resolveEnding({
      ...nextBase,
      step3: undefined,
      step4: undefined,
    });
    const validStep3 =
      simulatorInput.step3 &&
      probe.availableStep3Choices.includes(simulatorInput.step3)
        ? simulatorInput.step3
        : probe.availableStep3Choices[0];
    onChangeSimulatorInput({
      ...nextBase,
      step3: validStep3,
      step4:
        route === 'route-a' &&
        nextBase.step2 === 'shoot' &&
        validStep3 === 'swim'
          ? simulatorInput.step4 ?? 'exit'
          : undefined,
    });
  };

  const updateProfile = (profile: CriminalProfile) => {
    const nextBase: EndingSimulationInput = { ...simulatorInput, profile };
    const probe = resolveEnding({
      ...nextBase,
      step3: undefined,
      step4: undefined,
    });
    const validStep3 =
      simulatorInput.step3 &&
      probe.availableStep3Choices.includes(simulatorInput.step3)
        ? simulatorInput.step3
        : probe.availableStep3Choices[0];
    onChangeSimulatorInput({
      ...nextBase,
      step3: validStep3,
      step4:
        nextBase.route === 'route-a' &&
        nextBase.step2 === 'shoot' &&
        validStep3 === 'swim'
          ? simulatorInput.step4 ?? 'exit'
          : undefined,
    });
  };

  const updateSavings = (savings: SavingsTier) => {
    onChangeSimulatorInput({ ...simulatorInput, savings });
  };

  const updateStep2 = (step2: Step2Choice) => {
    const nextBase: EndingSimulationInput = { ...simulatorInput, step2 };
    const probe = resolveEnding({
      ...nextBase,
      step3: undefined,
      step4: undefined,
    });
    const validStep3 =
      simulatorInput.step3 &&
      probe.availableStep3Choices.includes(simulatorInput.step3)
        ? simulatorInput.step3
        : probe.availableStep3Choices[0];
    onChangeSimulatorInput({
      ...nextBase,
      step3: validStep3,
      step4:
        nextBase.route === 'route-a' &&
        step2 === 'shoot' &&
        validStep3 === 'swim'
          ? simulatorInput.step4 ?? 'exit'
          : undefined,
    });
  };

  const updateStep3 = (step3: Step3Choice) => {
    onChangeSimulatorInput({
      ...simulatorInput,
      step3,
      step4:
        simulatorInput.route === 'route-a' &&
        simulatorInput.step2 === 'shoot' &&
        step3 === 'swim'
          ? simulatorInput.step4 ?? 'exit'
          : undefined,
    });
  };

  const updateStep4 = (step4: Step4Choice) => {
    onChangeSimulatorInput({ ...simulatorInput, step4 });
  };

  const resetSimulator = () => {
    onChangeSimulatorInput({
      route: 'route-a',
      profile: 'clean',
      savings: '2m-plus',
      step2: 'shoot',
      step3: 'swim',
      step4: 'exit',
    });
  };

  const filteredEndings = useMemo(() => {
    return ENDINGS.filter((ending) => {
      switch (filter) {
        case 'good-tier':
          return ending.tier === 'best' || ending.tier === 'good';
        case 'bad-tier':
          return ending.tier === 'bad' || ending.tier === 'worst';
        case 'route-a':
          return ending.route === 'route-a';
        case 'route-b':
          return ending.route === 'route-b';
        case 'incomplete':
          return !completedSet.has(ending.id);
        case 'all':
        default:
          return true;
      }
    });
  }, [filter, completedSet]);

  const completedCount = ENDINGS.filter((e) => completedSet.has(e.id)).length;
  const progressPct = Math.round((completedCount / ENDINGS.length) * 100);

  const loadEndingInSimulator = (ending: EndingDefinition) => {
    onChangeSimulatorInput({ ...ending.presetInput });
    const el = document.getElementById('branch-simulator-panel');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-12">
      {/* Constrained Branch Simulator */}
      <section
        id="branch-simulator-panel"
        aria-labelledby="simulator-heading"
        className="space-y-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-cyan-400" />
              <h2
                id="simulator-heading"
                className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                Walk Down a Branch Simulator
              </h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
              Test your Relationship Route, Criminal Profile, BuckMe! savings,
              and Protective Custody choices. Downstream steps constrain
              automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={resetSimulator}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:bg-white/[0.08]"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
            Reset to Best Path
          </button>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-12">
          {/* Steps 1-4 Controls */}
          <div className="min-w-0 space-y-4 lg:col-span-7">
            {/* Step 1 */}
            <div className="surface-card space-y-4 rounded-2xl border border-white/[0.08] p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/15 font-mono text-[11px] tabular-nums text-cyan-200">
                  1
                </span>
                Campaign World State
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-400">
                  Relationship Route (Ch. 1–5)
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(
                    [
                      ['route-a', 'Route A (Strong Relationship)'],
                      ['route-b', 'Route B (Low / Break Up)'],
                    ] as const
                  ).map(([value, label]) => {
                    const active = simulatorInput.route === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateRoute(value)}
                        className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? value === 'route-a'
                              ? 'border-cyan-400/70 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_-8px_rgba(34,211,238,0.65)]'
                              : 'border-rose-400/70 bg-gradient-to-r from-amber-500/18 to-rose-500/18 text-rose-100 shadow-[0_0_20px_-8px_rgba(251,113,133,0.6)]'
                            : 'border-white/[0.08] bg-canvas/70 text-slate-400 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            active
                              ? value === 'route-a'
                                ? 'bg-cyan-400'
                                : 'bg-rose-400'
                              : 'bg-slate-600'
                          }`}
                        />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-400">
                  Criminal Profile
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(
                    [
                      ['clean', 'Clean (Professional)'],
                      ['chaos', 'Chaos (Violent / Psycho)'],
                    ] as const
                  ).map(([value, label]) => {
                    const active = simulatorInput.profile === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateProfile(value)}
                        className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? value === 'clean'
                              ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-100 shadow-[0_0_20px_-8px_rgba(52,211,153,0.65)]'
                              : 'border-rose-400/70 bg-rose-500/15 text-rose-100 shadow-[0_0_20px_-8px_rgba(251,113,133,0.65)]'
                            : 'border-white/[0.08] bg-canvas/70 text-slate-400 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            active
                              ? value === 'clean'
                                ? 'bg-emerald-400'
                                : 'bg-rose-400'
                              : 'bg-slate-600'
                          }`}
                        />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-400">
                  BuckMe! Family Savings
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ['under-500k', 'Under $500K'],
                      ['500k-to-2m', '$500K – $1.99M'],
                      ['2m-plus', '$2M+'],
                    ] as const
                  ).map(([value, label]) => {
                    const active = simulatorInput.savings === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateSavings(value)}
                        className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-semibold tabular-nums transition ${
                          active
                            ? 'border-amber-400/70 bg-amber-500/15 text-amber-100 shadow-[0_0_20px_-8px_rgba(251,191,36,0.6)]'
                            : 'border-white/[0.08] bg-canvas/70 text-slate-400 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="surface-card space-y-3 rounded-2xl border border-white/[0.08] p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/15 font-mono text-[11px] tabular-nums text-cyan-200">
                  2
                </span>
                Protective Custody Confrontation
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['shoot', 'Shoot'],
                    ['take-deal', 'Wait 15–60s (Take Deal)'],
                  ] as const
                ).map(([value, label]) => {
                  const active = simulatorInput.step2 === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => updateStep2(value)}
                      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? 'border-cyan-400/70 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_-8px_rgba(34,211,238,0.6)]'
                          : 'border-white/[0.08] bg-canvas/70 text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          active ? 'bg-cyan-400' : 'bg-slate-600'
                        }`}
                      />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3 */}
            <div className="surface-card space-y-3 rounded-2xl border border-white/[0.08] p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/15 font-mono text-[11px] tabular-nums text-cyan-200">
                    3
                  </span>
                  Final Branch Prompt
                </div>
                {resolution.availableStep3Choices.length === 0 && (
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
                    No Step 3
                  </span>
                )}
              </div>

              {resolution.availableStep3Choices.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {resolution.availableStep3Choices.map((choice) => {
                    const meta = STEP3_LABELS[choice];
                    const active = simulatorInput.step3 === choice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateStep3(choice)}
                        className={`min-h-11 rounded-xl border p-3 text-left transition ${
                          active
                            ? 'border-cyan-400/70 bg-cyan-500/15 text-white shadow-[0_0_20px_-8px_rgba(34,211,238,0.6)]'
                            : 'border-white/[0.08] bg-canvas/70 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="text-xs font-bold">{meta.label}</div>
                        <div
                          className={`mt-0.5 text-[11px] ${
                            active ? 'text-cyan-100/80' : 'text-slate-400'
                          }`}
                        >
                          {meta.hint}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-slate-400">
                  This branch resolves immediately after Step 2—no Step 3 prompt
                  occurs.
                </p>
              )}
            </div>

            {/* Step 4 */}
            {resolution.requiresStep4 && (
              <div className="surface-card space-y-3 rounded-2xl border border-white/[0.08] p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/15 font-mono text-[11px] tabular-nums text-cyan-200">
                    4
                  </span>
                  Final Escape Window
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['exit', 'Exit (Clear Escape)'],
                      ['expire', 'Expire (Timer Runs Out)'],
                    ] as const
                  ).map(([value, label]) => {
                    const active = simulatorInput.step4 === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateStep4(value)}
                        className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? value === 'exit'
                              ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-100 shadow-[0_0_20px_-8px_rgba(52,211,153,0.6)]'
                              : 'border-rose-400/70 bg-rose-500/15 text-rose-100 shadow-[0_0_20px_-8px_rgba(251,113,133,0.6)]'
                            : 'border-white/[0.08] bg-canvas/70 text-slate-400 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            active
                              ? value === 'exit'
                                ? 'bg-emerald-400'
                                : 'bg-rose-400'
                              : 'bg-slate-600'
                          }`}
                        />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Resolved Outcome Card */}
          <div className="min-w-0 lg:sticky lg:top-20 lg:col-span-5">
            {resolution.ending ? (
              <div className="surface-card overflow-hidden rounded-2xl border border-white/[0.12]">
                <div
                  className={`h-1 w-full bg-gradient-to-r ${tierAccentBarClass(
                    resolution.ending.tier
                  )}`}
                />
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg border border-white/15 bg-canvas px-2.5 py-1 font-mono text-sm font-extrabold tabular-nums text-white">
                        {resolution.ending.code}
                      </span>
                      <span
                        className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${tierBadgeClass(
                          resolution.ending.tier
                        )}`}
                      >
                        {resolution.ending.tierLabel}
                      </span>
                    </div>
                    <Award className="h-5 w-5 text-cyan-400" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Resolved Ending
                    </p>
                    <h3 className="mt-0.5 font-display text-2xl font-extrabold tracking-tight text-white">
                      {resolution.ending.name}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {resolution.ending.recipeTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {resolution.bonusEpilogueNote && (
                    <div className="flex items-start gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/10 p-3 text-xs leading-relaxed text-emerald-100">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{resolution.bonusEpilogueNote}</span>
                    </div>
                  )}

                  {resolution.warningNote && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-400/35 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <span>{resolution.warningNote}</span>
                    </div>
                  )}

                  {resolution.verificationNote && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-950/30 p-3 text-xs leading-relaxed text-amber-100">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <span>{resolution.verificationNote}</span>
                    </div>
                  )}

                  <div className="pt-1">
                    <SpoilerText label="Ending outcome summary">
                      {resolution.ending.spoilerSummary}
                    </SpoilerText>
                  </div>

                  <div className="space-y-2.5 border-t border-white/[0.08] pt-4">
                    <button
                      type="button"
                      onClick={() => onToggleEnding(resolution.ending!.id)}
                      className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tabular-nums transition ${
                        completedSet.has(resolution.ending.id)
                          ? 'border border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
                          : 'bg-white text-slate-950 shadow-sm hover:bg-cyan-100'
                      }`}
                    >
                      {completedSet.has(resolution.ending.id) ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          Marked as Completed ({resolution.ending.code})
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4" />
                          Mark {resolution.ending.code} Completed
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onViewEndingInTree(resolution.ending!.id)}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/10"
                    >
                      <GitBranch className="h-4 w-4 text-cyan-400" />
                      View {resolution.ending.code} in Decision Tree
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="surface-card rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">
                Choose an option in {resolution.nextRequiredStep ?? 'the steps'}{' '}
                to resolve an ending.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* All 8 Endings Filterable Checklist with Expandable Recipe Cards */}
      <section aria-labelledby="checklist-heading" className="space-y-5">
        <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                id="checklist-heading"
                className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                All 8 Confirmed Endings Checklist
              </h2>
              <span className="rounded-full border border-emerald-400/35 bg-emerald-500/12 px-2.5 py-0.5 text-xs font-bold tabular-nums text-emerald-200">
                {completedCount} / {ENDINGS.length} Completed
              </span>
            </div>
            <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div
            role="group"
            aria-label="Filter endings"
            className="flex flex-wrap gap-1.5"
          >
            {(
              [
                ['all', 'All (8)'],
                ['good-tier', 'Best & Good (3)'],
                ['bad-tier', 'Bad & Worst (5)'],
                ['route-a', 'Route A (5)'],
                ['route-b', 'Route B (3)'],
                ['incomplete', 'Remaining'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold tabular-nums transition ${
                  filter === value
                    ? 'border-cyan-400/70 bg-cyan-500/18 text-cyan-100'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredEndings.map((ending) => {
            const isCompleted = completedSet.has(ending.id);
            const isExpanded = expandedCardIds.has(ending.id);

            return (
              <article
                key={ending.id}
                className={`surface-card flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border transition ${
                  isCompleted
                    ? 'border-emerald-400/40 bg-emerald-950/15'
                    : 'border-white/[0.08] hover:border-white/[0.18]'
                }`}
              >
                <div
                  className={`h-1 w-full bg-gradient-to-r ${tierAccentBarClass(
                    ending.tier
                  )}`}
                />
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isCompleted}
                          aria-label={`Mark ${ending.code} ${ending.name} completed`}
                          onClick={() => onToggleEnding(ending.id)}
                          className="-ml-2 -mt-2 flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:text-emerald-300"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                          ) : (
                            <Circle className="h-6 w-6 text-slate-500" />
                          )}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-md border border-white/15 bg-canvas px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-white">
                              {ending.code}
                            </span>
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${tierBadgeClass(
                                ending.tier
                              )}`}
                            >
                              {ending.tierLabel}
                            </span>
                            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                              {ending.route === 'route-a' ? 'Route A' : 'Route B'}
                            </span>
                          </div>
                          <h3 className="mt-1.5 font-display text-base font-bold text-white">
                            {ending.name}
                          </h3>
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${ending.code} unlock recipe`}
                        onClick={() => toggleCardExpanded(ending.id)}
                        className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition hover:border-cyan-400/50 hover:text-white"
                      >
                        <span>Recipe</span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-cyan-300' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {ending.recipeTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[11px] tabular-nums text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {ending.launchWeekNote && !isExpanded && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                        Launch-week verification note inside recipe
                      </div>
                    )}

                    {/* Expandable Recipe & Notes Panel */}
                    <div className="collapsible-panel" data-open={isExpanded}>
                      <div>
                        <div className="space-y-3 border-t border-white/[0.07] pt-3">
                          <div className="rounded-xl border border-white/[0.07] bg-canvas/70 p-3.5">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                              Unlock Recipe
                            </div>
                            <ol className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-200">
                              {ending.unlockSteps.map((step, idx) => (
                                <li key={step} className="flex items-start gap-2">
                                  <span className="mt-0.5 font-mono text-[11px] font-bold tabular-nums text-cyan-400">
                                    {idx + 1}.
                                  </span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {ending.bonusEpilogueNote && (
                            <p className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs leading-relaxed text-emerald-100">
                              {ending.bonusEpilogueNote}
                            </p>
                          )}

                          {ending.launchWeekNote && (
                            <p className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100">
                              {ending.launchWeekNote}
                            </p>
                          )}

                          <div>
                            <SpoilerText label={`${ending.code} ending outcome`}>
                              {ending.spoilerSummary}
                            </SpoilerText>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3.5">
                    <button
                      type="button"
                      onClick={() => onViewEndingInTree(ending.id)}
                      className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-slate-300 transition hover:text-cyan-200"
                    >
                      <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
                      View in Story Tree
                    </button>
                    <button
                      type="button"
                      onClick={() => loadEndingInSimulator(ending)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/10"
                    >
                      <Play className="h-3 w-3 text-cyan-400" />
                      Simulate Path
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredEndings.length === 0 && (
          <div className="surface-card rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-400">
            All endings matching this filter are already completed!
          </div>
        )}
      </section>
    </div>
  );
}

export type EndingLookupId = EndingId;
