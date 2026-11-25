import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Circle,
  Compass,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ENDINGS, resolveEnding } from '../data/endings';
import { getSlotById } from '../data/saveSlots';
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
  onViewSlotInTree: (slotId: string) => void;
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
      return 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200';
    case 'good':
      return 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200';
    case 'bad':
      return 'border-rose-400/50 bg-rose-500/15 text-rose-200';
    case 'worst':
      return 'border-red-500/60 bg-red-950/60 text-red-200';
  }
}

const STEP3_LABELS: Record<
  Step3Choice,
  { label: string; hint: string }
> = {
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
  onViewSlotInTree,
}: EndingNavTabProps) {
  const [filter, setFilter] = useState<EndingFilter>('all');

  const completedSet = useMemo(
    () => new Set(completedEndings),
    [completedEndings]
  );

  const resolution = useMemo(
    () => resolveEnding(simulatorInput),
    [simulatorInput]
  );

  const updateRoute = (route: RelationshipRoute) => {
    const nextBase: EndingSimulationInput = { ...simulatorInput, route };
    const probe = resolveEnding({ ...nextBase, step3: undefined, step4: undefined });
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
    const probe = resolveEnding({ ...nextBase, step3: undefined, step4: undefined });
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
    const probe = resolveEnding({ ...nextBase, step3: undefined, step4: undefined });
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

  const recommendedSlot = resolution.ending
    ? getSlotById(resolution.ending.recommendedSlotId)
    : undefined;

  return (
    <div className="space-y-8">
      {/* Constrained Branch Simulator */}
      <section
        id="branch-simulator-panel"
        aria-labelledby="simulator-heading"
        className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-cyan-400" />
              <h2
                id="simulator-heading"
                className="text-lg font-bold text-white sm:text-xl"
              >
                Walk Down a Branch Simulator
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Select your Step 1 world state and Step 2–4 finale choices.
              Unavailable branches are constrained automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={resetSimulator}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-canvas px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Best Path
          </button>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          {/* Steps 1-4 Inputs */}
          <div className="min-w-0 space-y-5 lg:col-span-7">
            {/* Step 1 */}
            <div className="space-y-3 rounded-xl border border-border-subtle bg-surface-elevated/70 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Step 1 · Campaign World State
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-300">
                  Relationship Route
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['route-a', 'Route A (High Bond)'],
                      ['route-b', 'Route B (Strained)'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={simulatorInput.route === value}
                      onClick={() => updateRoute(value)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        simulatorInput.route === value
                          ? 'bg-cyan-500 text-slate-950'
                          : 'border border-slate-700 bg-canvas text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-300">
                  Criminal Profile
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['clean', 'Clean (Professional)'],
                      ['chaos', 'Chaos (Psycho / Shattered)'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={simulatorInput.profile === value}
                      onClick={() => updateProfile(value)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        simulatorInput.profile === value
                          ? value === 'clean'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-rose-500 text-white'
                          : 'border border-slate-700 bg-canvas text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-300">
                  Family Savings
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ['under-500k', 'Under $500K'],
                      ['500k-to-2m', '$500K – $1.99M'],
                      ['2m-plus', '$2M+'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={simulatorInput.savings === value}
                      onClick={() => updateSavings(value)}
                      className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                        simulatorInput.savings === value
                          ? 'bg-amber-400 text-slate-950'
                          : 'border border-slate-700 bg-canvas text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2.5 rounded-xl border border-border-subtle bg-surface-elevated/70 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Step 2 · Pivotal Confrontation
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['shoot', 'Shoot'],
                    ['take-deal', 'Wait 15–60s (Take Deal)'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={simulatorInput.step2 === value}
                    onClick={() => updateStep2(value)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      simulatorInput.step2 === value
                        ? 'bg-cyan-500 text-slate-950'
                        : 'border border-slate-700 bg-canvas text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-2.5 rounded-xl border border-border-subtle bg-surface-elevated/70 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Step 3 · Branch Decision
                </div>
                {resolution.availableStep3Choices.length === 0 && (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
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
                        className={`rounded-lg p-2.5 text-left transition ${
                          active
                            ? 'bg-cyan-500 text-slate-950'
                            : 'border border-slate-700 bg-canvas text-slate-200 hover:border-slate-500'
                        }`}
                      >
                        <div className="text-xs font-bold">{meta.label}</div>
                        <div
                          className={`mt-0.5 text-[11px] ${
                            active ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {meta.hint}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  This branch resolves immediately after Step 2 (no Step 3 prompt
                  occurs).
                </p>
              )}
            </div>

            {/* Step 4 */}
            {resolution.requiresStep4 && (
              <div className="space-y-2.5 rounded-xl border border-border-subtle bg-surface-elevated/70 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Step 4 · Final Escape Window
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['exit', 'Exit (Clear Escape)'],
                      ['expire', 'Expire (Timer Runs Out)'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={simulatorInput.step4 === value}
                      onClick={() => updateStep4(value)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        simulatorInput.step4 === value
                          ? value === 'exit'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-rose-500 text-white'
                          : 'border border-slate-700 bg-canvas text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Resolved Outcome Card */}
          <div className="min-w-0 lg:col-span-5">
            {resolution.ending ? (
              <div className="flex h-full flex-col justify-between rounded-2xl border border-cyan-500/40 bg-canvas/80 p-5">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-sm font-extrabold text-white ring-1 ring-slate-700">
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
                    <h3 className="text-lg font-bold text-white">
                      {resolution.ending.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {resolution.ending.recipeTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-slate-800 bg-surface px-2 py-0.5 text-[11px] font-medium text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {recommendedSlot && (
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface p-3 text-xs">
                      <div>
                        <span className="text-slate-400">
                          Recommended Save:{' '}
                        </span>
                        <span className="font-mono font-bold text-cyan-300">
                          {recommendedSlot.slotLabel}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onViewSlotInTree(recommendedSlot.id)}
                        className="font-semibold text-cyan-300 underline decoration-cyan-500/40 underline-offset-2 hover:text-cyan-200"
                      >
                        Show in Tree
                      </button>
                    </div>
                  )}

                  {resolution.bonusEpilogueNote && (
                    <div className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{resolution.bonusEpilogueNote}</span>
                    </div>
                  )}

                  {resolution.warningNote && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <span>{resolution.warningNote}</span>
                    </div>
                  )}

                  {resolution.verificationNote && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-500/35 bg-amber-950/30 p-3 text-xs text-amber-200">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <span>{resolution.verificationNote}</span>
                    </div>
                  )}

                  <div>
                    <SpoilerText label="Ending outcome summary">
                      {resolution.ending.spoilerSummary}
                    </SpoilerText>
                  </div>
                </div>

                <div className="mt-6 border-t border-border-subtle pt-4">
                  <button
                    type="button"
                    onClick={() => onToggleEnding(resolution.ending!.id)}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                      completedSet.has(resolution.ending.id)
                        ? 'border border-emerald-500/50 bg-emerald-500/15 text-emerald-200'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
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
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-canvas/50 p-6 text-center text-sm text-slate-400">
                Choose an option in {resolution.nextRequiredStep ?? 'the steps'}{' '}
                to resolve an ending.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* All 8 Endings Filterable Checklist */}
      <section
        aria-labelledby="checklist-heading"
        className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6"
      >
        <div className="flex flex-col gap-4 border-b border-border-subtle pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                id="checklist-heading"
                className="text-lg font-bold text-white sm:text-xl"
              >
                All 8 Confirmed Endings Checklist
              </h2>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-200">
                {completedCount} / {ENDINGS.length} Completed
              </span>
            </div>
            <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-slate-900 ring-1 ring-slate-800">
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
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  filter === value
                    ? 'bg-cyan-500 text-slate-950'
                    : 'border border-slate-700 bg-canvas text-slate-300 hover:border-slate-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {filteredEndings.map((ending) => {
            const isCompleted = completedSet.has(ending.id);
            const slot = getSlotById(ending.recommendedSlotId);

            return (
              <article
                key={ending.id}
                className={`flex min-w-0 flex-col justify-between rounded-xl border p-4 transition ${
                  isCompleted
                    ? 'border-emerald-500/45 bg-emerald-950/15'
                    : 'border-border-subtle bg-surface-elevated/70'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isCompleted}
                        aria-label={`Mark ${ending.code} ${ending.name} completed`}
                        onClick={() => onToggleEnding(ending.id)}
                        className="mt-0.5 shrink-0 text-slate-400 transition hover:text-emerald-300"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                        ) : (
                          <Circle className="h-6 w-6 text-slate-500" />
                        )}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white ring-1 ring-slate-700">
                            {ending.code}
                          </span>
                          <span
                            className={`rounded border px-2 py-0.5 text-[11px] font-bold ${tierBadgeClass(
                              ending.tier
                            )}`}
                          >
                            {ending.tierLabel}
                          </span>
                          {slot && (
                            <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-cyan-300">
                              {slot.slotLabel}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 text-sm font-bold text-white">
                          {ending.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {ending.recipeTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-slate-800 bg-canvas px-2 py-0.5 text-[11px] text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {ending.bonusEpilogueNote && (
                    <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] text-emerald-200">
                      {ending.bonusEpilogueNote}
                    </p>
                  )}

                  {ending.launchWeekNote && (
                    <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-200">
                      {ending.launchWeekNote}
                    </p>
                  )}

                  <div>
                    <SpoilerText label={`${ending.code} ending outcome`}>
                      {ending.spoilerSummary}
                    </SpoilerText>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border-subtle/60 pt-3">
                  <button
                    type="button"
                    onClick={() => onViewSlotInTree(ending.recommendedSlotId)}
                    className="text-xs font-medium text-slate-400 hover:text-cyan-200"
                  >
                    Inspect {slot?.slotLabel ?? 'Save Slot'}
                  </button>
                  <button
                    type="button"
                    onClick={() => loadEndingInSimulator(ending)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-canvas px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/60 hover:bg-cyan-500/10"
                  >
                    <Play className="h-3 w-3 text-cyan-400" />
                    Simulate Path
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filteredEndings.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
            All endings matching this filter are already completed!
          </div>
        )}
      </section>
    </div>
  );
}

export type EndingLookupId = EndingId;
