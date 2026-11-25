import { describe, expect, it } from 'vitest';
import {
  BRANCH_EDGES,
  BRANCH_FILTERS,
  BRANCH_NODES,
  ENDING_CLUSTERS,
  SAFETY_RAIL_NODES,
} from './branchGraph';
import { ANCHOR_SLOT_IDS } from './saveSlots';

describe('branchGraph vertical Git-graph topology', () => {
  it('marks Slots 1, 4, 6, 8, and 9 as the exact Anchor Points', () => {
    const graphAnchors = BRANCH_NODES.filter((node) => node.isAnchor).map(
      (node) => node.id
    );
    expect(graphAnchors).toEqual([
      'slot-1',
      'slot-4',
      'slot-6',
      'slot-8',
      'slot-9',
    ]);
    expect(Array.from(ANCHOR_SLOT_IDS)).toEqual(graphAnchors);
  });

  it('orders Main Spine Slots 1-9 vertically in Column 1 and places Slot 10 in Column 2', () => {
    const col1Nodes = BRANCH_NODES.filter((node) => node.gridCol === 1);
    expect(col1Nodes.map((n) => n.id)).toEqual([
      'slot-1',
      'slot-2',
      'slot-3',
      'slot-4',
      'slot-5',
      'slot-6',
      'slot-7',
      'slot-8',
      'slot-9',
    ]);
    expect(col1Nodes.map((n) => n.gridRow)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    const col2Nodes = BRANCH_NODES.filter((node) => node.gridCol === 2);
    expect(col2Nodes.map((n) => n.id)).toEqual(['slot-10']);
    expect(col2Nodes[0]?.gridRow).toBe(9);
  });

  it('keeps Slots 11-14 and Slot 15 in the Active Safety Rail with zero tree wiring', () => {
    expect(SAFETY_RAIL_NODES.map((n) => n.slotId)).toEqual([
      'slots-11-14',
      'slot-15',
    ]);

    const treeNodeIds = new Set(BRANCH_NODES.map((n) => n.id));
    expect(treeNodeIds.has('slots-11-14')).toBe(false);
    expect(treeNodeIds.has('slot-15')).toBe(false);

    for (const edge of BRANCH_EDGES) {
      expect(edge.from).not.toBe('slots-11-14');
      expect(edge.from).not.toBe('slot-15');
      expect(edge.to).not.toBe('slots-11-14');
      expect(edge.to).not.toBe('slot-15');
    }
  });

  it('wires Clean Run (8->9->Route A) and Chaos Run (6 & 8->10->Route B) across all 8 endings', () => {
    const edgePairs = BRANCH_EDGES.map((e) => `${e.from}->${e.to}:${e.kind}`);
    expect(edgePairs).toContain('slot-8->slot-9:clean');
    expect(edgePairs).toContain('slot-9->route-a-endings:clean');
    expect(edgePairs).toContain('slot-6->slot-10:chaos');
    expect(edgePairs).toContain('slot-8->slot-10:chaos');
    expect(edgePairs).toContain('slot-10->route-b-endings:chaos');

    const routeA = ENDING_CLUSTERS.find((c) => c.id === 'route-a-endings');
    const routeB = ENDING_CLUSTERS.find((c) => c.id === 'route-b-endings');
    expect(routeA?.endingIds).toEqual(['e1', 'e2', 'e4', 'e5', 'e8']);
    expect(routeB?.endingIds).toEqual(['e3', 'e6', 'e7']);
  });

  it('exposes all 4 required filter pills', () => {
    expect(BRANCH_FILTERS.map((f) => f.label)).toEqual([
      'All Branches',
      'Clean Run',
      'Chaos Run',
      'Testing Safety Loop',
    ]);
  });
});
