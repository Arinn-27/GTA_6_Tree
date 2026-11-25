import { describe, expect, it } from 'vitest';
import { ENDINGS } from './endings';
import {
  FORK_NODE_IDS,
  MOBILE_NODE_ORDER,
  STORY_TREE_EDGES,
  STORY_TREE_FILTERS,
  STORY_TREE_NODES,
  computeVisibleTree,
  doesEdgeMatchFilter,
  doesNodeMatchFilter,
  getAncestorForkIds,
  getCollapsedDescendantSummary,
  getConvergenceCount,
  getIncomingEdges,
  getStoryNodeById,
} from './storyTree';

describe('storyTree DAG topology', () => {
  it('renders each of the 8 endings e1-e8 exactly once as a canonical destination node', () => {
    const endingNodes = STORY_TREE_NODES.filter(
      (node) => node.kind === 'ending'
    );
    expect(endingNodes).toHaveLength(8);
    expect(endingNodes.map((n) => n.endingId).sort()).toEqual(
      ENDINGS.map((e) => e.id).sort()
    );
    expect(new Set(endingNodes.map((n) => n.id)).size).toBe(8);
    expect(MOBILE_NODE_ORDER).toHaveLength(STORY_TREE_NODES.length);
    expect(new Set(MOBILE_NODE_ORDER).size).toBe(STORY_TREE_NODES.length);
  });

  it('tracks multi-path convergence on e4 and rb-standoff', () => {
    expect(getConvergenceCount('e4')).toBe(2);
    expect(
      getIncomingEdges('e4')
        .map((e) => e.from)
        .sort()
    ).toEqual(['ra-swim', 'ra-swim-clean']);

    expect(getConvergenceCount('rb-standoff')).toBe(2);
    expect(
      getIncomingEdges('rb-standoff')
        .map((e) => e.from)
        .sort()
    ).toEqual(['rb-deal', 'route-b']);

    for (const id of ['e1', 'e2', 'e3', 'e5', 'e6', 'e7', 'e8']) {
      expect(getConvergenceCount(id)).toBe(1);
    }
  });

  it('exposes the 4 required path filter pills', () => {
    expect(STORY_TREE_FILTERS.map((f) => f.label)).toEqual([
      'All Paths',
      'Route A: Strong Relationship',
      'Route B: Low / Break Up',
      'Clean vs. Chaos',
    ]);
  });
});

describe('storyTree expand/collapse & convergence visibility', () => {
  it('shows all 17 nodes and 18 edges when all forks are expanded', () => {
    const { visibleNodeIds, visibleEdgeIds } = computeVisibleTree(
      new Set(FORK_NODE_IDS)
    );
    expect(visibleNodeIds.size).toBe(STORY_TREE_NODES.length);
    expect(visibleEdgeIds.size).toBe(STORY_TREE_EDGES.length);
  });

  it('shows only the root node when all forks are collapsed', () => {
    const { visibleNodeIds, visibleEdgeIds } = computeVisibleTree(new Set());
    expect(Array.from(visibleNodeIds)).toEqual(['root']);
    expect(visibleEdgeIds.size).toBe(0);
  });

  it('keeps converged ending e4 visible when only one incoming branch is collapsed', () => {
    const expanded = new Set(FORK_NODE_IDS);
    expanded.delete('ra-swim-clean');

    const { visibleNodeIds, visibleEdgeIds } = computeVisibleTree(expanded);
    expect(visibleNodeIds.has('e4')).toBe(true);
    expect(visibleEdgeIds.has('ra-swim-to-e4')).toBe(true);
    expect(visibleEdgeIds.has('ra-clean-to-e4')).toBe(false);
    expect(visibleNodeIds.has('ra-savings')).toBe(false);
    expect(visibleNodeIds.has('e1')).toBe(false);
    expect(visibleNodeIds.has('e2')).toBe(false);

    // Collapsing ra-swim too hides e4 cleanly
    expanded.delete('ra-swim');
    const afterBothCollapsed = computeVisibleTree(expanded);
    expect(afterBothCollapsed.visibleNodeIds.has('e4')).toBe(false);
  });

  it('keeps rb-standoff visible via route-b even when rb-deal is collapsed', () => {
    const expanded = new Set(FORK_NODE_IDS);
    expanded.delete('rb-deal');

    const { visibleNodeIds, visibleEdgeIds } = computeVisibleTree(expanded);
    expect(visibleNodeIds.has('e3')).toBe(false);
    expect(visibleNodeIds.has('rb-standoff')).toBe(true);
    expect(visibleNodeIds.has('e6')).toBe(true);
    expect(visibleNodeIds.has('e7')).toBe(true);
    expect(visibleEdgeIds.has('route-b-to-standoff')).toBe(true);
    expect(visibleEdgeIds.has('rb-deal-to-standoff')).toBe(false);
  });

  it('auto-expands ancestor forks so any target ending becomes visible', () => {
    for (const ending of ENDINGS) {
      const ancestors = getAncestorForkIds(ending.id);
      const { visibleNodeIds } = computeVisibleTree(new Set(ancestors));
      expect(visibleNodeIds.has(ending.id)).toBe(true);
    }
  });

  it('computes accurate collapsed descendant summaries', () => {
    const routeASummary = getCollapsedDescendantSummary('route-a');
    expect(routeASummary.hiddenForkCount).toBe(4);
    expect(routeASummary.hiddenEndingIds.sort()).toEqual([
      'e1',
      'e2',
      'e4',
      'e5',
      'e8',
    ]);
  });
});

describe('storyTree path filters', () => {
  it('isolates Route A and Route B subtrees cleanly', () => {
    const e1 = getStoryNodeById('e1')!;
    const e3 = getStoryNodeById('e3')!;
    const e6 = getStoryNodeById('e6')!;

    expect(doesNodeMatchFilter(e1, 'route-a')).toBe(true);
    expect(doesNodeMatchFilter(e1, 'route-b')).toBe(false);

    expect(doesNodeMatchFilter(e3, 'route-b')).toBe(true);
    expect(doesNodeMatchFilter(e3, 'route-a')).toBe(false);

    expect(doesNodeMatchFilter(e6, 'route-b')).toBe(true);
  });

  it('dims profile-agnostic endings under Clean vs. Chaos and differentiates Clean vs. Chaos edges', () => {
    const e5 = getStoryNodeById('e5')!;
    const e8 = getStoryNodeById('e8')!;
    const e1 = getStoryNodeById('e1')!;
    const e4 = getStoryNodeById('e4')!;

    expect(doesNodeMatchFilter(e5, 'clean-vs-chaos', 'both')).toBe(false);
    expect(doesNodeMatchFilter(e8, 'clean-vs-chaos', 'both')).toBe(false);

    expect(doesNodeMatchFilter(e1, 'clean-vs-chaos', 'clean')).toBe(true);
    expect(doesNodeMatchFilter(e1, 'clean-vs-chaos', 'chaos')).toBe(false);
    expect(doesNodeMatchFilter(e4, 'clean-vs-chaos', 'chaos')).toBe(true);

    const chaosSwimEdge = STORY_TREE_EDGES.find(
      (edge) => edge.id === 'ra-swim-to-e4'
    )!;
    const cleanSwimEdge = STORY_TREE_EDGES.find(
      (edge) => edge.id === 'ra-swim-to-clean'
    )!;

    expect(doesEdgeMatchFilter(chaosSwimEdge, 'clean-vs-chaos', 'chaos')).toBe(
      true
    );
    expect(doesEdgeMatchFilter(chaosSwimEdge, 'clean-vs-chaos', 'clean')).toBe(
      false
    );
    expect(doesEdgeMatchFilter(cleanSwimEdge, 'clean-vs-chaos', 'clean')).toBe(
      true
    );
    expect(doesEdgeMatchFilter(cleanSwimEdge, 'clean-vs-chaos', 'chaos')).toBe(
      false
    );
  });
});
