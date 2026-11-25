export type ChapterNumber = 1 | 2 | 3 | 4 | 5;

export type SaveSlotGroup =
  | 'chapter-1'
  | 'chapter-2'
  | 'chapters-3-5'
  | 'active-workspace';

export type SlotBadgeKind =
  | 'Spine'
  | 'Point of No Return'
  | 'Clean Fork'
  | 'Chaos Fork'
  | 'Rolling FIFO'
  | 'Safety Lock';

export type EndingId = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7' | 'e8';

export type EndingTier = 'best' | 'good' | 'bad' | 'worst';

export interface SaveSlotGroupMeta {
  id: SaveSlotGroup;
  title: string;
  subtitle: string;
  chapters: ChapterNumber[];
}

export interface SaveSlotItem {
  id: string;
  slotLabel: string;
  slotNumbers: number[];
  group: SaveSlotGroup;
  chapter: ChapterNumber | 'all';
  chapterLabel: string;
  title: string;
  badge: SlotBadgeKind;
  whenToSave: string;
  whyItMatters: string;
  spoilerContext: string;
  recommendedEndings: EndingId[];
}

export type BranchPathFilter =
  | 'all'
  | 'clean-run'
  | 'chaos-run'
  | 'rolling-backups';

export type BranchLane = 'spine' | 'clean' | 'chaos' | 'workspace' | 'lock';

export interface BranchNode {
  id: string;
  slotId: string;
  label: string;
  shortTitle: string;
  subtitle: string;
  chapter: ChapterNumber | 'all';
  lane: BranchLane;
  gridCol: number;
  gridRow: number;
  gridColSpan?: number;
  paths: BranchPathFilter[];
  mobileBranchTag?: string;
  endingIds: EndingId[];
}

export type EdgeRouteStyle =
  | 'straight-h'
  | 'row1-to-row2-elbow'
  | 'chaos-arc'
  | 'workspace-dash'
  | 'lock-curve';

export interface BranchEdge {
  id: string;
  from: string;
  to: string;
  kind: BranchLane;
  routeStyle: EdgeRouteStyle;
  label?: string;
  paths: BranchPathFilter[];
  dashed?: boolean;
}

export type RelationshipRoute = 'route-a' | 'route-b';

export type CriminalProfile = 'clean' | 'chaos';

export type SavingsTier = 'under-500k' | '500k-to-2m' | '2m-plus';

export type Step2Choice = 'shoot' | 'take-deal';

export type Step3Choice = 'swim' | 'no-surrender' | 'stay-down' | 'defend';

export type Step4Choice = 'exit' | 'expire';

export interface EndingSimulationInput {
  route: RelationshipRoute;
  profile: CriminalProfile;
  savings: SavingsTier;
  step2: Step2Choice;
  step3?: Step3Choice;
  step4?: Step4Choice;
}

export interface EndingDefinition {
  id: EndingId;
  code: string;
  name: string;
  tierLabel: string;
  tier: EndingTier;
  route: RelationshipRoute;
  recipeTags: string[];
  recommendedSlotId: string;
  spoilerSummary: string;
  bonusEpilogueNote?: string;
  launchWeekNote?: string;
  presetInput: EndingSimulationInput;
}

export interface EndingResolution {
  ending: EndingDefinition | null;
  isComplete: boolean;
  nextRequiredStep?: 'step3' | 'step4';
  availableStep3Choices: Step3Choice[];
  requiresStep4: boolean;
  bonusEpilogueNote?: string;
  verificationNote?: string;
  warningNote?: string;
}

export interface PersistedAppState {
  version: 1;
  checkedSlots: string[];
  completedEndings: string[];
  currentChapter: 1 | 2 | 3 | 4 | 5;
}

export type AppTab = 'save-tracker' | 'branch-tree' | 'ending-nav';
