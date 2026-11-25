import type {
  EndingId,
  ProfileSubFilter,
  StoryChapterId,
  StoryDagEdge,
  StoryDagFilterOption,
  StoryDagNode,
  StoryPathFilter,
} from '../types/tracker';
import { ENDINGS, getEndingById } from './endings';

export const CHAPTER_ORDER: readonly StoryChapterId[] = [
  'ch-1',
  'ch-2',
  'ch-3',
  'ch-4',
  'ch-5',
];

export const STORY_DAG_FILTERS: readonly StoryDagFilterOption[] = [
  {
    id: 'all',
    label: 'All Paths',
    description:
      'Complete chronological Chapter 1–5 decision DAG showing rejoining choices, inline manual save anchors, SPLIT ON condition gates, and all 8 canonical endings.',
  },
  {
    id: 'route-a',
    label: 'Route A: Strong Relationship',
    description:
      'Highlights positive relationship choices and the Strong Relationship finale branch leading to E1, E2, E4, E5, and E8.',
  },
  {
    id: 'route-b',
    label: 'Route B: Low / Break Up',
    description:
      'Highlights strained choices and the Low / Break Up finale branch leading to Good B (E3 + $500K Bonus Epilogue) and the Rooftop Standoff (E6 & E7).',
  },
  {
    id: 'clean-vs-chaos',
    label: 'Clean vs. Chaos',
    description:
      'Highlights Criminal Profile gates from Chapter 1 ("Hey Arnold!") through Chapter 5 where Clean vs. Violent / Psycho / Irredeemable alters outcomes.',
  },
];

const ALL_ENDINGS: EndingId[] = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'];

export const STORY_DAG_NODES: readonly StoryDagNode[] = [
  // =========================================================================
  // CHAPTER 1
  // =========================================================================
  {
    id: 'ch-1',
    chapterId: 'ch-1',
    nodeType: 'chapter',
    chapterNumber: 1,
    title: 'Chapter 1 · Leonida Keys & Opening Baseline',
    subtitle: 'Prologue free roam, early Criminal Profile pivot, and regional transition',
    stageLabel: 'CH. 01',
    unlockCondition: 'Campaign Start (Opening Prologue Complete)',
    impactTags: ['Prologue Baseline', 'Early Profile'],
    requirements: [
      'Manual saving unlocks as soon as opening prologue restrictions lift in free roam.',
      'Your earliest spare-or-shoot decision sets your initial Criminal Profile trajectory before leaving the Keys.',
    ],
    spoilerContext:
      'Opens at Jason’s marina safehouse in the Leonida Keys and concludes with Mattia’s transition job "Tourist Trap".',
    lane: 'root',
    isCollapsible: true,
    nextChapterId: 'ch-2',
    desktopGrid: { colStart: 1, colSpan: 5, row: 0 },
    mobileDepth: 0,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'choice-hey-arnold',
    chapterId: 'ch-1',
    nodeType: 'choice',
    title: '"Hey Arnold!" — Spare vs. Shoot',
    subtitle: 'First major Criminal Profile decision fork',
    stageLabel: 'Choice Fork',
    unlockCondition: 'Chapter 1 Story Mission',
    impactTags: ['Criminal Profile', 'Rejoins Spine'],
    requirements: [
      'Presents your first major spare-or-shoot confrontation.',
      'Both outcomes rejoin the main story spine at the Chapter 1 Point of No Return.',
    ],
    spoilerContext:
      'Confronting the target during "Hey Arnold!" establishes whether Jason favors disciplined restraint or lethal escalation.',
    lane: 'root',
    isCollapsible: true,
    rejoinTargetId: 'save-ch1-ponr',
    desktopGrid: { colStart: 2, colSpan: 3, row: 1 },
    mobileDepth: 1,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'branch-hey-arnold-spare',
    chapterId: 'ch-1',
    nodeType: 'choice',
    title: 'Spare Target',
    subtitle: 'Disciplined Clean foundation',
    stageLabel: 'Branch · Clean',
    unlockCondition: 'Choose non-lethal / Spare in "Hey Arnold!"',
    impactTags: ['+Clean Profile', 'Rejoins Spine'],
    requirements: [
      'Builds early Professional (Clean) standing with zero unnecessary casualties.',
      'Rejoins the main Chapter 1 spine before the regional transition.',
    ],
    spoilerContext:
      'Walking away cleanly preserves your Professional profile rating entering Chapter 2.',
    lane: 'clean',
    desktopGrid: { colStart: 1, colSpan: 2, row: 2 },
    mobileDepth: 2,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'branch-hey-arnold-shoot',
    chapterId: 'ch-1',
    nodeType: 'choice',
    title: 'Shoot Target',
    subtitle: 'Early Chaos drift',
    stageLabel: 'Branch · Chaos',
    unlockCondition: 'Choose lethal / Shoot in "Hey Arnold!"',
    impactTags: ['Chaos Drift', 'Rejoins Spine'],
    requirements: [
      'Pushes Criminal Profile toward Violent / Chaos early, though recoverable via Clean play later.',
      'Rejoins the main Chapter 1 spine before the regional transition.',
    ],
    spoilerContext:
      'Executing the target triggers early Chaos meter drift without locking out later recovery.',
    lane: 'chaos',
    desktopGrid: { colStart: 4, colSpan: 2, row: 2 },
    mobileDepth: 2,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'save-ch1-ponr',
    chapterId: 'ch-1',
    nodeType: 'save',
    title: 'Before Ch. 1 Point of No Return',
    subtitle: 'Optional manual checkpoint before leaving the opening region',
    stageLabel: 'Save Checkpoint',
    unlockCondition: 'Save in free roam before launching the Chapter 1 finale',
    impactTags: ['Regional Lockout Guard'],
    requirements: [
      'Both "Hey Arnold!" paths rejoin here before the region transition locks early Keys errands.',
      'Lightweight checkpoint—useful if you want a clean Chapter 1 exit state.',
    ],
    spoilerContext:
      'Placed right before accepting Mattia’s job and launching "Tourist Trap", which ends Chapter 1.',
    lane: 'root',
    desktopGrid: { colStart: 2, colSpan: 3, row: 3 },
    mobileDepth: 1,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },

  // =========================================================================
  // CHAPTER 2
  // =========================================================================
  {
    id: 'ch-2',
    chapterId: 'ch-2',
    nodeType: 'chapter',
    chapterNumber: 2,
    title: 'Chapter 2 · Mid-Act Loyalty & De-escalation',
    subtitle: 'Partner trust pivots and pre-Vice City transition',
    stageLabel: 'CH. 02',
    unlockCondition: 'Complete Chapter 1 Transition',
    impactTags: ['Relationship Meter', 'De-escalation'],
    requirements: [
      'Chapter 2 introduces multi-option missions that steer both Relationship Level and Criminal Profile.',
    ],
    spoilerContext:
      'Centers on "Girls’ Trip" and "Afternoon Delight" before "Checking Out" moves operations toward Vice City.',
    lane: 'root',
    isCollapsible: true,
    nextChapterId: 'ch-3',
    desktopGrid: { colStart: 1, colSpan: 5, row: 0 },
    mobileDepth: 0,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'choice-ch2-conflict',
    chapterId: 'ch-2',
    nodeType: 'choice',
    title: '"Girls’ Trip" & "Afternoon Delight"',
    subtitle: 'De-escalate vs. firefight decision fork',
    stageLabel: 'Choice Fork',
    unlockCondition: 'Mid-Chapter 2 Story Arc',
    impactTags: ['Relationship', 'Criminal Profile', 'Rejoins Spine'],
    requirements: [
      'Choose peaceful de-escalation and partner cooperation, or escalate into loud gunfights.',
      'Both outcomes merge back onto the spine ahead of the Chapter 2 finale.',
    ],
    spoilerContext:
      'Cooperative de-escalation during "Girls’ Trip" and "Afternoon Delight" raises bond standing and keeps your Clean record intact.',
    lane: 'root',
    isCollapsible: true,
    rejoinTargetId: 'save-ch2-checking-out',
    desktopGrid: { colStart: 2, colSpan: 3, row: 1 },
    mobileDepth: 1,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'branch-ch2-defuse',
    chapterId: 'ch-2',
    nodeType: 'choice',
    title: 'Defuse & Cooperate',
    subtitle: 'Boosts Relationship & Clean standing',
    stageLabel: 'Branch · Route A / Clean',
    unlockCondition: 'Choose de-escalation & support partner prep',
    impactTags: ['+Relationship', '+Clean Profile', 'Rejoins Spine'],
    requirements: [
      'Builds momentum toward Strong Relationship (Route A) and Professional Clean status.',
      'Rejoins the main spine prior to the Chapter 2 finale.',
    ],
    spoilerContext:
      'Resolving tensions cleanly prevents wanted-level escalation and reinforces Jason and Lucia’s partnership.',
    lane: 'clean',
    desktopGrid: { colStart: 1, colSpan: 2, row: 2 },
    mobileDepth: 2,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'branch-ch2-firefight',
    chapterId: 'ch-2',
    nodeType: 'choice',
    title: 'Escalate Firefight',
    subtitle: 'Strains trust & adds Chaos heat',
    stageLabel: 'Branch · Route B / Chaos',
    unlockCondition: 'Escalate conflicts into lethal firefights',
    impactTags: ['Chaos Drift', '-Relationship', 'Rejoins Spine'],
    requirements: [
      'Pushes Criminal Profile toward Chaos and strains partner trust toward Route B.',
      'Rejoins the main spine prior to the Chapter 2 finale.',
    ],
    spoilerContext:
      'Triggering heavy civilian/police crossfire strains dialogue entering the Vice City act.',
    lane: 'chaos',
    desktopGrid: { colStart: 4, colSpan: 2, row: 2 },
    mobileDepth: 2,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'save-ch2-checking-out',
    chapterId: 'ch-2',
    nodeType: 'save',
    title: 'Before "Checking Out" (Ch. 2 PONR)',
    subtitle: 'Optional manual checkpoint before moving to Vice City',
    stageLabel: 'Save Checkpoint',
    unlockCondition: 'Save in free roam before initiating the Chapter 2 finale',
    impactTags: ['Vice City Transition'],
    requirements: [
      'Protects earlier rural side activities before operations relocate to Vice City.',
    ],
    spoilerContext:
      'Placed right before starting "Checking Out" and accepting the move into Vice City.',
    lane: 'root',
    desktopGrid: { colStart: 2, colSpan: 3, row: 3 },
    mobileDepth: 1,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },

  // =========================================================================
  // CHAPTER 3
  // =========================================================================
  {
    id: 'ch-3',
    chapterId: 'ch-3',
    nodeType: 'chapter',
    chapterNumber: 3,
    title: 'Chapter 3 · Vice City & "Dubious Provenance"',
    subtitle: 'Nested statue-deal fork rejoining the Chapter 4 spine',
    stageLabel: 'CH. 03',
    unlockCondition: 'Arrive in Vice City (Chapter 3 Start)',
    impactTags: ['Nested Choice', 'Rejoins Spine'],
    requirements: [
      'Demonstrates a multi-step story fork ("Dubious Provenance") whose sub-branches all rejoin the main spine cleanly.',
    ],
    spoilerContext:
      'Includes the "Dubious Provenance" statue negotiation and major Vice City syndicate setup.',
    lane: 'root',
    isCollapsible: true,
    nextChapterId: 'ch-4',
    desktopGrid: { colStart: 1, colSpan: 5, row: 0 },
    mobileDepth: 0,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'choice-dubious-prov',
    chapterId: 'ch-3',
    nodeType: 'choice',
    title: '"Dubious Provenance" — Give Statue vs. Reject',
    subtitle: 'Nested Chapter 3 choice that rejoins Chapter 4',
    stageLabel: 'Choice Fork',
    unlockCondition: 'Chapter 3 Mission "Dubious Provenance"',
    impactTags: ['Nested Branch', 'Rejoins Ch. 4'],
    requirements: [
      'Hand over the statue immediately OR reject the offer to trigger a secondary Trust vs. Don’t Trust choice.',
      'All three resulting outcomes rejoin the main spine entering Chapter 4.',
    ],
    spoilerContext:
      'Deciding whether to surrender the artifact immediately or refuse sets up a tense secondary trust check.',
    lane: 'root',
    isCollapsible: true,
    rejoinTargetId: 'ch-4',
    desktopGrid: { colStart: 2, colSpan: 3, row: 1 },
    mobileDepth: 1,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'branch-dp-give',
    chapterId: 'ch-3',
    nodeType: 'choice',
    title: 'Give Statue',
    subtitle: 'Clean direct handover',
    stageLabel: 'Branch · Direct',
    unlockCondition: 'Hand over the statue without escalating',
    impactTags: ['Low Heat', 'Rejoins Ch. 4'],
    requirements: [
      'Skips the secondary confrontation and keeps profile heat low.',
      'Rejoins the main campaign spine directly at Chapter 4.',
    ],
    spoilerContext:
      'Complying with the handover resolves the scene peacefully and avoids the follow-up trust standoff.',
    lane: 'clean',
    desktopGrid: { colStart: 1, colSpan: 2, row: 2 },
    mobileDepth: 2,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'choice-dp-trust',
    chapterId: 'ch-3',
    nodeType: 'choice',
    title: 'Reject → Trust vs. Don’t Trust',
    subtitle: 'Secondary loyalty check after rejecting deal',
    stageLabel: 'Nested Fork',
    unlockCondition: 'Choose "Reject" in "Dubious Provenance"',
    impactTags: ['Relationship Pivot', 'Rejoins Ch. 4'],
    requirements: [
      'Refusing the handover triggers a follow-up Trust vs. Don’t Trust prompt.',
      'Both outcomes rejoin the main spine entering Chapter 4.',
    ],
    spoilerContext:
      'Refusing the deal forces an immediate split-second test of whether Lucia and Jason back each other.',
    lane: 'route-b',
    isCollapsible: true,
    rejoinTargetId: 'ch-4',
    desktopGrid: { colStart: 4, colSpan: 2, row: 2 },
    mobileDepth: 2,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'branch-dp-trust',
    chapterId: 'ch-3',
    nodeType: 'choice',
    title: 'Trust',
    subtitle: 'Reinforces Route A bond',
    stageLabel: 'Branch · Route A',
    unlockCondition: 'Reject Deal -> Choose "Trust"',
    impactTags: ['+Relationship', 'Rejoins Ch. 4'],
    requirements: [
      'Strengthens partner bond toward Route A despite rejecting the deal.',
      'Rejoins Chapter 4.',
    ],
    spoilerContext:
      'Backing your partner preserves loyalty entering the late-game Vice City setup.',
    lane: 'route-a',
    desktopGrid: { colStart: 4, colSpan: 1, row: 3 },
    mobileDepth: 3,
    filters: ['all', 'route-a'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'branch-dp-distrust',
    chapterId: 'ch-3',
    nodeType: 'choice',
    title: 'Don’t Trust',
    subtitle: 'Fractures bond toward Route B',
    stageLabel: 'Branch · Route B',
    unlockCondition: 'Reject Deal -> Choose "Don’t Trust"',
    impactTags: ['-Relationship', 'Chaos Drift', 'Rejoins Ch. 4'],
    requirements: [
      'Drives Relationship standing down toward Route B (Low / Break Up).',
      'Rejoins Chapter 4.',
    ],
    spoilerContext:
      'Doubting your partner deepens the rift that shapes Route B dialogue in the finale.',
    lane: 'chaos',
    desktopGrid: { colStart: 5, colSpan: 1, row: 3 },
    mobileDepth: 3,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
    reachableEndings: ALL_ENDINGS,
  },

  // =========================================================================
  // CHAPTER 4
  // =========================================================================
  {
    id: 'ch-4',
    chapterId: 'ch-4',
    nodeType: 'chapter',
    chapterNumber: 4,
    title: 'Chapter 4 · "Tie Up Loose Ends" & Finale Prep',
    subtitle: 'All Chapter 3 paths converge here before the endgame lock-in',
    stageLabel: 'CH. 04',
    unlockCondition: 'All Chapter 3 Branches Rejoin Spine',
    impactTags: ['BuckMe! Savings', 'Profile Lock'],
    requirements: [
      'Last free-roam window to hit BuckMe! Family Savings thresholds ($500K+ / $2M+) and stabilize your Criminal Profile before Chapter 5.',
    ],
    spoilerContext:
      'Leads up to collecting the Y Hotel front-desk envelope in "Tie Up Loose Ends", launching "Sunset" and Chapter 5.',
    lane: 'root',
    isCollapsible: true,
    nextChapterId: 'ch-5',
    desktopGrid: { colStart: 1, colSpan: 5, row: 0 },
    mobileDepth: 0,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'choice-ch4-heist',
    chapterId: 'ch-4',
    nodeType: 'choice',
    title: 'Late-Act Prep & BuckMe! Banking',
    subtitle: 'Final world-state positioning before Chapter 5 lock-in',
    stageLabel: 'Choice Fork',
    unlockCondition: 'Chapter 4 Free Roam & Setup Missions',
    impactTags: ['Savings Target', 'Profile Guard', 'Rejoins Spine'],
    requirements: [
      'Choose disciplined stealth + BuckMe! banking ($2M+ for E1, $500K+ for E3 bonus) or reckless loud play.',
      'Rejoins at the Chapter 5 Start checkpoint.',
    ],
    spoilerContext:
      'Final chance before "Sunset" locks normal free roam to top up BuckMe! Family Savings and avoid Shattered profile warnings.',
    lane: 'root',
    isCollapsible: true,
    rejoinTargetId: 'save-ch5-start',
    desktopGrid: { colStart: 2, colSpan: 3, row: 1 },
    mobileDepth: 1,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'branch-ch4-prep-clean',
    chapterId: 'ch-4',
    nodeType: 'choice',
    title: 'Stealth & Bank $2M+',
    subtitle: 'Unlocks Best (E1) & E3 Bonus eligibility',
    stageLabel: 'Branch · Clean',
    unlockCondition: 'Maintain Clean Profile + Bank BuckMe! Savings',
    impactTags: ['+Clean Profile', '$2M+ Ready', 'Rejoins Spine'],
    requirements: [
      'Keeps Criminal Profile Professional (Clean) and prepares BuckMe! savings thresholds.',
    ],
    spoilerContext:
      'Ensures Abe has full offshore capital ($2M+) for the Best Ending reset or $500K+ for Good B’s bonus epilogue.',
    lane: 'clean',
    desktopGrid: { colStart: 1, colSpan: 2, row: 2 },
    mobileDepth: 2,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'branch-ch4-prep-chaos',
    chapterId: 'ch-4',
    nodeType: 'choice',
    title: 'Loud Spree / Unfunded',
    subtitle: 'Triggers Chaos overrides & caps savings',
    stageLabel: 'Branch · Chaos',
    unlockCondition: 'Shatter Criminal Profile or enter under $2M',
    impactTags: ['Chaos Profile', 'Savings < $2M', 'Rejoins Spine'],
    requirements: [
      'A Shattered (Violent / Psycho / Irredeemable) profile locks out E1, E2, and E3 in Chapter 5.',
    ],
    spoilerContext:
      'Excessive collateral damage fractures your profile icon permanently before the Chapter 5 gauntlet.',
    lane: 'chaos',
    desktopGrid: { colStart: 4, colSpan: 2, row: 2 },
    mobileDepth: 2,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'save-ch5-start',
    chapterId: 'ch-4',
    nodeType: 'save',
    title: 'Chapter 5 Start',
    subtitle: 'Optional manual checkpoint before accepting the Chapter 4 envelope',
    stageLabel: 'Save Checkpoint',
    unlockCondition: 'Save during "Tie Up Loose Ends" before picking up the envelope',
    impactTags: ['Pre-Gauntlet Lock'],
    requirements: [
      'Accepting the waiting envelope initiates an extended multi-mission sequence into Chapter 5.',
    ],
    spoilerContext:
      'Bookmarks the final breather before the Y Hotel front-desk envelope triggers "Sunset" and Chapter 5.',
    lane: 'root',
    desktopGrid: { colStart: 2, colSpan: 3, row: 3 },
    mobileDepth: 1,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },

  // =========================================================================
  // CHAPTER 5
  // =========================================================================
  {
    id: 'ch-5',
    chapterId: 'ch-5',
    nodeType: 'chapter',
    chapterNumber: 5,
    title: 'Chapter 5 · "Protective Custody" & All 8 Endings',
    subtitle: 'Boolean condition gates, hidden 15–60s timer, and canonical ending convergence',
    stageLabel: 'CH. 05',
    unlockCondition: 'Reach Chapter 5 Finale',
    impactTags: ['SPLIT ON Gates', '8 Endings'],
    requirements: [
      'Evaluates Relationship Level, Criminal Profile, Escape Timer, BuckMe! Family Savings, and final player choices.',
    ],
    spoilerContext:
      'Culminates in "Protective Custody", where Route A leads to the Leonida Keys bridge and Route B leads to the Tower sting or rooftop standoff.',
    lane: 'root',
    isCollapsible: true,
    desktopGrid: { colStart: 1, colSpan: 5, row: 0 },
    mobileDepth: 0,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'save-ch5-prefinale',
    chapterId: 'ch-5',
    nodeType: 'save',
    title: 'Pre-Finale Master Split',
    subtitle: 'Optional manual checkpoint right before "Protective Custody"',
    stageLabel: 'Save Checkpoint',
    unlockCondition: 'Save in free roam immediately before starting the finale mission',
    impactTags: ['Finale Rewind Anchor'],
    requirements: [
      'Lets you replay every "Protective Custody" decision branch cleanly.',
    ],
    spoilerContext:
      'Placed right outside the start trigger for "Protective Custody".',
    lane: 'root',
    desktopGrid: { colStart: 2, colSpan: 3, row: 1 },
    mobileDepth: 1,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'cond-relationship',
    chapterId: 'ch-5',
    nodeType: 'condition',
    title: 'Relationship Route Split',
    subtitle: 'Evaluates cumulative Chapters 1–5 bond',
    stageLabel: 'Condition Gate',
    splitVariable: 'Relationship Level',
    unlockCondition: 'Relationship High -> Route A | Low / Break Up -> Route B',
    impactTags: ['Route A (5 Endings)', 'Route B (3 Endings)'],
    requirements: [
      'Relationship High unlocks Route A (E1, E2, E4, E5, E8).',
      'Low / Break Up unlocks Route B (E3, E6, E7).',
    ],
    spoilerContext:
      'Determines whether Jason and Lucia enter "Protective Custody" united (Route A) or estranged (Route B).',
    lane: 'root',
    isCollapsible: true,
    desktopGrid: { colStart: 2, colSpan: 3, row: 2 },
    mobileDepth: 1,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ALL_ENDINGS,
  },
  {
    id: 'choice-ra-custody',
    chapterId: 'ch-5',
    nodeType: 'choice',
    title: 'Route A · "Protective Custody"',
    subtitle: 'Shoot vs. Wait 15–60s ("Take Deal")',
    stageLabel: 'Choice Fork',
    unlockCondition: 'Relationship High (Route A)',
    impactTags: ['Hidden 15–60s Timer'],
    requirements: [
      'Choose "Shoot" immediately to advance to the bridge finale.',
      'Or wait 15–60 seconds without firing to trigger the hidden "Take Deal" branch (E8).',
    ],
    spoilerContext:
      'Méndez offers a backdoor truce if you hold fire for 15–60 seconds—accepting on Route A triggers a fatal swamp double-cross.',
    lane: 'route-a',
    isCollapsible: true,
    desktopGrid: { colStart: 1, colSpan: 3, row: 3 },
    mobileDepth: 2,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ['e1', 'e2', 'e4', 'e5', 'e8'],
  },
  {
    id: 'choice-rb-custody',
    chapterId: 'ch-5',
    nodeType: 'choice',
    title: 'Route B · "Protective Custody"',
    subtitle: 'Wait 15–60s ("Take Deal") vs. Shoot',
    stageLabel: 'Choice Fork',
    unlockCondition: 'Relationship Low / Break Up (Route B)',
    impactTags: ['Hidden 15–60s Timer'],
    requirements: [
      'Wait 15–60 seconds ("Take Deal") to trigger a Criminal Profile check for Good B (E3).',
      'Choose "Shoot" immediately to trigger the Route B Final Standoff (E6 / E7).',
    ],
    spoilerContext:
      'On Route B, waiting to accept Méndez’s offer sets up a federal Tower sting; shooting forces an immediate rooftop ambush.',
    lane: 'route-b',
    isCollapsible: true,
    desktopGrid: { colStart: 4, colSpan: 2, row: 3 },
    mobileDepth: 2,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ['e3', 'e6', 'e7'],
  },
  {
    id: 'choice-ra-bridge',
    chapterId: 'ch-5',
    nodeType: 'choice',
    title: 'Final Bridge Prompt',
    subtitle: 'Swim vs. No Surrender',
    stageLabel: 'Choice Fork',
    unlockCondition: 'Route A + Chose "Shoot"',
    impactTags: ['Bridge Ambush'],
    requirements: [
      'Choose "Swim" to bail out into the water and enter the Criminal Profile gate.',
      'Choose "No Surrender" to ram the police barricade for Bad Ending B (E5).',
    ],
    spoilerContext:
      'Cornered by police cruisers on the Leonida Keys bridge, you can bail into the ocean or charge straight into gunfire.',
    lane: 'route-a',
    isCollapsible: true,
    desktopGrid: { colStart: 1, colSpan: 2, row: 4 },
    mobileDepth: 3,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ['e1', 'e2', 'e4', 'e5'],
  },
  {
    id: 'e8',
    chapterId: 'ch-5',
    nodeType: 'outcome',
    title: getEndingById('e8').name,
    subtitle: 'Wait 15–60s Hidden Outcome',
    stageLabel: 'Worst · E8',
    unlockCondition: 'Relationship High + Wait 15–60s ("Take Deal")',
    requirements: [...getEndingById('e8').unlockSteps],
    spoilerContext: getEndingById('e8').spoilerSummary,
    lane: 'chaos',
    desktopGrid: { colStart: 3, colSpan: 1, row: 4 },
    mobileDepth: 3,
    filters: ['all', 'route-a'],
    profileAffinity: 'neutral',
    endingId: 'e8',
    reachableEndings: ['e8'],
  },
  {
    id: 'cond-rb-profile',
    chapterId: 'ch-5',
    nodeType: 'condition',
    title: 'Route B Deal Profile Gate',
    subtitle: 'Evaluates Criminal Profile on Take Deal',
    stageLabel: 'Condition Gate',
    splitVariable: 'Criminal Profile',
    unlockCondition: 'Clean Profile -> E3 | Violent / Psycho / Irredeemable -> Standoff',
    impactTags: ['Disqualifies E3 on Chaos'],
    requirements: [
      'Clean (Professional) profile unlocks Good Ending B (E3).',
      'Violent / Psycho / Irredeemable disqualifies E3 and forces the Final Standoff.',
    ],
    spoilerContext:
      'Federal agents honor the immunity deal for Lucia only if your Criminal Profile remained Clean.',
    lane: 'route-b',
    isCollapsible: true,
    desktopGrid: { colStart: 4, colSpan: 1, row: 4 },
    mobileDepth: 3,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ['e3', 'e6', 'e7'],
  },
  {
    id: 'e5',
    chapterId: 'ch-5',
    nodeType: 'outcome',
    title: getEndingById('e5').name,
    subtitle: 'Bridge Roadblock Charge',
    stageLabel: 'Bad B · E5',
    unlockCondition: 'Route A + "Shoot" + "No Surrender"',
    requirements: [...getEndingById('e5').unlockSteps],
    spoilerContext: getEndingById('e5').spoilerSummary,
    lane: 'chaos',
    desktopGrid: { colStart: 1, colSpan: 1, row: 5 },
    mobileDepth: 4,
    filters: ['all', 'route-a'],
    profileAffinity: 'neutral',
    endingId: 'e5',
    reachableEndings: ['e5'],
  },
  {
    id: 'cond-ra-profile',
    chapterId: 'ch-5',
    nodeType: 'condition',
    title: 'Bridge Swim Profile Gate',
    subtitle: 'Evaluates Criminal Profile on Swim',
    stageLabel: 'Condition Gate',
    splitVariable: 'Criminal Profile',
    unlockCondition: 'Clean Profile -> Escape Timer | Chaos -> Locks E4',
    impactTags: ['Chaos Override'],
    requirements: [
      'Clean Profile opens the Final Escape Timer.',
      'Violent / Psycho / Irredeemable locks Bad Ending A (E4) regardless of Exit speed.',
    ],
    spoilerContext:
      'A shattered Chaos profile brings overwhelming patrol fire onto the shoreline, sealing E4.',
    lane: 'route-a',
    isCollapsible: true,
    desktopGrid: { colStart: 2, colSpan: 1, row: 5 },
    mobileDepth: 4,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ['e1', 'e2', 'e4'],
  },
  {
    id: 'e3',
    chapterId: 'ch-5',
    nodeType: 'outcome',
    title: getEndingById('e3').name,
    subtitle: 'Clean Tower Sting Deal',
    stageLabel: 'Good B · E3',
    unlockCondition: 'Route B + Wait 15–60s ("Take Deal") + Clean Profile',
    requirements: [...getEndingById('e3').unlockSteps],
    spoilerContext: getEndingById('e3').spoilerSummary,
    note: getEndingById('e3').bonusEpilogueNote,
    lane: 'clean',
    desktopGrid: { colStart: 4, colSpan: 1, row: 5 },
    mobileDepth: 4,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    endingId: 'e3',
    reachableEndings: ['e3'],
  },
  {
    id: 'choice-rb-standoff',
    chapterId: 'ch-5',
    nodeType: 'choice',
    title: 'Route B · Final Standoff',
    subtitle: 'Stay Down vs. Defend',
    stageLabel: 'Standoff Fork',
    unlockCondition: 'Route B "Shoot" OR "Take Deal" + Chaos Profile',
    impactTags: ['Converges (2 paths)'],
    requirements: [
      'Reached directly via "Shoot" on Route B, or forced when a Chaos profile takes the deal.',
      'Choose "Stay Down" (E6) or "Defend" (E7).',
    ],
    spoilerContext:
      'Cornered on the rooftop, Jason shields Lucia for one final split-second prompt.',
    note: getEndingById('e6').launchWeekNote,
    lane: 'chaos',
    isCollapsible: true,
    desktopGrid: { colStart: 5, colSpan: 1, row: 5 },
    mobileDepth: 4,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'both',
    reachableEndings: ['e6', 'e7'],
  },
  {
    id: 'cond-ra-timer',
    chapterId: 'ch-5',
    nodeType: 'condition',
    title: 'Final Escape Window',
    subtitle: 'Evaluates extraction speed in the water',
    stageLabel: 'Condition Gate',
    splitVariable: 'Escape Timer',
    unlockCondition: 'Exit Before Timeout -> Savings Gate | Expire -> E4',
    impactTags: ['Timed Escape'],
    requirements: [
      'Reach the shoreline "Exit" before the timer expires to unlock the BuckMe! Savings check.',
      'Letting the timer expire converges onto Bad Ending A (E4).',
    ],
    spoilerContext:
      'Jason and Lucia swim beneath searchlights toward the getaway boat before patrol sweeps close in.',
    lane: 'clean',
    isCollapsible: true,
    desktopGrid: { colStart: 2, colSpan: 1, row: 6 },
    mobileDepth: 5,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    reachableEndings: ['e1', 'e2', 'e4'],
  },
  {
    id: 'outcome-e3-bonus',
    chapterId: 'ch-5',
    nodeType: 'outcome',
    title: 'E3+ · Bonus Epilogue',
    subtitle: 'Extended prison visit scene',
    stageLabel: 'Bonus Gate',
    unlockCondition: 'Good B (E3) + BuckMe! Savings >= $500,000',
    impactTags: ['Savings >= $500,000'],
    requirements: [
      'Unlocked automatically on Good Ending B (E3) when holding at least $500,000 in BuckMe! Family Savings.',
    ],
    spoilerContext:
      'Lucia uses the banked $500K+ Family Savings to secure stability and brings Tomás to visit Jason in prison.',
    note: getEndingById('e3').bonusEpilogueNote,
    lane: 'clean',
    desktopGrid: { colStart: 4, colSpan: 1, row: 6 },
    mobileDepth: 5,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    bonusForEndingId: 'e3',
    reachableEndings: ['e3'],
  },
  {
    id: 'cond-ra-savings',
    chapterId: 'ch-5',
    nodeType: 'condition',
    title: 'BuckMe! Savings Gate',
    subtitle: 'Evaluates banked Family Savings',
    stageLabel: 'Condition Gate',
    splitVariable: 'BuckMe! Family Savings',
    unlockCondition: 'Savings >= $2,000,000 -> E1 | Savings < $2,000,000 -> E2',
    impactTags: ['$2,000,000 Threshold'],
    requirements: [
      'Savings >= $2,000,000 upgrades the clean escape to Best Ending (E1).',
      'Savings < $2,000,000 resolves to Good Ending A (E2).',
    ],
    spoilerContext:
      'Checks whether Abe has enough capital to launder a permanent offshore reset for the family.',
    lane: 'clean',
    isCollapsible: true,
    desktopGrid: { colStart: 1, colSpan: 2, row: 7 },
    mobileDepth: 6,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    reachableEndings: ['e1', 'e2'],
  },
  {
    id: 'e4',
    chapterId: 'ch-5',
    nodeType: 'outcome',
    title: getEndingById('e4').name,
    subtitle: 'Timer Expire OR Chaos Override',
    stageLabel: 'Bad A · E4',
    unlockCondition: 'Swim + (Chaos Profile OR Clean "Expire")',
    requirements: [...getEndingById('e4').unlockSteps],
    spoilerContext: getEndingById('e4').spoilerSummary,
    lane: 'chaos',
    desktopGrid: { colStart: 3, colSpan: 1, row: 7 },
    mobileDepth: 5,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'both',
    endingId: 'e4',
    reachableEndings: ['e4'],
  },
  {
    id: 'e6',
    chapterId: 'ch-5',
    nodeType: 'outcome',
    title: getEndingById('e6').name,
    subtitle: 'Launch-Week Verification Note',
    stageLabel: 'Bad C · E6',
    unlockCondition: 'Route B Standoff + "Stay Down"',
    requirements: [...getEndingById('e6').unlockSteps],
    spoilerContext: getEndingById('e6').spoilerSummary,
    note: getEndingById('e6').launchWeekNote,
    lane: 'chaos',
    desktopGrid: { colStart: 4, colSpan: 1, row: 7 },
    mobileDepth: 5,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'both',
    endingId: 'e6',
    reachableEndings: ['e6'],
  },
  {
    id: 'e7',
    chapterId: 'ch-5',
    nodeType: 'outcome',
    title: getEndingById('e7').name,
    subtitle: 'Launch-Week Verification Note',
    stageLabel: 'Bad D · E7',
    unlockCondition: 'Route B Standoff + "Defend"',
    requirements: [...getEndingById('e7').unlockSteps],
    spoilerContext: getEndingById('e7').spoilerSummary,
    note: getEndingById('e7').launchWeekNote,
    lane: 'chaos',
    desktopGrid: { colStart: 5, colSpan: 1, row: 7 },
    mobileDepth: 5,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'both',
    endingId: 'e7',
    reachableEndings: ['e7'],
  },
  {
    id: 'e1',
    chapterId: 'ch-5',
    nodeType: 'outcome',
    title: getEndingById('e1').name,
    subtitle: 'Full Offshore Fresh Start',
    stageLabel: 'Best · E1',
    unlockCondition: 'Clean + Exit + Savings >= $2,000,000',
    requirements: [...getEndingById('e1').unlockSteps],
    spoilerContext: getEndingById('e1').spoilerSummary,
    lane: 'clean',
    desktopGrid: { colStart: 1, colSpan: 1, row: 8 },
    mobileDepth: 7,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    endingId: 'e1',
    reachableEndings: ['e1'],
  },
  {
    id: 'e2',
    chapterId: 'ch-5',
    nodeType: 'outcome',
    title: getEndingById('e2').name,
    subtitle: 'Together on the Run',
    stageLabel: 'Good A · E2',
    unlockCondition: 'Clean + Exit + Savings < $2,000,000',
    requirements: [...getEndingById('e2').unlockSteps],
    spoilerContext: getEndingById('e2').spoilerSummary,
    lane: 'clean',
    desktopGrid: { colStart: 2, colSpan: 1, row: 8 },
    mobileDepth: 7,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    endingId: 'e2',
    reachableEndings: ['e2'],
  },
];

export const STORY_DAG_EDGES: readonly StoryDagEdge[] = [
  // Chapter 1
  {
    id: 'ch1-to-hey-arnold',
    from: 'ch-1',
    to: 'choice-hey-arnold',
    conditionLabel: 'Opening Free Roam',
    pathSummary: 'Chapter 1 progression into "Hey Arnold!"',
    tone: 'spine',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'hey-arnold-to-spare',
    from: 'choice-hey-arnold',
    to: 'branch-hey-arnold-spare',
    conditionLabel: 'Spare Target',
    pathSummary: 'Choose non-lethal restraint in "Hey Arnold!"',
    tone: 'clean',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'hey-arnold-to-shoot',
    from: 'choice-hey-arnold',
    to: 'branch-hey-arnold-shoot',
    conditionLabel: 'Shoot Target',
    pathSummary: 'Execute target in "Hey Arnold!"',
    tone: 'chaos',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
  },
  {
    id: 'spare-to-save1',
    from: 'branch-hey-arnold-spare',
    to: 'save-ch1-ponr',
    conditionLabel: 'Rejoins Spine',
    pathSummary: 'Clean profile boost rejoins Chapter 1 spine',
    tone: 'clean',
    routeHint: 'rejoin-merge',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'shoot-to-save1',
    from: 'branch-hey-arnold-shoot',
    to: 'save-ch1-ponr',
    conditionLabel: 'Rejoins Spine',
    pathSummary: 'Chaos drift rejoins Chapter 1 spine',
    tone: 'chaos',
    routeHint: 'rejoin-merge',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
  },
  {
    id: 'save1-to-ch2',
    from: 'save-ch1-ponr',
    to: 'ch-2',
    conditionLabel: 'Complete "Tourist Trap"',
    pathSummary: 'Advance from Chapter 1 into Chapter 2',
    tone: 'spine',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },

  // Chapter 2
  {
    id: 'ch2-to-conflict',
    from: 'ch-2',
    to: 'choice-ch2-conflict',
    conditionLabel: 'Mid-Act Pivot',
    pathSummary: 'Enter Chapter 2 loyalty & de-escalation arc',
    tone: 'spine',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'ch2-to-defuse',
    from: 'choice-ch2-conflict',
    to: 'branch-ch2-defuse',
    conditionLabel: 'Defuse & Cooperate',
    pathSummary: 'Avoid firefights and support partner prep',
    tone: 'clean',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'ch2-to-firefight',
    from: 'choice-ch2-conflict',
    to: 'branch-ch2-firefight',
    conditionLabel: 'Escalate Firefight',
    pathSummary: 'Escalate Chapter 2 encounters into gunfights',
    tone: 'chaos',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
  },
  {
    id: 'defuse-to-save2',
    from: 'branch-ch2-defuse',
    to: 'save-ch2-checking-out',
    conditionLabel: 'Rejoins Spine',
    pathSummary: 'Defused branch rejoins before "Checking Out"',
    tone: 'clean',
    routeHint: 'rejoin-merge',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'firefight-to-save2',
    from: 'branch-ch2-firefight',
    to: 'save-ch2-checking-out',
    conditionLabel: 'Rejoins Spine',
    pathSummary: 'Firefight branch rejoins before "Checking Out"',
    tone: 'chaos',
    routeHint: 'rejoin-merge',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
  },
  {
    id: 'save2-to-ch3',
    from: 'save-ch2-checking-out',
    to: 'ch-3',
    conditionLabel: 'Move to Vice City',
    pathSummary: 'Complete "Checking Out" to enter Chapter 3',
    tone: 'spine',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },

  // Chapter 3
  {
    id: 'ch3-to-dp',
    from: 'ch-3',
    to: 'choice-dubious-prov',
    conditionLabel: 'Syndicate Deal',
    pathSummary: 'Reach "Dubious Provenance" in Chapter 3',
    tone: 'spine',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'dp-to-give',
    from: 'choice-dubious-prov',
    to: 'branch-dp-give',
    conditionLabel: 'Give Statue',
    pathSummary: 'Hand over the statue immediately',
    tone: 'clean',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'dp-to-reject',
    from: 'choice-dubious-prov',
    to: 'choice-dp-trust',
    conditionLabel: 'Reject Deal',
    pathSummary: 'Refuse the deal and face the follow-up trust check',
    tone: 'route-b',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'dp-reject-to-trust',
    from: 'choice-dp-trust',
    to: 'branch-dp-trust',
    conditionLabel: 'Trust',
    pathSummary: 'Trust partner after rejecting the statue deal',
    tone: 'route-a',
    filters: ['all', 'route-a'],
    profileAffinity: 'neutral',
  },
  {
    id: 'dp-reject-to-distrust',
    from: 'choice-dp-trust',
    to: 'branch-dp-distrust',
    conditionLabel: 'Don’t Trust',
    pathSummary: 'Distrust partner after rejecting the statue deal',
    tone: 'chaos',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
  },
  {
    id: 'dp-give-to-ch4',
    from: 'branch-dp-give',
    to: 'ch-4',
    conditionLabel: 'Rejoins Ch. 4',
    pathSummary: 'Handover branch rejoins main spine in Chapter 4',
    tone: 'clean',
    routeHint: 'rejoin-merge',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'dp-trust-to-ch4',
    from: 'branch-dp-trust',
    to: 'ch-4',
    conditionLabel: 'Rejoins Ch. 4',
    pathSummary: 'Trust branch rejoins main spine in Chapter 4',
    tone: 'route-a',
    routeHint: 'rejoin-merge',
    filters: ['all', 'route-a'],
    profileAffinity: 'neutral',
  },
  {
    id: 'dp-distrust-to-ch4',
    from: 'branch-dp-distrust',
    to: 'ch-4',
    conditionLabel: 'Rejoins Ch. 4',
    pathSummary: 'Distrust branch rejoins main spine in Chapter 4',
    tone: 'chaos',
    routeHint: 'rejoin-merge',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
  },

  // Chapter 4
  {
    id: 'ch4-to-heist',
    from: 'ch-4',
    to: 'choice-ch4-heist',
    conditionLabel: 'Pre-Finale Window',
    pathSummary: 'Manage final prep and BuckMe! savings in Chapter 4',
    tone: 'spine',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'ch4-to-clean-prep',
    from: 'choice-ch4-heist',
    to: 'branch-ch4-prep-clean',
    conditionLabel: 'Stealth + Bank Savings',
    pathSummary: 'Keep Clean profile and bank $500K+ / $2M+ in BuckMe!',
    tone: 'clean',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'ch4-to-chaos-prep',
    from: 'choice-ch4-heist',
    to: 'branch-ch4-prep-chaos',
    conditionLabel: 'Loud Spree / Unfunded',
    pathSummary: 'Enter finale with Chaos drift or low savings',
    tone: 'chaos',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
  },
  {
    id: 'clean-prep-to-save5',
    from: 'branch-ch4-prep-clean',
    to: 'save-ch5-start',
    conditionLabel: 'Rejoins Spine',
    pathSummary: 'Clean prep rejoins at Chapter 5 lock-in',
    tone: 'clean',
    routeHint: 'rejoin-merge',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'chaos-prep-to-save5',
    from: 'branch-ch4-prep-chaos',
    to: 'save-ch5-start',
    conditionLabel: 'Rejoins Spine',
    pathSummary: 'Chaos prep rejoins at Chapter 5 lock-in',
    tone: 'chaos',
    routeHint: 'rejoin-merge',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
  },
  {
    id: 'save5-to-ch5',
    from: 'save-ch5-start',
    to: 'ch-5',
    conditionLabel: 'Collect Envelope ("Sunset")',
    pathSummary: 'Advance into Chapter 5 finale',
    tone: 'spine',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },

  // Chapter 5
  {
    id: 'ch5-to-save-prefinale',
    from: 'ch-5',
    to: 'save-ch5-prefinale',
    conditionLabel: 'Before Finale Mission',
    pathSummary: 'Reach Pre-Finale checkpoint outside "Protective Custody"',
    tone: 'spine',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'save-prefinale-to-rel',
    from: 'save-ch5-prefinale',
    to: 'cond-relationship',
    conditionLabel: 'Evaluate Bond',
    pathSummary: 'Chapter 5 evaluates Relationship Level',
    tone: 'spine',
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'rel-to-route-a',
    from: 'cond-relationship',
    to: 'choice-ra-custody',
    conditionLabel: 'Relationship High',
    pathSummary: 'Relationship Level >= High threshold (Route A)',
    tone: 'route-a',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'rel-to-route-b',
    from: 'cond-relationship',
    to: 'choice-rb-custody',
    conditionLabel: 'Low / Break Up',
    pathSummary: 'Relationship Level Low / Break Up (Route B)',
    tone: 'route-b',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'ra-custody-to-bridge',
    from: 'choice-ra-custody',
    to: 'choice-ra-bridge',
    conditionLabel: 'Choose "Shoot"',
    pathSummary: 'Route A Protective Custody: Shoot immediately',
    tone: 'route-a',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'ra-custody-to-e8',
    from: 'choice-ra-custody',
    to: 'e8',
    conditionLabel: 'Wait 15–60s ("Take Deal")',
    pathSummary: 'Hold fire 15–60s on Route A for Hidden Deal (E8)',
    tone: 'chaos',
    filters: ['all', 'route-a'],
    profileAffinity: 'neutral',
  },
  {
    id: 'ra-bridge-to-e5',
    from: 'choice-ra-bridge',
    to: 'e5',
    conditionLabel: 'Choose "No Surrender"',
    pathSummary: 'Charge the bridge roadblock head-on',
    tone: 'chaos',
    filters: ['all', 'route-a'],
    profileAffinity: 'neutral',
  },
  {
    id: 'ra-bridge-to-profile',
    from: 'choice-ra-bridge',
    to: 'cond-ra-profile',
    conditionLabel: 'Choose "Swim"',
    pathSummary: 'Bail into the water to trigger Criminal Profile check',
    tone: 'route-a',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'ra-profile-to-timer',
    from: 'cond-ra-profile',
    to: 'cond-ra-timer',
    conditionLabel: 'Clean Profile',
    pathSummary: 'Professional Clean profile keeps water escape alive',
    tone: 'clean',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'ra-profile-to-e4',
    from: 'cond-ra-profile',
    to: 'e4',
    conditionLabel: 'Violent / Psycho / Irredeemable',
    pathSummary: 'Chaos profile locks Bad Ending A (E4)',
    tone: 'chaos',
    routeHint: 'long-right-converge',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
  },
  {
    id: 'ra-timer-to-savings',
    from: 'cond-ra-timer',
    to: 'cond-ra-savings',
    conditionLabel: 'Exit Before Timeout',
    pathSummary: 'Reach extraction point before timer expires',
    tone: 'clean',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'ra-timer-to-e4',
    from: 'cond-ra-timer',
    to: 'e4',
    conditionLabel: 'Timer Expires',
    pathSummary: 'Clean profile but extraction timer runs out',
    tone: 'chaos',
    routeHint: 'short-left-converge',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'ra-savings-to-e1',
    from: 'cond-ra-savings',
    to: 'e1',
    conditionLabel: 'Savings >= $2,000,000',
    pathSummary: '$2,000,000+ banked in BuckMe! Family Savings',
    tone: 'clean',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'ra-savings-to-e2',
    from: 'cond-ra-savings',
    to: 'e2',
    conditionLabel: 'Savings < $2,000,000',
    pathSummary: 'Under $2,000,000 banked in BuckMe! Family Savings',
    tone: 'route-a',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'rb-custody-to-profile',
    from: 'choice-rb-custody',
    to: 'cond-rb-profile',
    conditionLabel: 'Wait 15–60s ("Take Deal")',
    pathSummary: 'Hold fire 15–60s on Route B to check Criminal Profile',
    tone: 'route-b',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'rb-custody-to-standoff',
    from: 'choice-rb-custody',
    to: 'choice-rb-standoff',
    conditionLabel: 'Choose "Shoot"',
    pathSummary: 'Shoot immediately on Route B to trigger Final Standoff',
    tone: 'chaos',
    routeHint: 'long-right-converge',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'both',
  },
  {
    id: 'rb-profile-to-e3',
    from: 'cond-rb-profile',
    to: 'e3',
    conditionLabel: 'Clean Profile',
    pathSummary: 'Clean profile secures Tower immunity bargain (E3)',
    tone: 'clean',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'rb-profile-to-standoff',
    from: 'cond-rb-profile',
    to: 'choice-rb-standoff',
    conditionLabel: 'Violent / Psycho / Irredeemable',
    pathSummary: 'Chaos profile disqualifies E3 and forces Final Standoff',
    tone: 'chaos',
    routeHint: 'short-left-converge',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
  },
  {
    id: 'e3-to-bonus',
    from: 'e3',
    to: 'outcome-e3-bonus',
    conditionLabel: 'Savings >= $500,000',
    pathSummary: '$500,000+ BuckMe! Family Savings unlocks extended epilogue',
    tone: 'clean',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'rb-standoff-to-e6',
    from: 'choice-rb-standoff',
    to: 'e6',
    conditionLabel: 'Choose "Stay Down"',
    pathSummary: 'Hold position under cover during rooftop standoff',
    tone: 'chaos',
    routeHint: 'lower-left-sweep',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'both',
  },
  {
    id: 'rb-standoff-to-e7',
    from: 'choice-rb-standoff',
    to: 'e7',
    conditionLabel: 'Choose "Defend"',
    pathSummary: 'Stand up and return fire during rooftop standoff',
    tone: 'chaos',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'both',
  },
];

const NODE_MAP = new Map<string, StoryDagNode>(
  STORY_DAG_NODES.map((node) => [node.id, node])
);

export const COLLAPSIBLE_NODE_IDS: readonly string[] = STORY_DAG_NODES.filter(
  (node) => Boolean(node.isCollapsible)
).map((node) => node.id);

export function getDagNodeById(id: string): StoryDagNode | undefined {
  return NODE_MAP.get(id);
}

export function getChapterNodes(chapterId: StoryChapterId): StoryDagNode[] {
  return STORY_DAG_NODES.filter(
    (node) => node.chapterId === chapterId && node.nodeType !== 'chapter'
  );
}

export function getIncomingEdges(nodeId: string): StoryDagEdge[] {
  return STORY_DAG_EDGES.filter((edge) => edge.to === nodeId);
}

export function getOutgoingEdges(nodeId: string): StoryDagEdge[] {
  return STORY_DAG_EDGES.filter((edge) => edge.from === nodeId);
}

export function getConvergenceCount(nodeId: string): number {
  return getIncomingEdges(nodeId).length;
}

/**
 * Computes visible nodes and edges across all 5 chapters.
 * - All 5 chapter headers are always visible.
 * - Collapsing a chapter emits a direct spine bypass edge to its nextChapterId.
 * - Collapsing a rejoining choice fork inside an open chapter emits a direct bypass
 *   edge to its rejoinTargetId so downstream nodes remain connected.
 * - Converged Chapter 5 nodes (e4, choice-rb-standoff) stay visible as long as any
 *   expanded incoming parent reaches them.
 */
export function computeVisibleDag(expandedIds: ReadonlySet<string>): {
  visibleNodeIds: Set<string>;
  visibleEdges: StoryDagEdge[];
} {
  const visibleNodeIds = new Set<string>(CHAPTER_ORDER);
  const visibleEdges: StoryDagEdge[] = [];

  for (const chapterId of CHAPTER_ORDER) {
    const chapterNode = getDagNodeById(chapterId);
    if (!chapterNode) {
      continue;
    }

    if (!expandedIds.has(chapterId)) {
      if (chapterNode.nextChapterId) {
        visibleEdges.push({
          id: `bypass-${chapterId}-${chapterNode.nextChapterId}`,
          from: chapterId,
          to: chapterNode.nextChapterId,
          conditionLabel: '',
          pathSummary: `${chapterNode.stageLabel} collapsed — continues to next chapter`,
          tone: 'spine',
          isBypass: true,
          filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
          profileAffinity: 'neutral',
        });
      }
      continue;
    }

    const queue: string[] = [chapterId];
    const visitedInChapter = new Set<string>([chapterId]);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentNode = getDagNodeById(currentId);
      if (!currentNode) {
        continue;
      }

      if (
        currentId !== chapterId &&
        currentNode.isCollapsible &&
        !expandedIds.has(currentId)
      ) {
        if (currentNode.rejoinTargetId) {
          const target = getDagNodeById(currentNode.rejoinTargetId);
          visibleEdges.push({
            id: `bypass-${currentId}-${currentNode.rejoinTargetId}`,
            from: currentId,
            to: currentNode.rejoinTargetId,
            conditionLabel: 'Branches collapsed',
            pathSummary: `${currentNode.title} rejoins spine`,
            tone: 'spine',
            isBypass: true,
            filters: currentNode.filters,
            profileAffinity: 'neutral',
          });

          if (
            target &&
            target.chapterId === chapterId &&
            !visitedInChapter.has(target.id)
          ) {
            visitedInChapter.add(target.id);
            visibleNodeIds.add(target.id);
            queue.push(target.id);
          }
        }
        continue;
      }

      for (const edge of getOutgoingEdges(currentId)) {
        visibleEdges.push(edge);
        const target = getDagNodeById(edge.to);
        if (
          target &&
          target.chapterId === chapterId &&
          !visitedInChapter.has(target.id)
        ) {
          visitedInChapter.add(target.id);
          visibleNodeIds.add(target.id);
          queue.push(target.id);
        }
      }
    }
  }

  return { visibleNodeIds, visibleEdges };
}

/**
 * Returns the chapter ID plus same-chapter upstream collapsible IDs needed
 * so `targetNodeId` becomes visible without forcing unrelated chapters open.
 */
export function getAncestorExpandIds(targetNodeId: string): string[] {
  const target = getDagNodeById(targetNodeId);
  if (!target) {
    return [];
  }

  const expandIds = new Set<string>([target.chapterId]);
  const stack: string[] = [targetNodeId];
  const seen = new Set<string>([targetNodeId]);

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    for (const edge of getIncomingEdges(currentId)) {
      const parent = getDagNodeById(edge.from);
      if (!parent || parent.chapterId !== target.chapterId) {
        continue;
      }
      if (parent.isCollapsible) {
        expandIds.add(parent.id);
      }
      if (!seen.has(parent.id)) {
        seen.add(parent.id);
        stack.push(parent.id);
      }
    }
  }

  return Array.from(expandIds);
}

export function getChapterSummary(chapterId: StoryChapterId): {
  choicesCount: number;
  conditionsCount: number;
  savesCount: number;
  endingsCount: number;
} {
  const children = getChapterNodes(chapterId);
  return {
    choicesCount: children.filter((n) => n.nodeType === 'choice').length,
    conditionsCount: children.filter((n) => n.nodeType === 'condition').length,
    savesCount: children.filter((n) => n.nodeType === 'save').length,
    endingsCount: children.filter((n) => Boolean(n.endingId)).length,
  };
}

export function getCollapsedForkSummary(forkId: string): {
  hiddenNodesCount: number;
  hiddenEndingsCount: number;
} {
  const fork = getDagNodeById(forkId);
  if (!fork) {
    return { hiddenNodesCount: 0, hiddenEndingsCount: 0 };
  }

  const visited = new Set<string>();
  const queue: string[] = [forkId];
  let hiddenNodesCount = 0;
  const endingSet = new Set<EndingId>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of getOutgoingEdges(current)) {
      if (
        edge.to === fork.rejoinTargetId ||
        visited.has(edge.to)
      ) {
        continue;
      }
      const target = getDagNodeById(edge.to);
      if (!target || target.chapterId !== fork.chapterId) {
        continue;
      }
      visited.add(edge.to);
      hiddenNodesCount += 1;
      if (target.endingId) {
        endingSet.add(target.endingId);
      }
      queue.push(target.id);
    }
  }

  return {
    hiddenNodesCount,
    hiddenEndingsCount: endingSet.size,
  };
}

function matchesProfileAffinity(
  affinity: StoryDagNode['profileAffinity'],
  profileSub: ProfileSubFilter
): boolean {
  if (profileSub === 'both') {
    return true;
  }
  if (affinity === 'neutral' || affinity === 'both') {
    return true;
  }
  return affinity === profileSub;
}

export function doesNodeMatchFilter(
  node: StoryDagNode,
  filter: StoryPathFilter,
  profileSub: ProfileSubFilter = 'both'
): boolean {
  if (filter === 'all') {
    return true;
  }
  if (!node.filters.includes(filter)) {
    return false;
  }
  if (filter === 'clean-vs-chaos') {
    return matchesProfileAffinity(node.profileAffinity, profileSub);
  }
  return true;
}

export function doesEdgeMatchFilter(
  edge: StoryDagEdge,
  filter: StoryPathFilter,
  profileSub: ProfileSubFilter = 'both'
): boolean {
  if (filter === 'all') {
    return true;
  }
  if (!edge.filters.includes(filter)) {
    return false;
  }
  if (filter === 'clean-vs-chaos') {
    return matchesProfileAffinity(edge.profileAffinity, profileSub);
  }
  return true;
}

/**
 * Validates structural DAG invariants: zero orphan edges, zero orphan nodes,
 * strict acyclicity, and all 8 canonical endings reachable from Chapter 1.
 */
export function validateDagIntegrity(): {
  orphanEdges: string[];
  orphanNodes: string[];
  hasCycle: boolean;
  missingEndings: EndingId[];
} {
  const orphanEdges: string[] = [];
  for (const edge of STORY_DAG_EDGES) {
    if (!NODE_MAP.has(edge.from) || !NODE_MAP.has(edge.to)) {
      orphanEdges.push(edge.id);
    }
  }

  // BFS from ch-1 across all real edges
  const reachable = new Set<string>(['ch-1']);
  const queue: string[] = ['ch-1'];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of getOutgoingEdges(current)) {
      if (!reachable.has(edge.to)) {
        reachable.add(edge.to);
        queue.push(edge.to);
      }
    }
  }

  const orphanNodes = STORY_DAG_NODES.filter(
    (node) => !reachable.has(node.id)
  ).map((node) => node.id);

  // Kahn's topological sort to verify acyclicity
  const inDegree = new Map<string, number>();
  for (const node of STORY_DAG_NODES) {
    inDegree.set(node.id, 0);
  }
  for (const edge of STORY_DAG_EDGES) {
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
  }
  const topoQueue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      topoQueue.push(id);
    }
  }
  let visitedCount = 0;
  while (topoQueue.length > 0) {
    const id = topoQueue.shift()!;
    visitedCount += 1;
    for (const edge of getOutgoingEdges(id)) {
      const nextDeg = (inDegree.get(edge.to) ?? 0) - 1;
      inDegree.set(edge.to, nextDeg);
      if (nextDeg === 0) {
        topoQueue.push(edge.to);
      }
    }
  }
  const hasCycle = visitedCount !== STORY_DAG_NODES.length;

  const missingEndings = ENDINGS.filter(
    (ending) => !reachable.has(ending.id)
  ).map((ending) => ending.id);

  return {
    orphanEdges,
    orphanNodes,
    hasCycle,
    missingEndings,
  };
}
