export type EndingId = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7' | 'e8';

export type EndingTier = 'best' | 'good' | 'bad' | 'worst';

export type StoryPathFilter =
  | 'all'
  | 'route-a'
  | 'route-b'
  | 'clean-vs-chaos';

export type ProfileSubFilter = 'both' | 'clean' | 'chaos';

export type StoryDagNodeType =
  | 'chapter'
  | 'save'
  | 'choice'
  | 'condition'
  | 'outcome';

export type StoryChapterId = 'ch-1' | 'ch-2' | 'ch-3' | 'ch-4' | 'ch-5';

export type StoryLane = 'root' | 'route-a' | 'route-b' | 'clean' | 'chaos';

export type StoryProfileAffinity = 'neutral' | 'clean' | 'chaos' | 'both';

export type StoryDagEdgeTone =
  | 'spine'
  | 'route-a'
  | 'route-b'
  | 'clean'
  | 'chaos';

export interface StoryDagNode {
  id: string;
  chapterId: StoryChapterId;
  nodeType: StoryDagNodeType;
  chapterNumber?: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  stageLabel: string;
  splitVariable?: string;
  unlockCondition: string;
  impactTags?: string[];
  requirements: string[];
  spoilerContext: string;
  note?: string;
  lane: StoryLane;
  isCollapsible?: boolean;
  rejoinTargetId?: string;
  nextChapterId?: StoryChapterId;
  desktopGrid: {
    colStart: number;
    colSpan: number;
    row: number;
  };
  mobileDepth: number;
  filters: StoryPathFilter[];
  profileAffinity: StoryProfileAffinity;
  endingId?: EndingId;
  bonusForEndingId?: EndingId;
  reachableEndings: EndingId[];
}

export interface StoryDagEdge {
  id: string;
  from: string;
  to: string;
  conditionLabel: string;
  pathSummary: string;
  tone: StoryDagEdgeTone;
  routeHint?:
    | 'default'
    | 'long-right-converge'
    | 'short-left-converge'
    | 'lower-left-sweep'
    | 'rejoin-merge';
  isBypass?: boolean;
  filters: StoryPathFilter[];
  profileAffinity: StoryProfileAffinity;
}

export interface StoryDagFilterOption {
  id: StoryPathFilter;
  label: string;
  description: string;
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
  unlockSteps: string[];
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
  completedEndings: string[];
}

export type AppTab = 'story-tree' | 'ending-nav';
