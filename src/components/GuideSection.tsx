import { useState } from 'react';
import {
  ChevronDown,
  DollarSign,
  Flame,
  HardDrive,
  HeartHandshake,
} from 'lucide-react';

interface MechanicsCard {
  num: string;
  title: string;
  subtitle: string;
  body: string;
  icon: typeof HardDrive;
  accentClass: string;
  topBarClass: string;
}

const CORE_MECHANICS: readonly MechanicsCard[] = [
  {
    num: '01',
    title: '15 Manual Slots & Autosave Trap',
    subtitle: 'No mission replay menu',
    body: 'GTA 6 gives you 15 manual save slots and only 1 autosave slot. Loading an older manual save causes the single autosave to overwrite itself with that older timeline—always lock your main run in Slot 15 first.',
    icon: HardDrive,
    accentClass: 'text-cyan-300 bg-cyan-500/12 border-cyan-400/30',
    topBarClass: 'from-cyan-400/80 to-sky-400/20',
  },
  {
    num: '02',
    title: 'Relationship Meter (Routes A & B)',
    subtitle: '4 tiers up to Hot Together',
    body: 'Your bond across Chapters 1–5 steers dialogue and unlocks Route A (high bond) versus Route B (strained bond) in the finale. Helpful prep tasks and cooperative choices push the meter upward.',
    icon: HeartHandshake,
    accentClass: 'text-emerald-300 bg-emerald-500/12 border-emerald-400/30',
    topBarClass: 'from-emerald-400/80 to-teal-400/20',
  },
  {
    num: '03',
    title: 'Criminal Profile (Clean vs. Chaos)',
    subtitle: 'Watch for shatter warnings',
    body: 'Stealth, non-lethal takedowns, and sparing targets build a Professional (Clean) profile. Excessive rampages degrade toward Chaos and can permanently shatter your icon—use Slots 11–14 to undo mistakes.',
    icon: Flame,
    accentClass: 'text-rose-300 bg-rose-500/12 border-rose-400/30',
    topBarClass: 'from-rose-400/80 to-amber-400/20',
  },
  {
    num: '04',
    title: 'Family Savings Thresholds',
    subtitle: '$500K+ bonus & $2M+ Best',
    body: 'Banked Family Savings acts as an ending multiplier: $2,000,000+ upgrades the Clean Route A swim escape to the Best ending (e1), while $500,000+ adds an extended bonus epilogue on Good B (e3).',
    icon: DollarSign,
    accentClass: 'text-amber-300 bg-amber-500/12 border-amber-400/30',
    topBarClass: 'from-amber-400/80 to-orange-400/20',
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'Why does this guide use 12 checkpoints for 15 manual save slots?',
    answer:
      'Slots 1 through 10 are dedicated story spine checkpoints, Points of No Return, and Clean/Chaos finale branches. Slots 11–14 form a single 4-slot rolling FIFO mission backup ring, and Slot 15 is your dedicated Main Run Lock—giving you 12 distinct operational checkpoints across all 15 manual slots.',
  },
  {
    question: 'How do I manually save in GTA 6?',
    answer:
      'Exit any active mission, combat, or wanted level into free roam, open the pause menu (Options on PS5 / Menu on Xbox), navigate to the Game tab, select Save Game, and choose one of your 15 manual slots. Activating cheats disables saving for that session.',
  },
  {
    question: 'Why do I need Slot 15 before loading Slot 8, 9, or 10?',
    answer:
      'GTA 6 maintains only one autosave slot. The moment you load an older manual slot and trigger an autosave event, your previous autosave is overwritten. Locking your live campaign into Slot 15 ensures you never lose your primary post-game progress.',
  },
  {
    question: 'When should I fork Slot 10 from Slot 6 instead of Slot 8?',
    answer:
      'If you kept a pristine Professional profile all the way to Chapter 5, forking Slot 8 → Slot 10 lets you tank your profile late in the game. However, if you want to explore mid-game Chaos or strained Relationship states early without touching your Clean spine, fork Slot 6 → Slot 10 in Chapter 3.',
  },
  {
    question: 'How are spoilers protected in this tracker?',
    answer:
      'Every mission name, character twist, and ending consequence is hidden behind a blurred SpoilerText pill that asks "Are you sure? This contains a story spoiler." before revealing. Reveal state is held strictly in memory and resets to blurred on every page reload.',
  },
  {
    question: 'Does this app store my data on a server or require an account?',
    answer:
      'No. Your checked slots, completed endings, and current chapter are saved exclusively in your browser’s localStorage under key gta6_branch_tracker_v1. To move progress to another browser or phone, use the Sync modal to copy a self-contained Base64 code.',
  },
];

export function GuideSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-16 space-y-16 border-t border-white/[0.08] pt-14">
      {/* Editorial 4 Core Mechanics Section */}
      <section id="guide" aria-labelledby="guide-heading" className="scroll-mt-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Companion Handbook
          </p>
          <h2
            id="guide-heading"
            className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
          >
            4 Core Save &amp; Branch Mechanics
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
            Spoiler-free fundamentals for planning a single-playthrough 8-ending
            run across all 15 manual save slots.
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CORE_MECHANICS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="surface-card flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] transition hover:border-white/[0.16]"
              >
                <div
                  className={`h-0.5 w-full bg-gradient-to-r ${card.topBarClass}`}
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${card.accentClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-600">
                      {card.num}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold leading-snug text-white">
                    {card.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-cyan-300/80">
                    {card.subtitle}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-300">
                    {card.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Editorial Split FAQ Section */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="scroll-mt-24 grid gap-8 lg:grid-cols-12"
      >
        <div className="lg:col-span-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Quick Answers
          </p>
          <h2
            id="faq-heading"
            className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Everything you need to know about manual saving, autosave safety,
            offline progress sync, and spoiler protection.
          </p>
        </div>

        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08] lg:col-span-8">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="py-3.5">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex min-h-11 w-full items-center justify-between gap-4 py-1 text-left text-sm font-semibold text-slate-100 transition hover:text-cyan-200 sm:text-base"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2 pb-1 pr-6 text-xs leading-relaxed text-slate-300 sm:text-sm">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
