import { Anchor, CheckCircle2, Circle, GitBranch, Sparkles } from 'lucide-react';
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
      return 'border-amber-400/35 bg-amber-500/12 text-amber-200';
    case 'Clean Fork':
      return 'border-emerald-400/35 bg-emerald-500/12 text-emerald-200';
    case 'Chaos Fork':
      return 'border-rose-400/35 bg-rose-500/12 text-rose-200';
    case 'Rolling FIFO':
      return 'border-amber-400/35 bg-amber-500/10 text-amber-200';
    case 'Safety Lock':
      return 'border-amber-400/40 bg-amber-500/12 text-amber-200';
    case 'Spine':
    default:
      return 'border-cyan-400/35 bg-cyan-500/12 text-cyan-200';
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
    <div className="space-y-10">
      {/* Toolbar: Progress & Active Chapter Selector */}
      <section className="surface-card rounded-2xl border border-white/[0.08] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                15-Slot Checkpoint Checklist
              </h2>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-cyan-200">
                {securedCount} / {totalCheckpoints} Checkpoints
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium tabular-nums text-slate-300">
                {manualSlotsCovered} / 15 Manual Slots
              </span>
            </div>
            <p className="max-w-2xl text-xs leading-relaxed text-slate-400 sm:text-sm">
              Check off each save as you progress. Pick your current chapter on
              the right to spotlight upcoming points of no return.
            </p>
            <div className="pt-0.5">
              <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-canvas/70 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Active Chapter
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
                    className={`min-h-11 rounded-lg px-2.5 py-2 text-xs font-bold tabular-nums transition sm:px-3 ${
                      isCurrent
                        ? 'border border-cyan-400/70 bg-cyan-500/20 text-cyan-100 shadow-[0_0_18px_-6px_rgba(34,211,238,0.6)]'
                        : 'border border-white/[0.07] bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
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

      {/* Open Editorial Checkpoint Sections */}
      <div className="space-y-10">
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
              className="space-y-4"
            >
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.08] pb-3.5">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3
                      id={`group-heading-${group.id}`}
                      className="font-display text-lg font-bold tracking-tight text-white sm:text-xl"
                    >
                      {group.title}
                    </h3>
                    {isActiveGroup && (
                      <span className="rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-200">
                        Active Chapter ({currentChapter})
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                    {group.subtitle}
                  </p>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold tabular-nums text-slate-300">
                  {groupCompleted} / {items.length} Secured
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                      className={`surface-card flex min-w-0 flex-col justify-between rounded-2xl border p-5 transition duration-200 ${
                        isChecked
                          ? 'border-emerald-400/35 bg-emerald-950/15'
                          : isCurrentSlotChapter
                            ? 'border-cyan-400/55 ring-1 ring-cyan-400/20'
                            : slot.isAnchor
                              ? 'border-cyan-400/35 hover:border-cyan-400/60'
                              : 'border-white/[0.08] hover:border-white/[0.18]'
                      }`}
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={isChecked}
                            aria-label={`Mark ${slot.slotLabel}: ${slot.title}`}
                            onClick={() => onToggleSlot(slot.id)}
                            className="-ml-2 -mt-2 flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:text-cyan-300"
                          >
                            {isChecked ? (
                              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                            ) : (
                              <Circle className="h-6 w-6 text-slate-500" />
                            )}
                          </button>

                          <div className="min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="rounded-md border border-white/10 bg-canvas/80 px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-cyan-200">
                                {slot.slotLabel}
                              </span>
                              {slot.isAnchor && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-cyan-400/45 bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-cyan-100">
                                  <Anchor className="h-2.5 w-2.5 text-cyan-300" />
                                  ANCHOR
                                </span>
                              )}
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
                                <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
                                  Current
                                </span>
                              )}
                              {isMissedEarlier && (
                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                                  Earlier Ch.
                                </span>
                              )}
                            </div>
                            <h4
                              className={`font-display text-base font-bold leading-snug ${
                                isChecked ? 'text-emerald-100' : 'text-white'
                              }`}
                            >
                              {slot.title}
                            </h4>
                          </div>
                        </div>

                        <dl className="space-y-2 text-xs leading-relaxed sm:text-[13px]">
                          <div>
                            <dt className="inline font-semibold text-slate-200">
                              When to save:{' '}
                            </dt>
                            <dd className="inline text-slate-400">
                              {slot.whenToSave}
                            </dd>
                          </div>
                          <div>
                            <dt className="inline font-semibold text-slate-200">
                              Why it matters:{' '}
                            </dt>
                            <dd className="inline text-slate-400">
                              {slot.whyItMatters}
                            </dd>
                          </div>
                        </dl>

                        <div className="pt-0.5">
                          <SpoilerText label="Mission & plot context">
                            {slot.spoilerContext}
                          </SpoilerText>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3.5">
                        <div className="flex flex-wrap items-center gap-1">
                          {slot.recommendedEndings.map((endingId) => (
                            <span
                              key={endingId}
                              className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tabular-nums text-slate-400"
                            >
                              {endingId}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => onViewInTree(slot.id)}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/10"
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
