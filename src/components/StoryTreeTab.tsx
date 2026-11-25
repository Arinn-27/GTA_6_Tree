import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Compass,
  ChevronsDownUp,
  ChevronsUpDown,
  GitBranch,
  GitMerge,
  Sparkles,
  X,
} from 'lucide-react';
import { getEndingById } from '../data/endings';
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
  getOutgoingEdges,
  getStoryNodeById,
} from '../data/storyTree';
import type {
  EndingId,
  EndingTier,
  ProfileSubFilter,
  StoryPathFilter,
  StoryTreeEdge,
  StoryTreeNode,
} from '../types/tracker';
import { SpoilerText } from './SpoilerText';

interface StoryTreeTabProps {
  completedEndings: string[];
  onToggleEnding: (endingId: string) => void;
  focusedNodeId: string | null;
  onClearFocusedNode: () => void;
  onInspectEnding: (endingId: EndingId) => void;
}

interface MeasuredEdge {
  edge: StoryTreeEdge;
  d: string;
  labelX: number;
  labelY: number;
  stroke: string;
  markerEnd: string;
  dimmed: boolean;
}

function tierBadgeClass(tier: EndingTier): string {
  switch (tier) {
    case 'best':
      return 'border-emerald-400/45 bg-emerald-500/15 text-emerald-200';
    case 'good':
      return 'border-cyan-400/45 bg-cyan-500/15 text-cyan-200';
    case 'bad':
      return 'border-rose-400/45 bg-rose-500/15 text-rose-200';
    case 'worst':
      return 'border-red-400/55 bg-red-950/60 text-red-200';
  }
}

function tierTopBarClass(tier: EndingTier): string {
  switch (tier) {
    case 'best':
      return 'from-emerald-400 via-teal-300 to-cyan-400';
    case 'good':
      return 'from-cyan-400 to-sky-300';
    case 'bad':
      return 'from-amber-400 to-rose-500';
    case 'worst':
      return 'from-rose-500 to-red-600';
  }
}

function getEdgeStyle(tone: StoryTreeEdge['tone']): {
  stroke: string;
  markerEnd: string;
  pillClass: string;
} {
  switch (tone) {
    case 'clean':
      return {
        stroke: '#34d399',
        markerEnd: 'url(#story-arrow-clean)',
        pillClass: 'border-emerald-400/35 bg-[#09161a]/95 text-emerald-200',
      };
    case 'chaos':
      return {
        stroke: 'url(#story-chaos-grad)',
        markerEnd: 'url(#story-arrow-chaos)',
        pillClass: 'border-rose-400/35 bg-[#190e18]/95 text-rose-200',
      };
    case 'route-b':
      return {
        stroke: '#fbbf24',
        markerEnd: 'url(#story-arrow-amber)',
        pillClass: 'border-amber-400/35 bg-[#17130d]/95 text-amber-200',
      };
    case 'route-a':
    case 'neutral':
    default:
      return {
        stroke: '#22d3ee',
        markerEnd: 'url(#story-arrow-cyan)',
        pillClass: 'border-cyan-400/35 bg-[#091322]/95 text-cyan-200',
      };
  }
}

function bezierAt(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number {
  const u = 1 - t;
  return (
    u * u * u * p0 +
    3 * u * u * t * p1 +
    3 * u * t * t * p2 +
    t * t * t * p3
  );
}

function computeDesktopEdgeGeometry(
  edge: StoryTreeEdge,
  fromRect: DOMRect,
  toRect: DOMRect,
  containerRect: DOMRect,
  allVisibleEdgesFromParent: StoryTreeEdge[],
  allVisibleEdgesToTarget: StoryTreeEdge[]
): { d: string; labelX: number; labelY: number } {
  const from = {
    left: fromRect.left - containerRect.left,
    width: fromRect.width,
    bottom: fromRect.bottom - containerRect.top,
    cx: fromRect.left - containerRect.left + fromRect.width / 2,
  };
  const to = {
    left: toRect.left - containerRect.left,
    width: toRect.width,
    top: toRect.top - containerRect.top,
    cx: toRect.left - containerRect.left + toRect.width / 2,
  };

  // Spread outgoing ports cleanly when a parent fans out to 2 children
  let startX = from.cx;
  if (allVisibleEdgesFromParent.length === 2) {
    const idx = allVisibleEdgesFromParent.findIndex((e) => e.id === edge.id);
    const offset = idx === 0 ? 0.3 : 0.7;
    startX = from.left + from.width * offset;
  }

  // Spread incoming ports side-by-side when 2 paths converge onto one card
  let endX = to.cx;
  if (allVisibleEdgesToTarget.length === 2) {
    endX =
      edge.routeHint === 'long-right-converge'
        ? to.left + to.width * 0.68
        : to.left + to.width * 0.32;
  }

  const startY = from.bottom + 2;
  const endY = to.top - 5;
  const dy = Math.max(24, endY - startY);

  let cp1X = startX;
  let cp1Y = startY + dy * 0.48;
  let cp2X = endX;
  let cp2Y = endY - dy * 0.48;
  let labelT = 0.5;

  if (edge.routeHint === 'long-right-converge') {
    cp1X = endX;
    cp1Y = startY + Math.min(72, dy * 0.32);
    cp2X = endX;
    cp2Y = endY - Math.min(72, dy * 0.32);
    labelT = 0.42;
  }

  const d = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
  const labelX = bezierAt(labelT, startX, cp1X, cp2X, endX);
  const labelY = bezierAt(labelT, startY, cp1Y, cp2Y, endY);

  return { d, labelX, labelY };
}

function computeMobileEdgeGeometry(
  edge: StoryTreeEdge,
  fromRect: DOMRect,
  toRect: DOMRect,
  containerRect: DOMRect,
  allVisibleEdgesToTarget: StoryTreeEdge[]
): { d: string } {
  const fromLeft = fromRect.left - containerRect.left;
  const fromTop = fromRect.top - containerRect.top;
  const toLeft = toRect.left - containerRect.left;
  const toTop = toRect.top - containerRect.top;

  const isSecondIncoming =
    allVisibleEdgesToTarget.length > 1 &&
    edge.routeHint === 'long-right-converge';

  const laneX = isSecondIncoming ? 6 : Math.max(12, fromLeft - 14);
  const startX = fromLeft;
  const startY = fromTop + 26;
  const endX = toLeft - 4;
  const endY = toTop + (isSecondIncoming ? 40 : 24);

  const d = `M ${startX} ${startY} C ${laneX} ${startY}, ${laneX} ${endY}, ${endX} ${endY}`;
  return { d };
}

function getCardFrameClass(
  node: StoryTreeNode,
  isSelected: boolean,
  isCompleted: boolean
): string {
  const selectedRing = isSelected ? 'ring-2 ring-cyan-300/80' : '';

  if (node.kind === 'ending' && node.endingId) {
    const ending = getEndingById(node.endingId);
    if (isCompleted) {
      return `border-emerald-400/60 bg-[#0d1c1e]/95 shadow-[0_0_24px_-12px_rgba(52,211,153,0.45)] ${selectedRing}`;
    }
    if (ending.tier === 'best' || ending.tier === 'good') {
      return `border-cyan-400/35 bg-[#101829]/95 hover:border-cyan-400/65 ${selectedRing}`;
    }
    return `border-rose-400/35 bg-[#181220]/95 hover:border-rose-400/65 ${selectedRing}`;
  }

  switch (node.lane) {
    case 'clean':
      return `border-emerald-400/45 bg-[#0f1a24]/95 hover:border-emerald-400/75 ${selectedRing}`;
    case 'chaos':
      return `border-rose-400/50 bg-[#1a1322]/95 hover:border-rose-400/80 ${selectedRing}`;
    case 'route-b':
      return `border-amber-400/45 bg-[#18151d]/95 hover:border-amber-400/75 ${selectedRing}`;
    case 'root':
      return `border-cyan-400/55 bg-[#101a2d]/95 shadow-[0_0_28px_-12px_rgba(34,211,238,0.45)] hover:border-cyan-300/80 ${selectedRing}`;
    case 'route-a':
    default:
      return `border-cyan-400/35 bg-[#101727]/95 hover:border-cyan-400/65 ${selectedRing}`;
  }
}

export function StoryTreeTab({
  completedEndings,
  onToggleEnding,
  focusedNodeId,
  onClearFocusedNode,
  onInspectEnding,
}: StoryTreeTabProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(FORK_NODE_IDS)
  );
  const [activeFilter, setActiveFilter] = useState<StoryPathFilter>('all');
  const [profileSubFilter, setProfileSubFilter] =
    useState<ProfileSubFilter>('both');
  const [drawerNodeId, setDrawerNodeId] = useState<string | null>(null);

  const desktopContainerRef = useRef<HTMLDivElement | null>(null);
  const desktopNodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const mobileContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileNodeRefs = useRef<Map<string, HTMLElement>>(new Map());

  const [desktopSvg, setDesktopSvg] = useState<{
    width: number;
    height: number;
    edges: MeasuredEdge[];
  }>({ width: 0, height: 0, edges: [] });

  const [mobileSvg, setMobileSvg] = useState<{
    width: number;
    height: number;
    edges: { id: string; d: string; stroke: string; markerEnd: string; dimmed: boolean }[];
  }>({ width: 0, height: 0, edges: [] });

  const completedSet = useMemo(
    () => new Set(completedEndings),
    [completedEndings]
  );

  const { visibleNodeIds, visibleEdgeIds } = useMemo(
    () => computeVisibleTree(expandedIds),
    [expandedIds]
  );

  const visibleDesktopNodes = useMemo(
    () => STORY_TREE_NODES.filter((node) => visibleNodeIds.has(node.id)),
    [visibleNodeIds]
  );

  const visibleMobileNodes = useMemo(
    () =>
      MOBILE_NODE_ORDER.filter((id) => visibleNodeIds.has(id))
        .map((id) => getStoryNodeById(id))
        .filter((node): node is StoryTreeNode => Boolean(node)),
    [visibleNodeIds]
  );

  const visibleEdges = useMemo(
    () => STORY_TREE_EDGES.filter((edge) => visibleEdgeIds.has(edge.id)),
    [visibleEdgeIds]
  );

  // Auto-expand ancestor forks & open drawer when jumping from Ending Simulator
  useEffect(() => {
    if (!focusedNodeId) {
      return;
    }
    const ancestors = getAncestorForkIds(focusedNodeId);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      for (const id of ancestors) {
        next.add(id);
      }
      return next;
    });
    setDrawerNodeId(focusedNodeId);
    onClearFocusedNode();

    const timer = window.setTimeout(() => {
      const target =
        desktopNodeRefs.current.get(focusedNodeId) ??
        mobileNodeRefs.current.get(focusedNodeId);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [focusedNodeId, onClearFocusedNode]);

  useEffect(() => {
    if (!drawerNodeId) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerNodeId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerNodeId]);

  const setDesktopRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) {
        desktopNodeRefs.current.set(id, el);
      } else {
        desktopNodeRefs.current.delete(id);
      }
    },
    []
  );

  const setMobileRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) {
        mobileNodeRefs.current.set(id, el);
      } else {
        mobileNodeRefs.current.delete(id);
      }
    },
    []
  );

  const measureConnectors = useCallback(() => {
    const dContainer = desktopContainerRef.current;
    if (dContainer) {
      const containerRect = dContainer.getBoundingClientRect();
      if (containerRect.width > 0 && containerRect.height > 0) {
        const measured: MeasuredEdge[] = [];
        for (const edge of visibleEdges) {
          const fromEl = desktopNodeRefs.current.get(edge.from);
          const toEl = desktopNodeRefs.current.get(edge.to);
          if (!fromEl || !toEl) {
            continue;
          }
          const fromEdges = visibleEdges.filter((e) => e.from === edge.from);
          const toEdges = visibleEdges.filter((e) => e.to === edge.to);
          const geom = computeDesktopEdgeGeometry(
            edge,
            fromEl.getBoundingClientRect(),
            toEl.getBoundingClientRect(),
            containerRect,
            fromEdges,
            toEdges
          );
          const style = getEdgeStyle(edge.tone);
          const dimmed = !doesEdgeMatchFilter(
            edge,
            activeFilter,
            profileSubFilter
          );
          measured.push({
            edge,
            ...geom,
            stroke: style.stroke,
            markerEnd: style.markerEnd,
            dimmed,
          });
        }
        setDesktopSvg({
          width: containerRect.width,
          height: containerRect.height,
          edges: measured,
        });
      }
    }

    const mContainer = mobileContainerRef.current;
    if (mContainer) {
      const containerRect = mContainer.getBoundingClientRect();
      if (containerRect.width > 0 && containerRect.height > 0) {
        const measuredMobile: {
          id: string;
          d: string;
          stroke: string;
          markerEnd: string;
          dimmed: boolean;
        }[] = [];
        for (const edge of visibleEdges) {
          const fromEl = mobileNodeRefs.current.get(edge.from);
          const toEl = mobileNodeRefs.current.get(edge.to);
          if (!fromEl || !toEl) {
            continue;
          }
          const toEdges = visibleEdges.filter((e) => e.to === edge.to);
          const geom = computeMobileEdgeGeometry(
            edge,
            fromEl.getBoundingClientRect(),
            toEl.getBoundingClientRect(),
            containerRect,
            toEdges
          );
          const style = getEdgeStyle(edge.tone);
          const dimmed = !doesEdgeMatchFilter(
            edge,
            activeFilter,
            profileSubFilter
          );
          measuredMobile.push({
            id: edge.id,
            d: geom.d,
            stroke: style.stroke,
            markerEnd: style.markerEnd,
            dimmed,
          });
        }
        setMobileSvg({
          width: containerRect.width,
          height: containerRect.height,
          edges: measuredMobile,
        });
      }
    }
  }, [visibleEdges, activeFilter, profileSubFilter]);

  useLayoutEffect(() => {
    measureConnectors();
    const observers: ResizeObserver[] = [];

    if (typeof ResizeObserver !== 'undefined') {
      if (desktopContainerRef.current) {
        const dObs = new ResizeObserver(() => measureConnectors());
        dObs.observe(desktopContainerRef.current);
        observers.push(dObs);
      }
      if (mobileContainerRef.current) {
        const mObs = new ResizeObserver(() => measureConnectors());
        mObs.observe(mobileContainerRef.current);
        observers.push(mObs);
      }
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    if (!prefersReducedMotion) {
      const start = performance.now();
      const tick = (now: number) => {
        measureConnectors();
        if (now - start < 280) {
          rafId = window.requestAnimationFrame(tick);
        }
      };
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      observers.forEach((obs) => obs.disconnect());
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [measureConnectors, expandedIds, completedEndings]);

  const toggleFork = (nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(FORK_NODE_IDS));
  const collapseAll = () => setExpandedIds(new Set());

  const currentFilterMeta =
    STORY_TREE_FILTERS.find((item) => item.id === activeFilter) ??
    STORY_TREE_FILTERS[0]!;

  const drawerNode = drawerNodeId ? getStoryNodeById(drawerNodeId) : undefined;
  const drawerEnding = drawerNode?.endingId
    ? getEndingById(drawerNode.endingId)
    : undefined;
  const drawerIncoming = drawerNode ? getIncomingEdges(drawerNode.id) : [];
  const drawerOutgoing = drawerNode ? getOutgoingEdges(drawerNode.id) : [];

  const renderCard = (node: StoryTreeNode, isMobile: boolean) => {
    const isFork = node.kind !== 'ending';
    const isExpanded = expandedIds.has(node.id);
    const isSelected = drawerNodeId === node.id;
    const isCompleted = node.endingId ? completedSet.has(node.endingId) : false;
    const convergenceCount = getConvergenceCount(node.id);
    const incomingEdges = getIncomingEdges(node.id);
    const dimmed = !doesNodeMatchFilter(node, activeFilter, profileSubFilter);
    const ending = node.endingId ? getEndingById(node.endingId) : undefined;
    const collapsedSummary =
      isFork && !isExpanded ? getCollapsedDescendantSummary(node.id) : null;

    return (
      <article
        key={`${isMobile ? 'm' : 'd'}-${node.id}`}
        ref={isMobile ? setMobileRef(node.id) : setDesktopRef(node.id)}
        style={
          isMobile
            ? { marginLeft: `${Math.min(node.mobileDepth, 3) * 10}px` }
            : {
                gridColumn: `${node.desktopGrid.colStart} / span ${node.desktopGrid.colSpan}`,
                gridRowStart: node.desktopGrid.row,
              }
        }
        className={`story-node-enter relative z-10 overflow-hidden rounded-2xl border transition-[opacity,border-color,box-shadow,transform] duration-200 ${getCardFrameClass(
          node,
          isSelected,
          isCompleted
        )} ${dimmed ? 'opacity-20' : 'opacity-100'}`}
      >
        {ending && (
          <div
            className={`h-1 w-full bg-gradient-to-r ${tierTopBarClass(
              ending.tier
            )}`}
          />
        )}

        <div className="p-3.5 sm:p-4">
          {/* Header Row: Badges + Fork Expand/Collapse Button (siblings, never nested buttons) */}
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => setDrawerNodeId(node.id)}
              className="min-w-0 flex-1 overflow-hidden text-left focus-visible:rounded-lg"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                {ending ? (
                  <>
                    <span className="rounded-md border border-white/15 bg-canvas px-2 py-0.5 font-mono text-[11px] font-extrabold tabular-nums text-white">
                      {ending.code}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${tierBadgeClass(
                        ending.tier
                      )}`}
                    >
                      {ending.tierLabel}
                    </span>
                  </>
                ) : (
                  <span className="max-w-full rounded-md border border-white/10 bg-canvas/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                    {node.stageLabel}
                  </span>
                )}

                {convergenceCount > 1 && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/45 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-amber-200">
                    <GitMerge className="h-3 w-3 shrink-0 text-amber-300" />
                    Converges ({convergenceCount} paths)
                  </span>
                )}
              </div>

              <h3 className="mt-2 font-display text-sm font-bold leading-snug text-white">
                {node.title}
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {node.subtitle}
              </p>
            </button>

            <div className="flex shrink-0 items-center gap-1">
              {ending && (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isCompleted}
                  aria-label={`Mark ${ending.code} ${ending.name} completed`}
                  onClick={() => onToggleEnding(ending.id)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/[0.06] hover:text-emerald-300"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-500" />
                  )}
                </button>
              )}

              {isFork && (
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.title} branches`}
                  onClick={() => toggleFork(node.id)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/15 hover:text-white"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-cyan-300 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-300 transition-transform duration-200" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Incoming Path Pill(s) so conditions are crystal clear in stacked view */}
          {isMobile && incomingEdges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {incomingEdges.map((inEdge) => (
                <span
                  key={inEdge.id}
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                    getEdgeStyle(inEdge.tone).pillClass
                  }`}
                >
                  {inEdge.conditionLabel}
                </span>
              ))}
            </div>
          )}

          {/* Unlock Condition Chip */}
          <div className="mt-2.5 rounded-lg border border-white/[0.07] bg-canvas/75 px-2.5 py-1.5 text-[11px] leading-snug text-slate-200">
            <span className="font-semibold text-slate-400">Unlock: </span>
            {node.unlockCondition}
          </div>

          {/* Special Callouts ($500K+ Bonus on E3, Launch-Week Note on E6/E7) */}
          {ending?.bonusEpilogueNote && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
              <Sparkles className="h-3 w-3 text-emerald-300" />
              $500K+ BuckMe! Bonus Epilogue
            </div>
          )}

          {ending?.launchWeekNote && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-400/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
              <AlertTriangle className="h-3 w-3 text-amber-300" />
              Launch-week patch note
            </div>
          )}

          {/* Smooth Collapsible Summary Pill when Fork is Collapsed */}
          {isFork && (
            <div className="collapsible-panel" data-open={!isExpanded}>
              <div>
                <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-dashed border-cyan-400/35 bg-cyan-500/[0.07] px-2.5 py-1.5 text-[11px] tabular-nums text-cyan-200">
                  <span>
                    Collapsed · {collapsedSummary?.hiddenEndingIds.length ?? 0}{' '}
                    ending
                    {(collapsedSummary?.hiddenEndingIds.length ?? 0) === 1
                      ? ''
                      : 's'}{' '}
                    hidden
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFork(node.id)}
                    className="font-semibold text-cyan-300 underline underline-offset-2 hover:text-white"
                  >
                    Expand
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Plot-Sensitive Outcome Protected by SpoilerText */}
          <div className="mt-2.5 flex flex-col gap-2 pt-0.5">
            <SpoilerText label={ending ? `${ending.code} beat` : 'Plot context'}>
              {node.spoilerContext}
            </SpoilerText>
            <button
              type="button"
              onClick={() => setDrawerNodeId(node.id)}
              className="inline-flex min-h-9 w-full items-center justify-between gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] font-semibold text-cyan-300 transition hover:border-cyan-400/35 hover:bg-white/[0.05] hover:text-cyan-200"
            >
              <span>Details &amp; conditions</span>
              <ArrowRight className="h-3 w-3 shrink-0" />
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      {/* Decision Tree Controls & Path Filters */}
      <section className="surface-card rounded-2xl border border-white/[0.08] p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 shrink-0 text-cyan-400" />
              <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                Story Choice &amp; Ending Decision Tree
              </h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
              {currentFilterMeta.description}
            </p>
          </div>

          {/* Expand All / Collapse All Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-white/10 bg-canvas/80 px-2.5 py-1.5 font-mono text-[11px] font-semibold tabular-nums text-slate-300">
              {expandedIds.size}/{FORK_NODE_IDS.length} forks open
            </span>
            <button
              type="button"
              onClick={expandAll}
              disabled={expandedIds.size === FORK_NODE_IDS.length}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronsUpDown className="h-3.5 w-3.5 text-cyan-400" />
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              disabled={expandedIds.size === 0}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronsDownUp className="h-3.5 w-3.5 text-slate-400" />
              Collapse All
            </button>
          </div>
        </div>

        {/* 4 Path Filter Pills */}
        <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.07] pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Story path filters"
            className="flex flex-wrap gap-2"
          >
            {STORY_TREE_FILTERS.map((filter) => {
              const active = activeFilter === filter.id;
              let activeStyle =
                'border-cyan-400/70 bg-cyan-500/18 text-cyan-100 shadow-[0_0_18px_-6px_rgba(34,211,238,0.55)]';
              if (active && filter.id === 'route-b') {
                activeStyle =
                  'border-rose-400/70 bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-rose-100 shadow-[0_0_18px_-6px_rgba(251,113,133,0.55)]';
              } else if (active && filter.id === 'clean-vs-chaos') {
                activeStyle =
                  'border-emerald-400/70 bg-gradient-to-r from-emerald-500/20 to-rose-500/15 text-emerald-100 shadow-[0_0_18px_-6px_rgba(52,211,153,0.55)]';
              }

              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`min-h-11 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                    active
                      ? activeStyle
                      : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {activeFilter === 'clean-vs-chaos' && (
            <div
              role="group"
              aria-label="Criminal Profile focus"
              className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-canvas/80 p-1"
            >
              {(
                [
                  ['both', 'Compare Both'],
                  ['clean', 'Clean Only'],
                  ['chaos', 'Chaos Only'],
                ] as const
              ).map(([subId, label]) => {
                const subActive = profileSubFilter === subId;
                return (
                  <button
                    key={subId}
                    type="button"
                    aria-pressed={subActive}
                    onClick={() => setProfileSubFilter(subId)}
                    className={`min-h-9 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      subActive
                        ? 'bg-white text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Visual Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.07] pt-3.5 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            Route A · Strong Relationship
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Route B · Low / Break Up
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Clean / Best Path
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            Chaos / Bad Outcome
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-200">
            <GitMerge className="h-3.5 w-3.5 text-amber-300" />
            Converges (multi-path destination)
          </span>
        </div>
      </section>

      {/* Desktop Top-Down Collapsible Tree (5-Column CSS Grid + Measured SVG Cubic-Bezier Connectors) */}
      <section
        aria-label="Top-down story decision tree"
        className="tree-dot-canvas hidden rounded-2xl border border-white/[0.08] bg-surface/85 p-6 shadow-xl shadow-black/30 md:block"
      >
        <div className="mb-6 grid grid-cols-5 gap-4 border-b border-white/[0.08] pb-3.5 text-[11px] font-bold uppercase tracking-wider">
          <div className="col-span-3 flex items-center gap-2 text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Route A · Strong Relationship &amp; Bridge Escape (E1, E2, E4, E5, E8)
          </div>
          <div className="col-span-2 flex items-center gap-2 text-amber-300">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-400" />
            Route B · Low / Break Up &amp; Standoff (E3, E6, E7)
          </div>
        </div>

        <div ref={desktopContainerRef} className="relative">
          {desktopSvg.width > 0 && (
            <>
              <svg
                aria-hidden="true"
                width={desktopSvg.width}
                height={desktopSvg.height}
                viewBox={`0 0 ${desktopSvg.width} ${desktopSvg.height}`}
                className="pointer-events-none absolute inset-0 z-0 overflow-visible"
              >
                <defs>
                  <linearGradient
                    id="story-chaos-grad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fb7185" />
                  </linearGradient>
                  <marker
                    id="story-arrow-cyan"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#22d3ee" />
                  </marker>
                  <marker
                    id="story-arrow-clean"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#34d399" />
                  </marker>
                  <marker
                    id="story-arrow-amber"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#fbbf24" />
                  </marker>
                  <marker
                    id="story-arrow-chaos"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#fb7185" />
                  </marker>
                </defs>

                {desktopSvg.edges.map((item) => (
                  <path
                    key={item.edge.id}
                    d={item.d}
                    fill="none"
                    stroke={item.stroke}
                    strokeWidth={item.dimmed ? 1.75 : 2.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd={item.markerEnd}
                    style={{ opacity: item.dimmed ? 0.14 : 0.88 }}
                    className="transition-opacity duration-200"
                  />
                ))}
              </svg>

              {/* Midpoint Edge Condition Pills */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20"
              >
                {desktopSvg.edges.map((item) => {
                  const style = getEdgeStyle(item.edge.tone);
                  return (
                    <span
                      key={`pill-${item.edge.id}`}
                      style={{
                        left: `${item.labelX}px`,
                        top: `${item.labelY}px`,
                        transform: 'translate(-50%, -50%)',
                        opacity: item.dimmed ? 0.16 : 1,
                      }}
                      className={`absolute whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold shadow-sm transition-opacity duration-200 ${style.pillClass}`}
                    >
                      {item.edge.conditionLabel}
                    </span>
                  );
                })}
              </div>
            </>
          )}

          <div className="relative z-10 grid grid-cols-[repeat(5,minmax(0,1fr))] items-start gap-x-4 gap-y-16">
            {visibleDesktopNodes.map((node) => renderCard(node, false))}
          </div>
        </div>
      </section>

      {/* Mobile Top-Down Collapsible Tree (< md) */}
      <section
        aria-label="Mobile top-down story decision tree"
        className="tree-dot-canvas rounded-2xl border border-white/[0.08] bg-surface/85 p-3.5 md:hidden"
      >
        <div ref={mobileContainerRef} className="relative pl-8">
          {mobileSvg.width > 0 && (
            <svg
              aria-hidden="true"
              width={mobileSvg.width}
              height={mobileSvg.height}
              viewBox={`0 0 ${mobileSvg.width} ${mobileSvg.height}`}
              className="pointer-events-none absolute inset-0 z-0 overflow-visible"
            >
              <defs>
                <linearGradient
                  id="story-mobile-chaos-grad"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
                <marker
                  id="story-m-arrow-cyan"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#22d3ee" />
                </marker>
                <marker
                  id="story-m-arrow-clean"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#34d399" />
                </marker>
                <marker
                  id="story-m-arrow-amber"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#fbbf24" />
                </marker>
                <marker
                  id="story-m-arrow-chaos"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#fb7185" />
                </marker>
              </defs>

              {mobileSvg.edges.map((item) => {
                const mobileMarker = item.markerEnd
                  .replace('story-arrow-', 'story-m-arrow-');
                const mobileStroke =
                  item.stroke === 'url(#story-chaos-grad)'
                    ? 'url(#story-mobile-chaos-grad)'
                    : item.stroke;
                return (
                  <path
                    key={`m-edge-${item.id}`}
                    d={item.d}
                    fill="none"
                    stroke={mobileStroke}
                    strokeWidth={item.dimmed ? 1.5 : 2.25}
                    strokeLinecap="round"
                    markerEnd={mobileMarker}
                    style={{ opacity: item.dimmed ? 0.16 : 0.88 }}
                    className="transition-opacity duration-200"
                  />
                );
              })}
            </svg>
          )}

          <div className="relative z-10 space-y-3.5">
            {visibleMobileNodes.map((node) => renderCard(node, true))}
          </div>
        </div>
      </section>

      {/* Node Detail Drawer (Right Slide-Over on Desktop, Bottom Sheet on Mobile) */}
      {drawerNode &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tree-drawer-title"
            className="fixed inset-0 z-50 flex items-end justify-end bg-black/75 backdrop-blur-sm md:items-stretch"
            onClick={() => setDrawerNodeId(null)}
          >
            <div
              className="drawer-slide-in flex max-h-[86vh] w-full flex-col overflow-y-auto rounded-t-2xl border-t border-white/15 bg-[#0e1424] p-5 shadow-2xl md:h-full md:max-h-full md:max-w-md md:rounded-l-2xl md:rounded-tr-none md:border-l md:border-t-0 md:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {drawerEnding ? (
                      <>
                        <span className="rounded-md border border-white/15 bg-canvas px-2.5 py-0.5 font-mono text-xs font-bold tabular-nums text-white">
                          {drawerEnding.code}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${tierBadgeClass(
                            drawerEnding.tier
                          )}`}
                        >
                          {drawerEnding.tierLabel}
                        </span>
                      </>
                    ) : (
                      <span className="rounded-md border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                        {drawerNode.stageLabel}
                      </span>
                    )}
                    {drawerIncoming.length > 1 && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/45 bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold tabular-nums text-amber-200">
                        <GitMerge className="h-3 w-3 text-amber-300" />
                        Converges ({drawerIncoming.length} paths)
                      </span>
                    )}
                  </div>
                  <h2
                    id="tree-drawer-title"
                    className="font-display text-lg font-bold text-white sm:text-xl"
                  >
                    {drawerNode.title}
                  </h2>
                  <p className="text-xs text-slate-400">{drawerNode.subtitle}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerNodeId(null)}
                  aria-label="Close node details"
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs leading-relaxed">
                {/* Unlock Requirements */}
                <div className="rounded-xl border border-white/[0.08] bg-canvas/70 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                    Unlock Requirements
                  </div>
                  <ul className="mt-2 space-y-1.5 text-slate-200">
                    {drawerNode.requirements.map((req) => (
                      <li key={req} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Incoming Converging Paths */}
                {drawerIncoming.length > 0 && (
                  <div className="rounded-xl border border-white/[0.08] bg-canvas/70 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {drawerIncoming.length > 1
                        ? `Incoming Converging Paths (${drawerIncoming.length})`
                        : 'Incoming Path'}
                    </div>
                    <div className="mt-2 space-y-2">
                      {drawerIncoming.map((inEdge) => {
                        const parent = getStoryNodeById(inEdge.from);
                        return (
                          <button
                            key={inEdge.id}
                            type="button"
                            onClick={() => setDrawerNodeId(inEdge.from)}
                            className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-cyan-400/50"
                          >
                            <div>
                              <div className="font-semibold text-white">
                                {parent?.title ?? inEdge.from}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {inEdge.pathSummary}
                              </div>
                            </div>
                            <span
                              className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                                getEdgeStyle(inEdge.tone).pillClass
                              }`}
                            >
                              {inEdge.conditionLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Outgoing Branches for Forks */}
                {drawerOutgoing.length > 0 && (
                  <div className="rounded-xl border border-white/[0.08] bg-canvas/70 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Downstream Branches
                    </div>
                    <div className="mt-2 space-y-2">
                      {drawerOutgoing.map((outEdge) => {
                        const child = getStoryNodeById(outEdge.to);
                        return (
                          <button
                            key={outEdge.id}
                            type="button"
                            onClick={() => setDrawerNodeId(outEdge.to)}
                            className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-cyan-400/50"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-white">
                                {child?.title ?? outEdge.to}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {outEdge.conditionLabel}
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-cyan-400" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes (Bonus Epilogue / Launch-Week Verification) */}
                {drawerNode.note && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-400/35 bg-amber-500/10 p-3.5 text-amber-100">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    <span>{drawerNode.note}</span>
                  </div>
                )}

                {/* Spoiler-Protected Context */}
                <div className="rounded-xl border border-white/[0.08] bg-canvas/70 p-4">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Plot-Sensitive Outcome
                  </div>
                  <SpoilerText
                    label={
                      drawerEnding
                        ? `${drawerEnding.code} ending outcome`
                        : 'Mission & plot context'
                    }
                  >
                    {drawerNode.spoilerContext}
                  </SpoilerText>
                </div>

                {/* Completion & Simulator Actions */}
                {drawerEnding ? (
                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onToggleEnding(drawerEnding.id)}
                      className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tabular-nums transition ${
                        completedSet.has(drawerEnding.id)
                          ? 'border border-emerald-400/50 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20'
                          : 'bg-white text-slate-950 shadow-sm hover:bg-cyan-100'
                      }`}
                    >
                      {completedSet.has(drawerEnding.id) ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          Marked as Completed ({drawerEnding.code})
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4" />
                          Mark {drawerEnding.code} Completed
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDrawerNodeId(null);
                        onInspectEnding(drawerEnding.id);
                      }}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/10"
                    >
                      <Compass className="h-4 w-4 text-cyan-400" />
                      Simulate {drawerEnding.code} in Ending Navigator
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/[0.08] bg-canvas/70 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Resulting Endings ({drawerNode.reachableEndings.length})
                    </div>
                    <div className="mt-2.5 space-y-2">
                      {drawerNode.reachableEndings.map((endId) => {
                        const targetEnding = getEndingById(endId);
                        const done = completedSet.has(endId);
                        return (
                          <div
                            key={endId}
                            className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2"
                          >
                            <button
                              type="button"
                              onClick={() => setDrawerNodeId(endId)}
                              className="flex min-w-0 flex-1 items-center gap-2 text-left"
                            >
                              <span className="rounded border border-white/15 bg-canvas px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-white">
                                {targetEnding.code}
                              </span>
                              <span className="truncate font-semibold text-slate-200 hover:text-cyan-200">
                                {targetEnding.name}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onToggleEnding(endId)}
                              className={`inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                                done
                                  ? 'border-emerald-400/45 bg-emerald-500/15 text-emerald-200'
                                  : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-400/45'
                              }`}
                            >
                              {done ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                  Done
                                </>
                              ) : (
                                <>
                                  <Circle className="h-3.5 w-3.5" />
                                  Mark
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
