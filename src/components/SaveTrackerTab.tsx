import { CheckCircle2, Circle, GitBranch, Sparkles } from 'lucide-react';
import { SAVE_SLOTS, SAVE_SLOT_GROUPS } from '../data/saveSlots';
import type { ChapterNumber, SlotBadgeKind } from '../types/tracker';
import { SpoilerText } from './SpoilerText';

interface SaveTrackerTabProps {
  checkedSlots: string[];
  currentChapter: ChapterNumber;
  onToggleSlot: (slotId: string) => void;
  onChangeChapter: (chapter: ChapterNumber) => void;
  onViewInTree: (slotId: string) => void;
}

const CHAPTERS: readonly ChapterNumber[] = [1, 2, 3, 4, 5];

function badgeStyle(badge: SlotBadgeKind): string {
  switch (badge) {
    case 'Point of No Return':
      return 'border-amber-500/40 bg-amber-500/15 text-amber-200';
    case 'Clean Fork':
      return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200';
    case 'Chaos Fork':
      return 'border-rose-500/40 bg-rose-500/15 text-rose-200';
    case 'Rolling FIFO':
      return 'border-amber-400/40 bg-amber-400/10 text-amber-200';
    case 'Safety Lock':
      return 'border-violet-400/40 bg-violet-500/15 text-violet-200';
    case 'Spine':
    default:
      return 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200';
  }
}

export function SaveTrackerTab({
  checkedSlots,
  currentChapter,
  onToggleSlot,
  onChangeChapter,
  onViewInTree,
}: SaveTrackerTabProps) {
  const checkedSet = new Set(checkedSlots);
  const totalCheckpoints = SAVE_SLOTS.length;
  const securedCount = SAVE_SLOTS.filter((slot) =>
    checkedSet.has(slot.id)
  ).length;
  const progressPct = Math.round((securedCount / totalCheckpoints) * 100);

  const manualSlotsCovered = SAVE_SLOTS.reduce(
    (sum, slot) =>
      checkedSet.has(slot.id) ? sum + slot.slotNumbers.length : sum,
    0
  );

  return (
    <div className="space-y-6">
      {/* Progress & Current Chapter Dashboard */}
      <section className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-bold text-white sm:text-xl">
                15-Slot Checkpoint Checklist
              </h2>
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 text-xs font-bold text-cyan-200">
                {securedCount} / {totalCheckpoints} Checkpoints
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                {manualSlotsCovered} / 15 Manual Slots Covered
              </span>
            </div>
            <p className="max-w-2xl text-xs leading-relaxed text-slate-400 sm:text-sm">
              Track every anchor, Point of No Return, and backup ring across
              your playthrough. Select your active chapter below to highlight
              relevant saves.
            </p>
            <div className="pt-1">
              <div className="h-2.5 w-full max-w-md overflow-hidden rounded-full bg-slate-900 ring-1 ring-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Current Chapter Selector */}
          <div className="rounded-xl border border-border-subtle bg-canvas/70 p-3 sm:p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Current Chapter Highlighter
            </div>
            <div
              role="group"
              aria-label="Current chapter"
              className="mt-2 grid grid-cols-5 gap-1.5"
            >
              {CHAPTERS.map((ch) => {
                const isCurrent = currentChapter === ch;
                return (
                  <button
                    key={ch}
                    type="button"
                    aria-pressed={isCurrent}
                    onClick={() => onChangeChapter(ch)}
                    className={`rounded-lg px-2.5 py-2 text-xs font-bold transition sm:px-3 ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'border border-slate-800 bg-surface text-slate-300 hover:border-cyan-500/40 hover:text-white'
                    }`}
                  >
                    Ch {ch}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Grouped Checkpoint Cards */}
      <div className="space-y-6">
        {SAVE_SLOT_GROUPS.map((group) => {
          const items = SAVE_SLOTS.filter((slot) => slot.group === group.id);
          const groupCompleted = items.filter((slot) =>
            checkedSet.has(slot.id)
          ).length;
          const isActiveGroup =
            group.id !== 'active-workspace' &&
            group.chapters.includes(currentChapter);

          return (
            <section
              key={group.id}
              aria-labelledby={`group-heading-${group.id}`}
              className={`rounded-2xl border p-4 transition sm:p-5 ${
                isActiveGroup
                  ? 'border-cyan-500/45 bg-surface shadow-[0_0_25px_-12px_rgba(34,211,238,0.35)]'
                  : 'border-border-subtle bg-surface/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle/80 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      id={`group-heading-${group.id}`}
                      className="text-base font-bold text-white sm:text-lg"
                    >
                      {group.title}
                    </h3>
                    {isActiveGroup && (
                      <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[11px] font-bold text-cyan-200 ring-1 ring-cyan-400/40">
                        Active Chapter ({currentChapter})
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {group.subtitle}
                  </p>
                </div>

                <span className="rounded-lg border border-slate-800 bg-canvas px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {groupCompleted} / {items.length} Secured
                </span>
              </div>

              <div className="mt-4 grid gap-3.5 md:grid-cols-2">
                {items.map((slot) => {
                  const isChecked = checkedSet.has(slot.id);
                  const isCurrentSlotChapter = slot.chapter === currentChapter;
                  const isMissedEarlier =
                    !isChecked &&
                    typeof slot.chapter === 'number' &&
                    slot.chapter < currentChapter;

                  return (
                    <article
                      key={slot.id}
                      className={`flex min-w-0 flex-col justify-between rounded-xl border p-4 transition ${
                        isChecked
                          ? 'border-emerald-500/40 bg-emerald-950/15'
                          : isCurrentSlotChapter
                            ? 'border-cyan-400/55 bg-surface-elevated ring-1 ring-cyan-400/25'
                            : 'border-border-subtle bg-surface-elevated/70 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={isChecked}
                              aria-label={`Mark ${slot.slotLabel}: ${slot.title}`}
                              onClick={() => onToggleSlot(slot.id)}
                              className="mt-0.5 shrink-0 rounded-full text-slate-400 transition hover:text-cyan-300"
                            >
                              {isChecked ? (
                                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                              ) : (
                                <Circle className="h-6 w-6 text-slate-500" />
                              )}
                            </button>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300 ring-1 ring-slate-700">
                                  {slot.slotLabel}
                                </span>
                                <span
                                  className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${badgeStyle(
                                    slot.badge
                                  )}`}
                                >
                                  {slot.badge}
                                </span>
                                <span className="text-[11px] font-medium text-slate-400">
                                  {slot.chapterLabel}
                                </span>
                                {isCurrentSlotChapter && !isChecked && (
                                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-200">
                                    Current
                                  </span>
                                )}
                                {isMissedEarlier && (
                                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
                                    Earlier Ch.
                                  </span>
                                )}
                              </div>
                              <h4
                                className={`text-sm font-bold leading-snug ${
                                  isChecked
                                    ? 'text-emerald-100'
                                    : 'text-white'
                                }`}
                              >
                                {slot.title}
                              </h4>
                            </div>
                          </div>
                        </div>

                        {/* Spoiler-free guidance */}
                        <dl className="space-y-2 text-xs leading-relaxed">
                          <div>
                            <dt className="font-semibold text-slate-300">
                              When to save:
                            </dt>
                            <dd className="text-slate-400">{slot.whenToSave}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-slate-300">
                              Why it matters:
                            </dt>
                            <dd className="text-slate-400">
                              {slot.whyItMatters}
                            </dd>
                          </div>
                        </dl>

                        {/* Spoiler-protected context */}
                        <div className="pt-0.5">
                          <SpoilerText label="Mission & plot context">
                            {slot.spoilerContext}
                          </SpoilerText>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle/60 pt-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {slot.recommendedEndings.map((endingId) => (
                            <span
                              key={endingId}
                              className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-slate-400"
                            >
                              {endingId}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => onViewInTree(slot.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-canvas px-2.5 py-1 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/60 hover:bg-cyan-500/10"
                        >
                          <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
                          View in Tree
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
