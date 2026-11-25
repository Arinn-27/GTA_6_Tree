import { useState } from 'react';
import {
  ChevronDown,
  DollarSign,
  Flame,
  HeartHandshake,
  Timer,
} from 'lucide-react';

interface MechanicsCard {
  num: string;
  title: string;
  subtitle: string;
  body: string;
  icon: typeof HeartHandshake;
  accentClass: string;
  topBarClass: string;
}

const CORE_MECHANICS: readonly MechanicsCard[] = [
  {
    num: '01',
    title: 'Relationship Meter (Routes A & B)',
    subtitle: 'Strong Bond vs. Break Up',
    body: 'Your choices, partner support, and prep tasks across Chapters 1–5 steer your Relationship tier. Strong Relationship unlocks Route A (E1, E2, E4, E5, E8); Low / Break Up unlocks Route B (E3, E6, E7).',
    icon: HeartHandshake,
    accentClass: 'text-cyan-300 bg-cyan-500/12 border-cyan-400/30',
    topBarClass: 'from-cyan-400/80 to-sky-400/20',
  },
  {
    num: '02',
    title: 'Criminal Profile (Clean vs. Chaos)',
    subtitle: 'Professional vs. Shattered',
    body: 'Stealth, sparing targets, and disciplined heists build a Clean profile. Excessive rampages shift you to Violent / Psycho / Chaos—locking Bad A (E4) on Route A Swim and blocking Good B (E3) on Route B.',
    icon: Flame,
    accentClass: 'text-rose-300 bg-rose-500/12 border-rose-400/30',
    topBarClass: 'from-rose-400/80 to-amber-400/20',
  },
  {
    num: '03',
    title: 'BuckMe! Savings Thresholds',
    subtitle: '$500K+ bonus & $2M+ Best',
    body: 'Banked BuckMe! Family Savings acts as an ending multiplier: $2,000,000+ upgrades a Clean Route A Exit to the Best Ending (E1), while $500,000+ unlocks an extended bonus epilogue on Good B (E3).',
    icon: DollarSign,
    accentClass: 'text-amber-300 bg-amber-500/12 border-amber-400/30',
    topBarClass: 'from-amber-400/80 to-orange-400/20',
  },
  {
    num: '04',
    title: 'Protective Custody & Timers',
    subtitle: 'Shoot vs. Wait 15–60s',
    body: 'During Protective Custody, holding your fire for 15–60 seconds triggers the hidden "Take Deal" branch (E8 on Route A, E3/standoff on Route B). Shooting leads into final prompt & timer splits.',
    icon: Timer,
    accentClass: 'text-emerald-300 bg-emerald-500/12 border-emerald-400/30',
    topBarClass: 'from-emerald-400/80 to-teal-400/20',
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'What determines Route A vs. Route B in the finale?',
    answer:
      'Your cumulative Relationship Meter across Chapters 1–5 decides the split. Cooperative prep work and supportive dialogue keep you in Route A (Strong Relationship), whereas strained or hostile choices drop you into Route B (Low / Break Up).',
  },
  {
    question: 'How does the hidden "Take Deal" choice work in Protective Custody?',
    answer:
      'Instead of pressing "Shoot" immediately when prompted, wait 15–60 seconds without firing. On Route A this resolves straight to Worst: Hidden Deal (E8); on Route B it runs a Criminal Profile check that unlocks Good B (E3) for Clean players or forces the Final Standoff for Chaos players.',
  },
  {
    question: 'Why does Bad Ending A (E4) show a "Converges (2 paths)" badge?',
    answer:
      'Two completely different conditions lead to Bad Ending A (E4) after choosing "Swim" on Route A: either having a Violent / Psycho / Chaos Criminal Profile (which locks E4 even if you reach the Exit), or having a Clean profile and letting the final escape timer expire.',
  },
  {
    question: 'What are the launch-week verification notes on E6 and E7?',
    answer:
      'Early launch-week community testing reported slight variation in whether the Route B rooftop standoff (Stay Down / Defend) requires choosing "Shoot" directly or can also fire after "Take Deal" under specific Chaos profile thresholds. Both paths are mapped clearly so you can verify against your current patch.',
  },
  {
    question: 'How are story spoilers protected in ViceBranch?',
    answer:
      'Every plot twist, mission beat, and ending consequence is hidden behind a blurred <SpoilerText> pill that asks "Are you sure? This contains a story spoiler." before revealing. Reveal state stays strictly in memory and resets to blurred whenever you reload the page.',
  },
  {
    question: 'Where is my ending checklist progress stored?',
    answer:
      'All progress is stored 100% locally in your browser under localStorage key gta6_story_tracker_v1. No account or backend server is used. You can copy or paste an offline Base64 backup code anytime via the Sync modal.',
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
            4 Core Story &amp; Branch Mechanics
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
            Spoiler-free fundamentals explaining every stat gate, hidden timer,
            and savings threshold behind GTA 6’s 8 endings.
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
                    <span className="font-mono text-xs font-bold tabular-nums text-slate-600">
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
            How relationship routes, hidden timers, converging endings, offline
            progress sync, and spoiler protection work.
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
