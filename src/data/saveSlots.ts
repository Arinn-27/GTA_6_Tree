import type { SaveSlotGroupMeta, SaveSlotItem } from '../types/tracker';

export const SAVE_SLOT_GROUPS: readonly SaveSlotGroupMeta[] = [
  {
    id: 'chapter-1',
    title: 'Chapter 1',
    subtitle: 'Opening Free Roam & Early Profile Foundation (Slots 1–3)',
    chapters: [1],
  },
  {
    id: 'chapter-2',
    title: 'Chapter 2',
    subtitle: 'Mid-Act Loyalty Pivots & Regional Transition (Slots 4–5)',
    chapters: [2],
  },
  {
    id: 'chapters-3-5',
    title: 'Chapters 3 to 5',
    subtitle: 'Mid-Game Anchor, Points of No Return & Clean/Chaos Splits (Slots 6–10)',
    chapters: [3, 4, 5],
  },
  {
    id: 'active-workspace',
    title: 'Active Workspace',
    subtitle: 'Rolling Mission Backups & Main Run Safety Lock (Slots 11–15)',
    chapters: [1, 2, 3, 4, 5],
  },
];

export const SAVE_SLOTS: readonly SaveSlotItem[] = [
  {
    id: 'slot-1',
    slotLabel: 'Slot 1',
    slotNumbers: [1],
    group: 'chapter-1',
    chapter: 1,
    chapterLabel: 'Chapter 1',
    title: 'Prologue Complete / Free Roam Baseline',
    badge: 'Spine',
    whenToSave:
      'Create this permanent anchor the moment manual saving unlocks in free roam after finishing the opening prologue.',
    whyItMatters:
      'Because there is no mission replay selector, this lets you start a fresh playthrough cleanly without repeating the unskippable opening tutorial.',
    spoilerContext:
      'Saves immediately after reaching free roam at Jason’s marina safehouse once opening prologue restrictions lift.',
    recommendedEndings: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
  },
  {
    id: 'slot-2',
    slotLabel: 'Slot 2',
    slotNumbers: [2],
    group: 'chapter-1',
    chapter: 1,
    chapterLabel: 'Chapter 1',
    title: 'Early Profile & Partner Prep Anchor',
    badge: 'Spine',
    whenToSave:
      'Save before completing optional early partner prep tasks and your first major spare-or-kill encounter.',
    whyItMatters:
      'Preserves an early window to build a Professional (Clean) profile and positive Relationship standing from the ground up.',
    spoilerContext:
      'Covers early house preparation errands before Lucia arrives and the first major Criminal Profile pivot in "Hey Arnold!".',
    recommendedEndings: ['e1', 'e2', 'e3'],
  },
  {
    id: 'slot-3',
    slotLabel: 'Slot 3',
    slotNumbers: [3],
    group: 'chapter-1',
    chapter: 1,
    chapterLabel: 'Chapter 1',
    title: 'Chapter 1 Point of No Return',
    badge: 'Point of No Return',
    whenToSave:
      'Save right before launching the final Chapter 1 transition mission while local free-roam errands are still open.',
    whyItMatters:
      'Crossing this threshold moves the story out of the opening region and locks early local side activities.',
    spoilerContext:
      'Triggered upon accepting Mattia’s job and starting "Tourist Trap", which ends Chapter 1.',
    recommendedEndings: ['e1', 'e2', 'e3'],
  },
  {
    id: 'slot-4',
    slotLabel: 'Slot 4',
    slotNumbers: [4],
    group: 'chapter-2',
    chapter: 2,
    chapterLabel: 'Chapter 2',
    title: 'Chapter 2 Mid-Act Relationship & De-escalation Fork',
    badge: 'Spine',
    whenToSave:
      'Save midway through Chapter 2 before multi-option missions where you can defuse conflicts or escalate into firefights.',
    whyItMatters:
      'Protects your mid-act Relationship trajectory and keeps your Clean profile intact if an encounter spirals out of control.',
    spoilerContext:
      'Bookmarks the window before "Girls’ Trip" and "Afternoon Delight" defuse-versus-firefight choices.',
    recommendedEndings: ['e1', 'e2', 'e3'],
  },
  {
    id: 'slot-5',
    slotLabel: 'Slot 5',
    slotNumbers: [5],
    group: 'chapter-2',
    chapter: 2,
    chapterLabel: 'Chapter 2',
    title: 'Chapter 2 Point of No Return',
    badge: 'Point of No Return',
    whenToSave:
      'Save once local Chapter 2 debts and regional jobs are cleared, just before initiating the chapter finale.',
    whyItMatters:
      'Completing the Chapter 2 finale shifts your primary base of operations and temporarily closes earlier rural tasks.',
    spoilerContext:
      'Creates a safeguard before starting "Checking Out" and accepting the move toward Vice City.',
    recommendedEndings: ['e1', 'e2', 'e3'],
  },
  {
    id: 'slot-6',
    slotLabel: 'Slot 6',
    slotNumbers: [6],
    group: 'chapters-3-5',
    chapter: 3,
    chapterLabel: 'Chapter 3',
    title: 'Chapter 3 Mid-Game Profile Anchor (Chaos Fork #1)',
    badge: 'Chaos Fork',
    whenToSave:
      'Save midway through Chapter 3 before major heist preparations and spare-or-eliminate syndicate decisions.',
    whyItMatters:
      'Serves as your earliest safe fork point (6 → 10) to branch off an isolated Chaos or low-relationship run without tainting your main Clean spine.',
    spoilerContext:
      'Sits ahead of major Vice City heist setup and "The Cartel Heist" progression where targets like Felipe influence your profile.',
    recommendedEndings: ['e4', 'e6', 'e7'],
  },
  {
    id: 'slot-7',
    slotLabel: 'Slot 7',
    slotNumbers: [7],
    group: 'chapters-3-5',
    chapter: 4,
    chapterLabel: 'Chapter 4',
    title: 'Chapter 4 Point of No Return',
    badge: 'Point of No Return',
    whenToSave:
      'Save during the late Chapter 4 free-roam breather as soon as you are prompted to pick up a waiting message.',
    whyItMatters:
      'Accepting the prompt triggers an extended multi-mission lock-in that carries straight into Chapter 5 without normal free-roam breaks.',
    spoilerContext:
      'Save during "Tie Up Loose Ends" before collecting the Y Hotel front-desk envelope that initiates "Sunset" and Chapter 5.',
    recommendedEndings: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
  },
  {
    id: 'slot-8',
    slotLabel: 'Slot 8',
    slotNumbers: [8],
    group: 'chapters-3-5',
    chapter: 5,
    chapterLabel: 'Chapter 5',
    title: 'Chapter 5 Pre-Finale Master Split',
    badge: 'Point of No Return',
    whenToSave:
      'Save in free roam immediately before starting the pivotal late-Chapter 5 confrontation that splits the finale.',
    whyItMatters:
      'Your single most important master save: branches into the Clean Run (8 → 9) and Chaos Run (8 → 10) and unlocks finale replays without replaying 60+ hours.',
    spoilerContext:
      'Placed right before "Protective Custody", where Relationship Route, Criminal Profile, Family Savings, and the Méndez Shoot-or-Deal choice branch.',
    recommendedEndings: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
  },
  {
    id: 'slot-9',
    slotLabel: 'Slot 9',
    slotNumbers: [9],
    group: 'chapters-3-5',
    chapter: 5,
    chapterLabel: 'Chapter 5',
    title: 'Clean Run Finale Lock (8 → 9)',
    badge: 'Clean Fork',
    whenToSave:
      'Fork from Slot 8 once you have verified a Clean (Professional) profile, target Relationship Route, and desired Family Savings.',
    whyItMatters:
      'Lets you cleanly replay Step 2–4 finale choices for the Best ($2M+) and Good endings without risking accidental profile drift.',
    spoilerContext:
      'Optimized for e1 (Route A + $2M+ + Shoot + Swim + Exit), e2 (Route A under $2M), and e3 (Route B + Clean + Take Deal, with $500K+ bonus epilogue).',
    recommendedEndings: ['e1', 'e2', 'e3', 'e5', 'e8'],
  },
  {
    id: 'slot-10',
    slotLabel: 'Slot 10',
    slotNumbers: [10],
    group: 'chapters-3-5',
    chapter: 5,
    chapterLabel: 'Chapter 5',
    title: 'Chaos Run Finale Branch (6 or 8 → 10)',
    badge: 'Chaos Fork',
    whenToSave:
      'Fork from Slot 6 or Slot 8 into Slot 10 when you are ready to intentionally lower your profile or test high-chaos finale paths.',
    whyItMatters:
      'Quarantines Psycho/Shattered profile shifts and Route B standoff experiments away from your Clean Run save.',
    spoilerContext:
      'Dedicated branch for e4 (Chaos profile or Expire on Route A Swim), e6 (Route B Stay Down), and e7 (Route B Defend).',
    recommendedEndings: ['e4', 'e6', 'e7'],
  },
  {
    id: 'slots-11-14',
    slotLabel: 'Slots 11–14',
    slotNumbers: [11, 12, 13, 14],
    group: 'active-workspace',
    chapter: 'all',
    chapterLabel: 'All Chapters',
    title: 'Rolling Mission Backups (4-Slot FIFO Ring)',
    badge: 'Rolling FIFO',
    whenToSave:
      'Rotate sequentially (11 → 12 → 13 → 14 → 11) before every story mission, risky heist prep, or free-roam spree.',
    whyItMatters:
      'Gives you an instant 4-step undo ring if a mission gunfight hurts your Relationship or triggers a Criminal Profile crack warning.',
    spoilerContext:
      'Crucial for avoiding a permanent "Shattered" Criminal Profile fracture caused by repeated civilian casualties or police rampages.',
    recommendedEndings: ['e1', 'e2', 'e3'],
  },
  {
    id: 'slot-15',
    slotLabel: 'Slot 15',
    slotNumbers: [15],
    group: 'active-workspace',
    chapter: 'all',
    chapterLabel: 'All Chapters',
    title: 'Main Run Lock (Single-Autosave Shield)',
    badge: 'Safety Lock',
    whenToSave:
      'Always save your active main campaign to Slot 15 BEFORE loading any older manual slot (Slots 1–10) to replay an ending.',
    whyItMatters:
      'GTA 6 only keeps 1 autosave slot. Loading an old save causes the autosave to overwrite itself with that older timeline.',
    spoilerContext:
      'Protects your post-game free-roam world state and bank balance while you reload Slots 8, 9, or 10 to unlock all 8 endings.',
    recommendedEndings: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
  },
];

export const VALID_SLOT_IDS: ReadonlySet<string> = new Set(
  SAVE_SLOTS.map((slot) => slot.id)
);

export function getSlotById(id: string): SaveSlotItem | undefined {
  return SAVE_SLOTS.find((slot) => slot.id === id);
}
