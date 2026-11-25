import type {
  EndingId,
  ProfileSubFilter,
  StoryFilterOption,
  StoryPathFilter,
  StoryTreeEdge,
  StoryTreeNode,
} from '../types/tracker';
import { getEndingById } from './endings';

export const STORY_TREE_FILTERS: readonly StoryFilterOption[] = [
  {
    id: 'all',
    label: 'All Paths',
    description:
      'Full top-down decision tree from the Chapters 1–5 Relationship Meter through every finale choice and all 8 canonical endings.',
  },
  {
    id: 'route-a',
    label: 'Route A: Strong Relationship',
    description:
      'Highlights the Strong Relationship spine leading to Best (E1), Good A (E2), Bad A (E4), Bad B (E5), and Worst: Hidden Deal (E8).',
  },
  {
    id: 'route-b',
    label: 'Route B: Low / Break Up',
    description:
      'Highlights the Strained / Break Up spine leading to Good B (E3) and the Rooftop Standoff endings (E6 & E7).',
  },
  {
    id: 'clean-vs-chaos',
    label: 'Clean vs. Chaos',
    description:
      'Highlights where your Criminal Profile (Professional Clean vs. Violent / Psycho / Chaos) gates or overrides finale outcomes.',
  },
];

export const STORY_TREE_NODES: readonly StoryTreeNode[] = [
  {
    id: 'root',
    kind: 'root',
    title: 'Campaign Finale Gate',
    subtitle: 'Chapters 1–5 Relationship Meter',
    stageLabel: 'World State Gate',
    unlockCondition: 'Bond tier splits Route A vs. Route B',
    requirements: [
      'Evaluated automatically entering the Chapter 5 finale.',
      'Cooperative prep tasks, romantic loyalty, and partner support across Chapters 1–5 push your meter into Strong Relationship (Route A).',
      'Neglect, hostility, or strained choices push the meter into Low / Break Up (Route B).',
    ],
    spoilerContext:
      'Determines whether Jason and Lucia face the "Protective Custody" ambush together as partners (Route A) or fractured allies (Route B).',
    lane: 'root',
    desktopGrid: { colStart: 2, colSpan: 3, row: 1 },
    mobileDepth: 0,
    filters: ['all', 'route-a', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
  },
  {
    id: 'route-a',
    kind: 'route',
    title: 'Route A: Strong Relationship',
    subtitle: 'Protective Custody Confrontation',
    stageLabel: 'Route A · Decision 1',
    unlockCondition: 'Requires Strong Relationship (Ch. 1–5)',
    requirements: [
      'Unlocked with a high Relationship Meter entering the finale.',
      'At the confrontation prompt, choose "Shoot" immediately or wait 15–60 seconds without firing to trigger the hidden "Take Deal" prompt.',
    ],
    spoilerContext:
      'Méndez corners Jason and Lucia during "Protective Custody" and offers a backdoor truce if you hold your fire for 15–60 seconds.',
    lane: 'route-a',
    desktopGrid: { colStart: 1, colSpan: 3, row: 2 },
    mobileDepth: 1,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ['e1', 'e2', 'e4', 'e5', 'e8'],
  },
  {
    id: 'route-b',
    kind: 'route',
    title: 'Route B: Low / Break Up',
    subtitle: 'Protective Custody Confrontation',
    stageLabel: 'Route B · Decision 1',
    unlockCondition: 'Requires Low / Break Up Relationship',
    requirements: [
      'Unlocked when the Relationship Meter falls below the Route A threshold.',
      'Wait 15–60 seconds ("Take Deal") for a Criminal Profile check, or choose "Shoot" immediately to force the rooftop standoff.',
    ],
    spoilerContext:
      'With trust fractured before "Protective Custody", taking Méndez’s deal sets up a federal Tower sting while shooting triggers a rooftop ambush.',
    lane: 'route-b',
    desktopGrid: { colStart: 4, colSpan: 2, row: 2 },
    mobileDepth: 1,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ['e3', 'e6', 'e7'],
  },
  {
    id: 'ra-shoot',
    kind: 'choice',
    title: 'Protective Custody: "Shoot"',
    subtitle: 'Final Bridge Prompt',
    stageLabel: 'Route A · Decision 2',
    unlockCondition: 'Chose "Shoot" in Protective Custody',
    requirements: [
      'Opens the Leonida Keys bridge roadblock sequence.',
      'Choose "Swim" to bail into the water or "No Surrender" to ram straight through.',
    ],
    spoilerContext:
      'After gunning down Méndez’s crew, police barricade the Leonida Keys bridge and give one final split-second prompt.',
    lane: 'route-a',
    desktopGrid: { colStart: 1, colSpan: 2, row: 3 },
    mobileDepth: 2,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ['e1', 'e2', 'e4', 'e5'],
  },
  {
    id: 'e8',
    kind: 'ending',
    title: getEndingById('e8').name,
    subtitle: 'Wait 15–60s Hidden Outcome',
    stageLabel: 'Worst · E8',
    unlockCondition: 'Route A + Wait 15–60s ("Take Deal")',
    requirements: [...getEndingById('e8').unlockSteps],
    spoilerContext: getEndingById('e8').spoilerSummary,
    lane: 'chaos',
    desktopGrid: { colStart: 3, colSpan: 1, row: 3 },
    mobileDepth: 2,
    filters: ['all', 'route-a'],
    profileAffinity: 'neutral',
    endingId: 'e8',
    reachableEndings: ['e8'],
  },
  {
    id: 'rb-deal',
    kind: 'stat-gate',
    title: 'Route B: "Take Deal"',
    subtitle: 'Criminal Profile Gate',
    stageLabel: 'Route B · Stat Gate',
    unlockCondition: 'Waited 15–60s ("Take Deal") on Route B',
    requirements: [
      'Checks your Criminal Profile automatically.',
      'Clean (Professional) unlocks Good Ending B (E3).',
      'Violent / Psycho / Irredeemable disqualifies E3 and forces the Final Standoff.',
    ],
    spoilerContext:
      'During the federal Tower sting, a Clean record keeps the immunity bargain alive for Lucia; a Chaos record causes agents to open fire.',
    lane: 'route-b',
    desktopGrid: { colStart: 4, colSpan: 1, row: 3 },
    mobileDepth: 2,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ['e3', 'e6', 'e7'],
  },
  {
    id: 'e5',
    kind: 'ending',
    title: getEndingById('e5').name,
    subtitle: 'Roadblock Charge',
    stageLabel: 'Bad B · E5',
    unlockCondition: 'Route A + "Shoot" + "No Surrender"',
    requirements: [...getEndingById('e5').unlockSteps],
    spoilerContext: getEndingById('e5').spoilerSummary,
    lane: 'chaos',
    desktopGrid: { colStart: 1, colSpan: 1, row: 4 },
    mobileDepth: 3,
    filters: ['all', 'route-a'],
    profileAffinity: 'neutral',
    endingId: 'e5',
    reachableEndings: ['e5'],
  },
  {
    id: 'ra-swim',
    kind: 'stat-gate',
    title: 'Bridge Choice: "Swim"',
    subtitle: 'Criminal Profile Gate',
    stageLabel: 'Route A · Stat Gate',
    unlockCondition: 'Chose "Swim" at the Bridge',
    requirements: [
      'Evaluates your Criminal Profile immediately upon hitting the water.',
      'Clean (Professional) advances to the Final Escape Timer.',
      'Violent / Psycho / Chaos locks Bad Ending A (E4) even if you reach the Exit.',
    ],
    spoilerContext:
      'A shattered Chaos reputation brings overwhelming chopper and patrol boat fire onto the water, sealing E4.',
    lane: 'route-a',
    desktopGrid: { colStart: 2, colSpan: 1, row: 4 },
    mobileDepth: 3,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
    reachableEndings: ['e1', 'e2', 'e4'],
  },
  {
    id: 'e3',
    kind: 'ending',
    title: getEndingById('e3').name,
    subtitle: '$500K+ BuckMe! Bonus Epilogue',
    stageLabel: 'Good B · E3',
    unlockCondition: 'Route B + "Take Deal" + Clean Profile',
    requirements: [...getEndingById('e3').unlockSteps],
    spoilerContext: getEndingById('e3').spoilerSummary,
    note: getEndingById('e3').bonusEpilogueNote,
    lane: 'clean',
    desktopGrid: { colStart: 4, colSpan: 1, row: 4 },
    mobileDepth: 3,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    endingId: 'e3',
    reachableEndings: ['e3'],
  },
  {
    id: 'rb-standoff',
    kind: 'standoff',
    title: 'Route B: Final Standoff',
    subtitle: 'Rooftop Ambush Prompt',
    stageLabel: 'Standoff Gate',
    unlockCondition: 'Route B "Shoot" OR "Take Deal" + Chaos',
    requirements: [
      'Reached either directly via "Shoot" on Route B, or when a Chaos profile forces a standoff after "Take Deal".',
      'Choose "Stay Down" (E6) or "Defend" (E7).',
    ],
    spoilerContext:
      'Cornered on the rooftop, Jason pushes Lucia behind cover for one final life-or-death decision.',
    note: getEndingById('e6').launchWeekNote,
    lane: 'chaos',
    desktopGrid: { colStart: 5, colSpan: 1, row: 4 },
    mobileDepth: 3,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'both',
    reachableEndings: ['e6', 'e7'],
  },
  {
    id: 'ra-swim-clean',
    kind: 'choice',
    title: 'Clean Escape Window',
    subtitle: 'Final Escape Timer',
    stageLabel: 'Route A · Decision 3',
    unlockCondition: 'Route A + "Swim" + Clean Profile',
    requirements: [
      'Race to the shoreline extraction point before the countdown expires.',
      'Reaching "Exit" unlocks the BuckMe! Savings check (E1 vs. E2).',
      'Letting the timer "Expire" converges onto Bad Ending A (E4).',
    ],
    spoilerContext:
      'Jason and Lucia swim beneath patrol searchlights toward the getaway boat under a strict extraction timer.',
    lane: 'clean',
    desktopGrid: { colStart: 2, colSpan: 1, row: 5 },
    mobileDepth: 4,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    reachableEndings: ['e1', 'e2', 'e4'],
  },
  {
    id: 'e6',
    kind: 'ending',
    title: getEndingById('e6').name,
    subtitle: 'Launch-Week Verification Note',
    stageLabel: 'Bad C · E6',
    unlockCondition: 'Route B Standoff + "Stay Down"',
    requirements: [...getEndingById('e6').unlockSteps],
    spoilerContext: getEndingById('e6').spoilerSummary,
    note: getEndingById('e6').launchWeekNote,
    lane: 'chaos',
    desktopGrid: { colStart: 4, colSpan: 1, row: 5 },
    mobileDepth: 4,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'both',
    endingId: 'e6',
    reachableEndings: ['e6'],
  },
  {
    id: 'e7',
    kind: 'ending',
    title: getEndingById('e7').name,
    subtitle: 'Launch-Week Verification Note',
    stageLabel: 'Bad D · E7',
    unlockCondition: 'Route B Standoff + "Defend"',
    requirements: [...getEndingById('e7').unlockSteps],
    spoilerContext: getEndingById('e7').spoilerSummary,
    note: getEndingById('e7').launchWeekNote,
    lane: 'chaos',
    desktopGrid: { colStart: 5, colSpan: 1, row: 5 },
    mobileDepth: 4,
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'both',
    endingId: 'e7',
    reachableEndings: ['e7'],
  },
  {
    id: 'ra-savings',
    kind: 'stat-gate',
    title: 'BuckMe! Savings Gate',
    subtitle: '$2,000,000+ Threshold',
    stageLabel: 'Route A · Savings Check',
    unlockCondition: 'Clean Profile + Reached "Exit" in Time',
    requirements: [
      'Checks total Family Savings banked in BuckMe! before the finale.',
      '$2,000,000+ unlocks Best Ending (E1).',
      'Under $2,000,000 resolves to Good Ending A (E2).',
    ],
    spoilerContext:
      'Determines whether Abe has enough capital to launder an offshore reset or if the couple must stay on the run.',
    lane: 'clean',
    desktopGrid: { colStart: 1, colSpan: 2, row: 6 },
    mobileDepth: 5,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    reachableEndings: ['e1', 'e2'],
  },
  {
    id: 'e4',
    kind: 'ending',
    title: getEndingById('e4').name,
    subtitle: 'Timer Expire OR Chaos Override',
    stageLabel: 'Bad A · E4',
    unlockCondition: 'Swim + (Chaos Profile OR Clean "Expire")',
    requirements: [...getEndingById('e4').unlockSteps],
    spoilerContext: getEndingById('e4').spoilerSummary,
    lane: 'chaos',
    desktopGrid: { colStart: 3, colSpan: 1, row: 6 },
    mobileDepth: 4,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'both',
    endingId: 'e4',
    reachableEndings: ['e4'],
  },
  {
    id: 'e1',
    kind: 'ending',
    title: getEndingById('e1').name,
    subtitle: 'Full Offshore Fresh Start',
    stageLabel: 'Best · E1',
    unlockCondition: 'Clean + Exit + BuckMe! $2M+',
    requirements: [...getEndingById('e1').unlockSteps],
    spoilerContext: getEndingById('e1').spoilerSummary,
    lane: 'clean',
    desktopGrid: { colStart: 1, colSpan: 1, row: 7 },
    mobileDepth: 6,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    endingId: 'e1',
    reachableEndings: ['e1'],
  },
  {
    id: 'e2',
    kind: 'ending',
    title: getEndingById('e2').name,
    subtitle: 'Together on the Run',
    stageLabel: 'Good A · E2',
    unlockCondition: 'Clean + Exit + Under $2M',
    requirements: [...getEndingById('e2').unlockSteps],
    spoilerContext: getEndingById('e2').spoilerSummary,
    lane: 'clean',
    desktopGrid: { colStart: 2, colSpan: 1, row: 7 },
    mobileDepth: 6,
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
    endingId: 'e2',
    reachableEndings: ['e2'],
  },
];

export const STORY_TREE_EDGES: readonly StoryTreeEdge[] = [
  {
    id: 'root-to-route-a',
    from: 'root',
    to: 'route-a',
    conditionLabel: 'Strong Bond · Route A',
    pathSummary: 'Strong Relationship (Chapters 1–5)',
    tone: 'route-a',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'root-to-route-b',
    from: 'root',
    to: 'route-b',
    conditionLabel: 'Low / Break Up · Route B',
    pathSummary: 'Low / Break Up Relationship (Chapters 1–5)',
    tone: 'route-b',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'route-a-to-shoot',
    from: 'route-a',
    to: 'ra-shoot',
    conditionLabel: 'Choose "Shoot"',
    pathSummary: 'Protective Custody: Shoot immediately',
    tone: 'route-a',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'route-a-to-e8',
    from: 'route-a',
    to: 'e8',
    conditionLabel: 'Wait 15–60s ("Take Deal")',
    pathSummary: 'Wait 15–60 seconds without shooting on Route A',
    tone: 'chaos',
    filters: ['all', 'route-a'],
    profileAffinity: 'neutral',
  },
  {
    id: 'ra-shoot-to-e5',
    from: 'ra-shoot',
    to: 'e5',
    conditionLabel: 'Choose "No Surrender"',
    pathSummary: 'Bridge roadblock: Refuse to bail out',
    tone: 'chaos',
    filters: ['all', 'route-a'],
    profileAffinity: 'neutral',
  },
  {
    id: 'ra-shoot-to-swim',
    from: 'ra-shoot',
    to: 'ra-swim',
    conditionLabel: 'Choose "Swim"',
    pathSummary: 'Bridge roadblock: Bail out into the water',
    tone: 'route-a',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'ra-swim-to-clean',
    from: 'ra-swim',
    to: 'ra-swim-clean',
    conditionLabel: 'Clean Profile',
    pathSummary: 'Professional Criminal Profile keeps escape alive',
    tone: 'clean',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'ra-swim-to-e4',
    from: 'ra-swim',
    to: 'e4',
    conditionLabel: 'Violent / Chaos Profile',
    pathSummary: 'Violent / Psycho / Chaos profile locks Bad Ending A',
    tone: 'chaos',
    routeHint: 'long-right-converge',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
  },
  {
    id: 'ra-clean-to-savings',
    from: 'ra-swim-clean',
    to: 'ra-savings',
    conditionLabel: 'Reach "Exit"',
    pathSummary: 'Clear the extraction point before timer expires',
    tone: 'clean',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'ra-clean-to-e4',
    from: 'ra-swim-clean',
    to: 'e4',
    conditionLabel: 'Timer "Expire"',
    pathSummary: 'Clean profile but extraction timer runs out',
    tone: 'chaos',
    routeHint: 'short-left-converge',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'ra-savings-to-e1',
    from: 'ra-savings',
    to: 'e1',
    conditionLabel: 'BuckMe! $2M+',
    pathSummary: '$2,000,000+ banked in BuckMe! Family Savings',
    tone: 'clean',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'ra-savings-to-e2',
    from: 'ra-savings',
    to: 'e2',
    conditionLabel: 'BuckMe! < $2M',
    pathSummary: 'Under $2,000,000 in BuckMe! Family Savings',
    tone: 'route-a',
    filters: ['all', 'route-a', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'route-b-to-deal',
    from: 'route-b',
    to: 'rb-deal',
    conditionLabel: 'Wait 15–60s ("Take Deal")',
    pathSummary: 'Hold fire 15–60s in Protective Custody on Route B',
    tone: 'route-b',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'neutral',
  },
  {
    id: 'route-b-to-standoff',
    from: 'route-b',
    to: 'rb-standoff',
    conditionLabel: 'Choose "Shoot"',
    pathSummary: 'Shoot during Protective Custody on Route B',
    tone: 'chaos',
    routeHint: 'long-right-converge',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'both',
  },
  {
    id: 'rb-deal-to-e3',
    from: 'rb-deal',
    to: 'e3',
    conditionLabel: 'Clean Profile',
    pathSummary: 'Clean profile secures immunity bargain (+$500K bonus)',
    tone: 'clean',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'clean',
  },
  {
    id: 'rb-deal-to-standoff',
    from: 'rb-deal',
    to: 'rb-standoff',
    conditionLabel: 'Chaos Profile',
    pathSummary: 'Chaos profile disqualifies Good B and forces standoff',
    tone: 'chaos',
    routeHint: 'short-left-converge',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'chaos',
  },
  {
    id: 'rb-standoff-to-e6',
    from: 'rb-standoff',
    to: 'e6',
    conditionLabel: 'Choose "Stay Down"',
    pathSummary: 'Hold cover behind Jason during the rooftop standoff',
    tone: 'chaos',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'both',
  },
  {
    id: 'rb-standoff-to-e7',
    from: 'rb-standoff',
    to: 'e7',
    conditionLabel: 'Choose "Defend"',
    pathSummary: 'Stand up and fight back during the rooftop standoff',
    tone: 'chaos',
    filters: ['all', 'route-b', 'clean-vs-chaos'],
    profileAffinity: 'both',
  },
];

/**
 * Top-down DFS display order for mobile (< 768px) so Route A and Route B
 * read sequentially downward with each canonical ending appearing once.
 */
export const MOBILE_NODE_ORDER: readonly string[] = [
  'root',
  'route-a',
  'ra-shoot',
  'e8',
  'ra-swim',
  'e5',
  'ra-swim-clean',
  'ra-savings',
  'e1',
  'e2',
  'e4',
  'route-b',
  'rb-deal',
  'e3',
  'rb-standoff',
  'e6',
  'e7',
];

const NODE_MAP = new Map<string, StoryTreeNode>(
  STORY_TREE_NODES.map((node) => [node.id, node])
);

export const FORK_NODE_IDS: readonly string[] = STORY_TREE_NODES.filter(
  (node) => node.kind !== 'ending'
).map((node) => node.id);

export function getStoryNodeById(id: string): StoryTreeNode | undefined {
  return NODE_MAP.get(id);
}

export function getIncomingEdges(nodeId: string): StoryTreeEdge[] {
  return STORY_TREE_EDGES.filter((edge) => edge.to === nodeId);
}

export function getOutgoingEdges(nodeId: string): StoryTreeEdge[] {
  return STORY_TREE_EDGES.filter((edge) => edge.from === nodeId);
}

export function getConvergenceCount(nodeId: string): number {
  return getIncomingEdges(nodeId).length;
}

/**
 * Computes visible nodes and edges via BFS from the root gate.
 * A converged node stays visible as long as at least one incoming parent is
 * both visible and expanded.
 */
export function computeVisibleTree(expandedIds: ReadonlySet<string>): {
  visibleNodeIds: Set<string>;
  visibleEdgeIds: Set<string>;
} {
  const visibleNodeIds = new Set<string>(['root']);
  const visibleEdgeIds = new Set<string>();
  const queue: string[] = ['root'];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (!expandedIds.has(currentId)) {
      continue;
    }

    for (const edge of getOutgoingEdges(currentId)) {
      visibleEdgeIds.add(edge.id);
      if (!visibleNodeIds.has(edge.to)) {
        visibleNodeIds.add(edge.to);
        queue.push(edge.to);
      }
    }
  }

  return { visibleNodeIds, visibleEdgeIds };
}

/**
 * Collects all upstream fork IDs that must be expanded so `targetNodeId` is visible.
 */
export function getAncestorForkIds(targetNodeId: string): string[] {
  const ancestors = new Set<string>();
  const stack: string[] = [targetNodeId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    for (const edge of getIncomingEdges(currentId)) {
      if (!ancestors.has(edge.from)) {
        ancestors.add(edge.from);
        stack.push(edge.from);
      }
    }
  }

  return Array.from(ancestors);
}

/**
 * Summarizes downstream forks and canonical endings hidden when `forkNodeId` is collapsed.
 */
export function getCollapsedDescendantSummary(forkNodeId: string): {
  hiddenForkCount: number;
  hiddenEndingIds: EndingId[];
} {
  const visited = new Set<string>();
  const queue: string[] = [forkNodeId];
  let hiddenForkCount = 0;
  const endingSet = new Set<EndingId>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of getOutgoingEdges(current)) {
      if (visited.has(edge.to)) {
        continue;
      }
      visited.add(edge.to);
      const targetNode = getStoryNodeById(edge.to);
      if (!targetNode) {
        continue;
      }
      if (targetNode.kind === 'ending' && targetNode.endingId) {
        endingSet.add(targetNode.endingId);
      } else {
        hiddenForkCount += 1;
        queue.push(targetNode.id);
      }
    }
  }

  return {
    hiddenForkCount,
    hiddenEndingIds: Array.from(endingSet),
  };
}

function matchesProfileAffinity(
  affinity: StoryTreeNode['profileAffinity'],
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
  node: StoryTreeNode,
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
  edge: StoryTreeEdge,
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
