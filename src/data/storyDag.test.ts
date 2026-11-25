import { describe, expect, it } from 'vitest';
import { ENDINGS } from './endings';
import {
  CHAPTER_ORDER,
  COLLAPSIBLE_NODE_IDS,
  STORY_DAG_EDGES,
  STORY_DAG_FILTERS,
  STORY_DAG_NODES,
  computeVisibleDag,
  doesEdgeMatchFilter,
  doesNodeMatchFilter,
  getAncestorExpandIds,
  getConvergenceCount,
  getDagNodeById,
  getIncomingEdges,
  validateDagIntegrity,
} from './storyDag';

describe('storyDag structural integrity', () => {
  it('has zero orphan edges, zero orphan nodes, no cycles, and reaches all 8 endings from Chapter 1', () => {
    const integrity = validateDagIntegrity();
    expect(integrity).toEqual({
      orphanEdges: [],
      orphanNodes: [],
      hasCycle: false,
      missingEndings: [],
    });
  });

  it('includes all 5 node types and requires splitVariable on every condition gate', () => {
    const nodeTypes = new Set(STORY_DAG_NODES.map((node) => node.nodeType));
    expect(nodeTypes).toEqual(
      new Set(['chapter', 'save', 'choice', 'condition', 'outcome'])
    );

    const conditionNodes = STORY_DAG_NODES.filter(
      (node) => node.nodeType === 'condition'
    );
    expect(conditionNodes.length).toBeGreaterThanOrEqual(4);
    for (const cond of conditionNodes) {
      expect(cond.splitVariable?.trim().length).toBeGreaterThan(0);
    }
  });

  it('renders each of the 8 endings e1-e8 strictly once alongside the E3+ bonus epilogue gate', () => {
    const endingNodes = STORY_DAG_NODES.filter((node) => Boolean(node.endingId));
    expect(endingNodes).toHaveLength(8);
    expect(endingNodes.map((n) => n.endingId).sort()).toEqual(
      ENDINGS.map((e) => e.id).sort()
    );

    const bonus = getDagNodeById('outcome-e3-bonus');
    expect(bonus?.nodeType).toBe('outcome');
    expect(bonus?.bonusForEndingId).toBe('e3');
    expect(bonus?.endingId).toBeUndefined();
  });

  it('models rejoining Chapter 1-4 forks and multi-path convergence in Chapter 5', () => {
    // Ch. 1 Hey Arnold! rejoins save-ch1-ponr
    expect(
      getIncomingEdges('save-ch1-ponr')
        .map((e) => e.from)
        .sort()
    ).toEqual(['branch-hey-arnold-shoot', 'branch-hey-arnold-spare']);

    // Ch. 3 Dubious Provenance (Give + Trust + Don't Trust) rejoins ch-4
    expect(
      getIncomingEdges('ch-4')
        .map((e) => e.from)
        .sort()
    ).toEqual(['branch-dp-distrust', 'branch-dp-give', 'branch-dp-trust']);

    // Ch. 5 Convergence
    expect(getConvergenceCount('e4')).toBe(2);
    expect(getConvergenceCount('choice-rb-standoff')).toBe(2);
  });

  it('exposes the 4 path filter pills', () => {
    expect(STORY_DAG_FILTERS.map((f) => f.label)).toEqual([
      'All Paths',
      'Route A: Strong Relationship',
      'Route B: Low / Break Up',
      'Clean vs. Chaos',
    ]);
  });
});

describe('storyDag expand, collapse, and bypass visibility', () => {
  it('shows all nodes and real edges with zero bypass edges when fully expanded', () => {
    const { visibleNodeIds, visibleEdges } = computeVisibleDag(
      new Set(COLLAPSIBLE_NODE_IDS)
    );
    expect(visibleNodeIds.size).toBe(STORY_DAG_NODES.length);
    expect(visibleEdges).toHaveLength(STORY_DAG_EDGES.length);
    expect(visibleEdges.some((e) => e.isBypass)).toBe(false);
  });

  it('shows only the 5 chapter headers and 4 clean chapter bypass edges when collapsed all', () => {
    const { visibleNodeIds, visibleEdges } = computeVisibleDag(new Set());
    expect(Array.from(visibleNodeIds)).toEqual([...CHAPTER_ORDER]);
    expect(visibleEdges.map((e) => `${e.from}->${e.to}`)).toEqual([
      'ch-1->ch-2',
      'ch-2->ch-3',
      'ch-3->ch-4',
      'ch-4->ch-5',
    ]);
    expect(visibleEdges.every((e) => e.isBypass)).toBe(true);
  });

  it('collapses a single chapter cleanly without breaking neighboring chapters', () => {
    const expanded = new Set(COLLAPSIBLE_NODE_IDS);
    expanded.delete('ch-3');

    const { visibleNodeIds, visibleEdges } = computeVisibleDag(expanded);
    expect(visibleNodeIds.has('ch-3')).toBe(true);
    expect(visibleNodeIds.has('choice-dubious-prov')).toBe(false);
    expect(visibleNodeIds.has('ch-4')).toBe(true);
    expect(visibleNodeIds.has('choice-ch4-heist')).toBe(true);
    expect(
      visibleEdges.some((e) => e.from === 'ch-3' && e.to === 'ch-4' && e.isBypass)
    ).toBe(true);
  });

  it('emits a rejoin bypass edge when a Chapter 3 choice fork collapses inside an open chapter', () => {
    const expanded = new Set(COLLAPSIBLE_NODE_IDS);
    expanded.delete('choice-dubious-prov');

    const { visibleNodeIds, visibleEdges } = computeVisibleDag(expanded);
    expect(visibleNodeIds.has('choice-dubious-prov')).toBe(true);
    expect(visibleNodeIds.has('branch-dp-give')).toBe(false);
    expect(visibleNodeIds.has('choice-dp-trust')).toBe(false);
    expect(
      visibleEdges.some(
        (e) =>
          e.from === 'choice-dubious-prov' && e.to === 'ch-4' && e.isBypass
      )
    ).toBe(true);
  });

  it('keeps converged ending e4 visible when only cond-ra-timer collapses', () => {
    const expanded = new Set(COLLAPSIBLE_NODE_IDS);
    expanded.delete('cond-ra-timer');

    const { visibleNodeIds, visibleEdges } = computeVisibleDag(expanded);
    expect(visibleNodeIds.has('e4')).toBe(true);
    expect(visibleNodeIds.has('cond-ra-savings')).toBe(false);
    expect(visibleNodeIds.has('e1')).toBe(false);
    expect(visibleEdges.some((e) => e.id === 'ra-profile-to-e4')).toBe(true);
    expect(visibleEdges.some((e) => e.id === 'ra-timer-to-e4')).toBe(false);
  });

  it('auto-expands Chapter 5 and upstream ancestors so any target ending becomes visible', () => {
    for (const ending of ENDINGS) {
      const expandIds = getAncestorExpandIds(ending.id);
      const { visibleNodeIds } = computeVisibleDag(new Set(expandIds));
      expect(visibleNodeIds.has(ending.id)).toBe(true);
      expect(visibleNodeIds.has('ch-1')).toBe(true);
      expect(visibleNodeIds.has('choice-hey-arnold')).toBe(false);
    }
  });
});

describe('storyDag path filters', () => {
  it('highlights Route A, Route B, and Clean vs. Chaos accurately', () => {
    const e1 = getDagNodeById('e1')!;
    const e3 = getDagNodeById('e3')!;
    const e4 = getDagNodeById('e4')!;
    const e8 = getDagNodeById('e8')!;
    const heyArnoldSpare = getDagNodeById('branch-hey-arnold-spare')!;
    const heyArnoldShoot = getDagNodeById('branch-hey-arnold-shoot')!;

    expect(doesNodeMatchFilter(e1, 'route-a')).toBe(true);
    expect(doesNodeMatchFilter(e1, 'route-b')).toBe(false);
    expect(doesNodeMatchFilter(e3, 'route-b')).toBe(true);
    expect(doesNodeMatchFilter(e8, 'clean-vs-chaos', 'both')).toBe(false);
    expect(doesNodeMatchFilter(heyArnoldSpare, 'clean-vs-chaos', 'clean')).toBe(
      true
    );
    expect(doesNodeMatchFilter(heyArnoldShoot, 'clean-vs-chaos', 'clean')).toBe(
      false
    );
    expect(doesNodeMatchFilter(e4, 'clean-vs-chaos', 'chaos')).toBe(true);

    const savingsE1Edge = STORY_DAG_EDGES.find(
      (e) => e.id === 'ra-savings-to-e1'
    )!;
    expect(savingsE1Edge.conditionLabel).toBe('Savings >= $2,000,000');
    expect(doesEdgeMatchFilter(savingsE1Edge, 'clean-vs-chaos', 'clean')).toBe(
      true
    );
    expect(doesEdgeMatchFilter(savingsE1Edge, 'clean-vs-chaos', 'chaos')).toBe(
      false
    );
  });
});
