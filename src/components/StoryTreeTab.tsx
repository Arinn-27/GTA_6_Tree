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
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Circle,
  Compass,
  GitBranch,
  GitMerge,
  Sparkles,
  X,
} from 'lucide-react';
import { getEndingById } from '../data/endings';
import {
  CHAPTER_ORDER,
  COLLAPSIBLE_NODE_IDS,
  STORY_DAG_FILTERS,
  computeVisibleDag,
  doesEdgeMatchFilter,
  doesNodeMatchFilter,
  getAncestorExpandIds,
  getChapterNodes,
  getChapterSummary,
  getCollapsedForkSummary,
  getConvergenceCount,
  getDagNodeById,
  getIncomingEdges,
  getOutgoingEdges,
} from '../data/storyDag';
import type {
  EndingId,
  EndingTier,
  ProfileSubFilter,
  StoryDagEdge,
  StoryDagNode,
  StoryPathFilter,
} from '../types/tracker';
import { SpoilerText } from './SpoilerText';

interface StoryTreeTabProps {
  completedEndings: string[];
  onToggleEnding: (endingId: string) => void;
  focusedNodeId: string | null;
  onClearFocusedNode: () => void;
  onInspectEnding: (endingId: EndingId) => void;
}

interface MeasuredDesktopEdge {
  edge: StoryDagEdge;
  d: string;
  labelX: number;
  labelY: number;
  stroke: string;
  markerEnd: string;
  dimmed: boolean;
}

interface MeasuredMobileEdge {
  edge: StoryDagEdge;
  d: string;
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

function getEdgeStyle(tone: StoryDagEdge['tone']): {
  stroke: string;
  markerEnd: string;
  pillClass: string;
} {
  switch (tone) {
    case 'clean':
      return {
        stroke: '#34d399',
        markerEnd: 'url(#dag-arrow-clean)',
        pillClass: 'border-emerald-400/35 bg-[#09161a]/95 text-emerald-200',
      };
    case 'chaos':
      return {
        stroke: 'url(#dag-chaos-grad)',
        markerEnd: 'url(#dag-arrow-chaos)',
        pillClass: 'border-rose-400/35 bg-[#190e18]/95 text-rose-200',
      };
    case 'route-b':
      return {
        stroke: '#fbbf24',
        markerEnd: 'url(#dag-arrow-amber)',
        pillClass: 'border-amber-400/35 bg-[#17130d]/95 text-amber-200',
      };
    case 'route-a':
      return {
        stroke: '#22d3ee',
        markerEnd: 'url(#dag-arrow-cyan)',
        pillClass: 'border-cyan-400/35 bg-[#091322]/95 text-cyan-200',
      };
    case 'spine':
    default:
      return {
        stroke: '#64748b',
        markerEnd: 'url(#dag-arrow-spine)',
        pillClass: 'border-slate-500/40 bg-[#0d1424]/95 text-slate-200',
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeDesktopEdgeGeometry(
  edge: StoryDagEdge,
  fromRect: DOMRect,
  toRect: DOMRect,
  containerRect: DOMRect,
  edgesFromParent: StoryDagEdge[],
  edgesToTarget: StoryDagEdge[]
): { d: string; labelX: number; labelY: number } {
  const from = {
    left: fromRect.left - containerRect.left,
    width: fromRect.width,
    bottom: fromRect.bottom - containerRect.top,
    cx: fromRect.left - containerRect.left + fromRect.width / 2,
  };
  const to = {
    left: toRect.left - containerRect.left,
    right: toRect.right - containerRect.left,
    width: toRect.width,
    top: toRect.top - containerRect.top,
    cx: toRect.left - containerRect.left + toRect.width / 2,
  };

  let startX = from.cx;
  if (edgesFromParent.length === 2) {
    const idx = edgesFromParent.findIndex((e) => e.id === edge.id);
    const ratio = idx === 0 ? 0.3 : 0.7;
    startX = from.left + from.width * ratio;
  }

  let endX = to.cx;
  if (edge.routeHint === 'rejoin-merge') {
    // Drop cleanly onto wide chapter/save targets near the source column without crossing.
    endX = clamp(from.cx, to.left + 32, to.right - 32);
  } else if (edgesToTarget.length === 2) {
    endX =
      edge.routeHint === 'long-right-converge'
        ? to.left + to.width * 0.68
        : to.left + to.width * 0.32;
  }

  const startY = from.bottom + 2;
  const endY = Math.max(startY + 12, to.top - 5);
  const dy = Math.max(24, endY - startY);

  let cp1X = startX;
  let cp1Y = startY + dy * 0.48;
  let cp2X = endX;
  let cp2Y = endY - dy * 0.48;
  let labelT = 0.5;

  if (edge.routeHint === 'long-right-converge') {
    cp1X = endX;
    cp1Y = startY + Math.min(72, dy * 0.34);
    cp2X = endX;
    cp2Y = endY - Math.min(72, dy * 0.34);
    labelT = 0.42;
  } else if (edge.routeHint === 'lower-left-sweep') {
    // Drops vertically inside empty Col 5 Row 6, then curves cleanly left into Col 4 Row 7.
    cp1X = startX;
    cp1Y = endY - 56;
    cp2X = endX;
    cp2Y = endY - 38;
    labelT = 0.76;
  }

  const clampedStartX = clamp(startX, 8, containerRect.width - 8);
  const clampedEndX = clamp(endX, 8, containerRect.width - 8);
  const clampedCp1X = clamp(cp1X, 8, containerRect.width - 8);
  const clampedCp2X = clamp(cp2X, 8, containerRect.width - 8);

  const d = `M ${clampedStartX} ${startY} C ${clampedCp1X} ${cp1Y}, ${clampedCp2X} ${cp2Y}, ${clampedEndX} ${endY}`;
  const rawLabelX = bezierAt(
    labelT,
    clampedStartX,
    clampedCp1X,
    clampedCp2X,
    clampedEndX
  );
  const labelX = clamp(rawLabelX, 86, Math.max(86, containerRect.width - 86));
  const labelY = bezierAt(labelT, startY, cp1Y, cp2Y, endY);

  return { d, labelX, labelY };
}

function computeMobileEdgeGeometry(
  edge: StoryDagEdge,
  fromRect: DOMRect,
  toRect: DOMRect,
  containerRect: DOMRect,
  edgesToTarget: StoryDagEdge[]
): { d: string } {
  const fromLeft = fromRect.left - containerRect.left;
  const fromTop = fromRect.top - containerRect.top;
  const toLeft = toRect.left - containerRect.left;
  const toTop = toRect.top - containerRect.top;

  const isSecondIncoming =
    edgesToTarget.length > 1 && edge.routeHint === 'long-right-converge';

  const laneX = isSecondIncoming ? 6 : Math.max(12, fromLeft - 14);
  const startX = Math.max(8, fromLeft);
  const startY = fromTop + Math.min(26, fromRect.height / 2);
  const endX = Math.max(8, toLeft - 4);
  const endY =
    toTop + Math.min(isSecondIncoming ? 40 : 24, toRect.height / 2);

  const d = `M ${startX} ${startY} C ${laneX} ${startY}, ${laneX} ${endY}, ${endX} ${endY}`;
  return { d };
}

function getChoiceOrConditionCardClass(
  node: StoryDagNode,
  isSelected: boolean
): string {
  const selectedRing = isSelected ? 'ring-2 ring-cyan-300/80' : '';

  if (node.nodeType === 'condition') {
    return `condition-gate-card border-cyan-400/60 bg-[#0d182b]/95 hover:border-cyan-300/85 ${selectedRing}`;
  }

  switch (node.lane) {
    case 'clean':
      return `border-emerald-400/45 bg-[#0f1a24]/95 hover:border-emerald-400/75 ${selectedRing}`;
    case 'chaos':
      return `border-rose-400/50 bg-[#1a1322]/95 hover:border-rose-400/80 ${selectedRing}`;
    case 'route-b':
      return `border-amber-400/45 bg-[#18151d]/95 hover:border-amber-400/75 ${selectedRing}`;
    case 'route-a':
      return `border-cyan-400/35 bg-[#101727]/95 hover:border-cyan-400/65 ${selectedRing}`;
    case 'root':
    default:
      return `border-white/15 bg-[#111829]/95 hover:border-cyan-400/55 ${selectedRing}`;
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
    () => new Set(COLLAPSIBLE_NODE_IDS)
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
    edges: MeasuredDesktopEdge[];
  }>({ width: 0, height: 0, edges: [] });

  const [mobileSvg, setMobileSvg] = useState<{
    width: number;
    height: number;
    edges: MeasuredMobileEdge[];
  }>({ width: 0, height: 0, edges: [] });

  const completedSet = useMemo(
    () => new Set(completedEndings),
    [completedEndings]
  );

  const { visibleNodeIds, visibleEdges } = useMemo(
    () => computeVisibleDag(expandedIds),
    [expandedIds]
  );

  useEffect(() => {
    if (!focusedNodeId) {
      return;
    }
    const expandTargets = getAncestorExpandIds(focusedNodeId);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      for (const id of expandTargets) {
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
    }, 90);

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
        const measured: MeasuredDesktopEdge[] = [];
        for (const edge of visibleEdges) {
          const fromEl = desktopNodeRefs.current.get(edge.from);
          const toEl = desktopNodeRefs.current.get(edge.to);
          if (!fromEl || !toEl) {
            continue;
          }
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          if (fromRect.height < 4 || toRect.height < 4) {
            continue;
          }

          const fromEdges = visibleEdges.filter((e) => e.from === edge.from);
          const toEdges = visibleEdges.filter((e) => e.to === edge.to);
          const geom = computeDesktopEdgeGeometry(
            edge,
            fromRect,
            toRect,
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
        const measuredMobile: MeasuredMobileEdge[] = [];
        for (const edge of visibleEdges) {
          const fromEl = mobileNodeRefs.current.get(edge.from);
          const toEl = mobileNodeRefs.current.get(edge.to);
          if (!fromEl || !toEl) {
            continue;
          }
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          if (fromRect.height < 4 || toRect.height < 4) {
            continue;
          }

          const toEdges = visibleEdges.filter((e) => e.to === edge.to);
          const geom = computeMobileEdgeGeometry(
            edge,
            fromRect,
            toRect,
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
            edge,
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
        if (now - start < 300) {
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

  const toggleCollapsible = (nodeId: string) => {
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

  const expandAll = () => setExpandedIds(new Set(COLLAPSIBLE_NODE_IDS));
  const collapseAll = () => setExpandedIds(new Set());

  const currentFilterMeta =
    STORY_DAG_FILTERS.find((item) => item.id === activeFilter) ??
    STORY_DAG_FILTERS[0]!;

  const drawerNode = drawerNodeId ? getDagNodeById(drawerNodeId) : undefined;
  const drawerEnding = drawerNode?.endingId
    ? getEndingById(drawerNode.endingId)
    : undefined;
  const drawerBonusTarget = drawerNode?.bonusForEndingId
    ? getEndingById(drawerNode.bonusForEndingId)
    : undefined;
  const drawerIncoming = drawerNode ? getIncomingEdges(drawerNode.id) : [];
  const drawerOutgoing = drawerNode ? getOutgoingEdges(drawerNode.id) : [];

  const renderChapterHeader = (chapter: StoryDagNode, isMobile: boolean) => {
    const isOpen = expandedIds.has(chapter.id);
    const isSelected = drawerNodeId === chapter.id;
    const summary = getChapterSummary(chapter.chapterId);
    const dimmed = !doesNodeMatchFilter(chapter, activeFilter, profileSubFilter);

    return (
      <article
        key={`${isMobile ? 'm' : 'd'}-${chapter.id}`}
        ref={isMobile ? setMobileRef(chapter.id) : setDesktopRef(chapter.id)}
        className={`chapter-band-header relative z-10 rounded-2xl border border-l-4 border-white/[0.1] border-l-cyan-400 bg-[#0d1527]/95 p-4 shadow-lg shadow-black/30 transition-[opacity,border-color,box-shadow] duration-200 ${
          isSelected ? 'ring-2 ring-cyan-300/80' : 'hover:border-cyan-400/45'
        } ${dimmed ? 'opacity-25' : 'opacity-100'}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setDrawerNodeId(chapter.id)}
            className="min-w-0 flex-1 text-left focus-visible:rounded-lg"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-0.5 font-mono text-[11px] font-extrabold tracking-wider tabular-nums text-cyan-200">
                {chapter.stageLabel}
              </span>
              {summary.endingsCount > 0 ? (
                <span className="rounded-md border border-emerald-400/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-200">
                  {summary.conditionsCount} SPLIT ON gates ·{' '}
                  {summary.endingsCount} endings
                </span>
              ) : (
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-300">
                  {summary.choicesCount} choice nodes
                  {summary.savesCount > 0
                    ? ` · ${summary.savesCount} save anchor`
                    : ''}
                </span>
              )}
            </div>

            <h3 className="mt-1.5 font-display text-base font-bold text-white sm:text-lg">
              {chapter.title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">{chapter.subtitle}</p>
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerNodeId(chapter.id)}
              className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/50 hover:bg-white/[0.08]"
            >
              Details
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${chapter.title}`}
              onClick={() => toggleCollapsible(chapter.id)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-cyan-400/35 bg-cyan-500/10 text-cyan-200 transition hover:bg-cyan-500/20 hover:text-white"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>
      </article>
    );
  };

  const renderNodeCard = (node: StoryDagNode, isMobile: boolean) => {
    const isSelected = drawerNodeId === node.id;
    const dimmed = !doesNodeMatchFilter(node, activeFilter, profileSubFilter);
    const incomingEdges = getIncomingEdges(node.id);
    const positionStyle = isMobile
      ? { marginLeft: `${Math.min(node.mobileDepth, 3) * 10}px` }
      : {
          gridColumn: `${node.desktopGrid.colStart} / span ${node.desktopGrid.colSpan}`,
          gridRowStart: node.desktopGrid.row,
        };

    // 1. Lightweight inline SAVE CHECKPOINT pill
    if (node.nodeType === 'save') {
      return (
        <article
          key={`${isMobile ? 'm' : 'd'}-${node.id}`}
          ref={isMobile ? setMobileRef(node.id) : setDesktopRef(node.id)}
          style={positionStyle}
          className={`save-pill-node story-node-enter relative z-10 rounded-full border border-dashed border-amber-400/45 bg-[#121622]/95 px-4 py-2.5 transition-[opacity,border-color,box-shadow] duration-200 ${
            isSelected ? 'ring-2 ring-cyan-300/80' : 'hover:border-amber-300/75'
          } ${dimmed ? 'opacity-20' : 'opacity-100'}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setDrawerNodeId(node.id)}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:rounded-lg"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/15 text-amber-300">
                <Bookmark className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    {node.stageLabel}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {node.title}
                  </span>
                </div>
                <p className="truncate text-[11px] text-slate-400">
                  {node.subtitle}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDrawerNodeId(node.id)}
              className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-amber-200 transition hover:border-amber-300/50 hover:bg-white/[0.08]"
            >
              Timing
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </article>
      );
    }

    // 2. OUTCOME cards (8 Canonical Endings + E3+ Bonus Epilogue)
    if (node.nodeType === 'outcome') {
      const ending = node.endingId ? getEndingById(node.endingId) : undefined;
      const isBonus = Boolean(node.bonusForEndingId);
      const isCompleted = node.endingId
        ? completedSet.has(node.endingId)
        : node.bonusForEndingId
          ? completedSet.has(node.bonusForEndingId)
          : false;
      const convergenceCount = getConvergenceCount(node.id);

      const outcomeFrame = isBonus
        ? `border-dashed ${
            isCompleted
              ? 'border-emerald-400/65 bg-emerald-950/25'
              : 'border-emerald-400/45 bg-[#0c1b20]/95 hover:border-emerald-300/75'
          }`
        : isCompleted
          ? 'border-emerald-400/60 bg-[#0d1c1e]/95 shadow-[0_0_24px_-12px_rgba(52,211,153,0.45)]'
          : ending && (ending.tier === 'best' || ending.tier === 'good')
            ? 'border-cyan-400/35 bg-[#101829]/95 hover:border-cyan-400/65'
            : 'border-rose-400/35 bg-[#181220]/95 hover:border-rose-400/65';

      return (
        <article
          key={`${isMobile ? 'm' : 'd'}-${node.id}`}
          ref={isMobile ? setMobileRef(node.id) : setDesktopRef(node.id)}
          style={positionStyle}
          className={`story-node-enter relative z-10 overflow-hidden rounded-2xl border transition-[opacity,border-color,box-shadow] duration-200 ${outcomeFrame} ${
            isSelected ? 'ring-2 ring-cyan-300/80' : ''
          } ${dimmed ? 'opacity-20' : 'opacity-100'}`}
        >
          {ending && (
            <div
              className={`h-1 w-full bg-gradient-to-r ${tierTopBarClass(
                ending.tier
              )}`}
            />
          )}
          {isBonus && (
            <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-300" />
          )}

          <div className="p-3.5 sm:p-4">
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
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                      <Sparkles className="h-3 w-3 text-emerald-300" />
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

                <h4 className="mt-2 font-display text-sm font-bold leading-snug text-white">
                  {node.title}
                </h4>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {node.subtitle}
                </p>
              </button>

              {ending && (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isCompleted}
                  aria-label={`Mark ${ending.code} ${ending.name} completed`}
                  onClick={() => onToggleEnding(ending.id)}
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/[0.06] hover:text-emerald-300"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-500" />
                  )}
                </button>
              )}
            </div>

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

            <div className="mt-2.5 rounded-lg border border-white/[0.07] bg-canvas/75 px-2.5 py-1.5 text-[11px] leading-snug text-slate-200">
              <span className="font-semibold text-slate-400">Requires: </span>
              {node.unlockCondition}
            </div>

            {ending?.launchWeekNote && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-400/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                <AlertTriangle className="h-3 w-3 shrink-0 text-amber-300" />
                Launch-week patch note
              </div>
            )}

            <div className="mt-2.5 flex flex-col gap-2 pt-0.5">
              <SpoilerText
                label={ending ? `${ending.code} beat` : 'Epilogue beat'}
              >
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
    }

    // 3. CHOICE & CONDITION ("SPLIT ON") cards
    const isCondition = node.nodeType === 'condition';
    const isFork = Boolean(node.isCollapsible);
    const isExpanded = expandedIds.has(node.id);
    const convergenceCount = getConvergenceCount(node.id);
    const collapsedSummary =
      isFork && !isExpanded ? getCollapsedForkSummary(node.id) : null;

    return (
      <article
        key={`${isMobile ? 'm' : 'd'}-${node.id}`}
        ref={isMobile ? setMobileRef(node.id) : setDesktopRef(node.id)}
        style={positionStyle}
        className={`story-node-enter relative z-10 overflow-hidden rounded-2xl border transition-[opacity,border-color,box-shadow] duration-200 ${getChoiceOrConditionCardClass(
          node,
          isSelected
        )} ${dimmed ? 'opacity-20' : 'opacity-100'}`}
      >
        {isCondition && node.splitVariable && (
          <div className="flex items-center gap-2 border-b border-cyan-400/25 bg-cyan-500/12 px-3.5 py-2">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rotate-45 border border-cyan-300 bg-cyan-400/40"
            />
            <span className="truncate font-mono text-[10px] font-extrabold uppercase tracking-wider text-cyan-200">
              SPLIT ON: {node.splitVariable}
            </span>
          </div>
        )}

        <div className="p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => setDrawerNodeId(node.id)}
              className="min-w-0 flex-1 overflow-hidden text-left focus-visible:rounded-lg"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isCondition
                      ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-200'
                      : 'border-white/10 bg-canvas/80 text-slate-200'
                  }`}
                >
                  {node.stageLabel}
                </span>

                {convergenceCount > 1 && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/45 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-amber-200">
                    <GitMerge className="h-3 w-3 shrink-0 text-amber-300" />
                    Converges ({convergenceCount} paths)
                  </span>
                )}
              </div>

              <h4 className="mt-2 font-display text-sm font-bold leading-snug text-white">
                {node.title}
              </h4>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {node.subtitle}
              </p>
            </button>

            {isFork && (
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.title} branches`}
                onClick={() => toggleCollapsible(node.id)}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/15 hover:text-white"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-cyan-300 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-300 transition-transform duration-200" />
                )}
              </button>
            )}
          </div>

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

          {node.impactTags && node.impactTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {node.impactTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-2.5 rounded-lg border border-white/[0.07] bg-canvas/75 px-2.5 py-1.5 text-[11px] leading-snug text-slate-200">
            <span className="font-semibold text-slate-400">Condition: </span>
            {node.unlockCondition}
          </div>

          {isFork && (
            <div className="collapsible-panel" data-open={!isExpanded}>
              <div>
                <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-dashed border-cyan-400/35 bg-cyan-500/[0.07] px-2.5 py-1.5 text-[11px] tabular-nums text-cyan-200">
                  <span>
                    {node.rejoinTargetId
                      ? `Rejoin branches hidden (${collapsedSummary?.hiddenNodesCount ?? 0})`
                      : `Collapsed · ${collapsedSummary?.hiddenEndingsCount ?? 0} endings hidden`}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCollapsible(node.id)}
                    className="font-semibold text-cyan-300 underline underline-offset-2 hover:text-white"
                  >
                    Expand
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-2.5 flex flex-col gap-2 pt-0.5">
            <SpoilerText label="Plot context">{node.spoilerContext}</SpoilerText>
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
      {/* Controls, Expand/Collapse, Filters & 5-Type Legend */}
      <section className="surface-card rounded-2xl border border-white/[0.08] p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 shrink-0 text-cyan-400" />
              <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                Chronological Story Decision Tree (Ch. 1–5)
              </h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
              {currentFilterMeta.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-white/10 bg-canvas/80 px-2.5 py-1.5 font-mono text-[11px] font-semibold tabular-nums text-slate-300">
              {expandedIds.size}/{COLLAPSIBLE_NODE_IDS.length} sections open
            </span>
            <button
              type="button"
              onClick={expandAll}
              disabled={expandedIds.size === COLLAPSIBLE_NODE_IDS.length}
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
            {STORY_DAG_FILTERS.map((filter) => {
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

        {/* 5-Type Node & Path Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.07] pt-3.5 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-1 rounded-full bg-cyan-400" />
            Chapter Band
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rotate-45 border border-cyan-300 bg-cyan-400/40" />
            SPLIT ON Gate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-full border border-dashed border-amber-400/70 bg-amber-500/15" />
            Save Checkpoint
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Clean / Best
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            Chaos / Bad
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-200">
            <GitMerge className="h-3.5 w-3.5 text-amber-300" />
            Converges (rejoins / merges)
          </span>
        </div>
      </section>

      {/* Desktop Chronological DAG (Unified SVG Connector Overlay + 5 Chapter Sections) */}
      <section
        aria-label="Desktop chronological story decision tree"
        className="tree-dot-canvas hidden rounded-2xl border border-white/[0.08] bg-surface/85 p-6 shadow-xl shadow-black/30 md:block"
      >
        <div ref={desktopContainerRef} className="relative">
          {desktopSvg.width > 0 && (
            <>
              <svg
                aria-hidden="true"
                width={desktopSvg.width}
                height={desktopSvg.height}
                viewBox={`0 0 ${desktopSvg.width} ${desktopSvg.height}`}
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
              >
                <defs>
                  <linearGradient
                    id="dag-chaos-grad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fb7185" />
                  </linearGradient>
                  <marker
                    id="dag-arrow-spine"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#64748b" />
                  </marker>
                  <marker
                    id="dag-arrow-cyan"
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
                    id="dag-arrow-clean"
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
                    id="dag-arrow-amber"
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
                    id="dag-arrow-chaos"
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
                    strokeWidth={item.dimmed ? 1.75 : 2.5}
                    strokeDasharray={item.edge.isBypass ? '6 4' : undefined}
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
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
              >
                {desktopSvg.edges.map((item) => {
                  if (!item.edge.conditionLabel) {
                    return null;
                  }
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
                      className={`absolute max-w-[168px] truncate rounded-full border px-2 py-0.5 text-center text-[10px] font-semibold shadow-sm transition-opacity duration-200 ${style.pillClass}`}
                    >
                      {item.edge.conditionLabel}
                    </span>
                  );
                })}
              </div>
            </>
          )}

          <div className="relative z-10 space-y-14">
            {CHAPTER_ORDER.map((chapterId) => {
              const chapterNode = getDagNodeById(chapterId)!;
              const isChapterOpen = expandedIds.has(chapterId);
              const visibleChildren = getChapterNodes(chapterId).filter(
                (child) => visibleNodeIds.has(child.id)
              );

              return (
                <section
                  key={`section-${chapterId}`}
                  aria-label={chapterNode.title}
                >
                  {renderChapterHeader(chapterNode, false)}

                  <div className="collapsible-panel" data-open={isChapterOpen}>
                    <div>
                      {visibleChildren.length > 0 && (
                        <div className="grid grid-cols-[repeat(5,minmax(0,1fr))] items-start gap-x-4 gap-y-16 pt-14">
                          {visibleChildren.map((child) =>
                            renderNodeCard(child, false)
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mobile Chronological DAG (< md) */}
      <section
        aria-label="Mobile chronological story decision tree"
        className="tree-dot-canvas rounded-2xl border border-white/[0.08] bg-surface/85 p-3.5 md:hidden"
      >
        <div ref={mobileContainerRef} className="relative pl-8">
          {mobileSvg.width > 0 && (
            <svg
              aria-hidden="true"
              width={mobileSvg.width}
              height={mobileSvg.height}
              viewBox={`0 0 ${mobileSvg.width} ${mobileSvg.height}`}
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            >
              <defs>
                <linearGradient
                  id="dag-m-chaos-grad"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
                <marker
                  id="dag-m-arrow-spine"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#64748b" />
                </marker>
                <marker
                  id="dag-m-arrow-cyan"
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
                  id="dag-m-arrow-clean"
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
                  id="dag-m-arrow-amber"
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
                  id="dag-m-arrow-chaos"
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
                const mobileMarker = item.markerEnd.replace(
                  'dag-arrow-',
                  'dag-m-arrow-'
                );
                const mobileStroke =
                  item.stroke === 'url(#dag-chaos-grad)'
                    ? 'url(#dag-m-chaos-grad)'
                    : item.stroke;
                return (
                  <path
                    key={`m-edge-${item.edge.id}`}
                    d={item.d}
                    fill="none"
                    stroke={mobileStroke}
                    strokeWidth={item.dimmed ? 1.5 : 2.25}
                    strokeDasharray={item.edge.isBypass ? '5 4' : undefined}
                    strokeLinecap="round"
                    markerEnd={mobileMarker}
                    style={{ opacity: item.dimmed ? 0.16 : 0.88 }}
                    className="transition-opacity duration-200"
                  />
                );
              })}
            </svg>
          )}

          <div className="relative z-10 space-y-5">
            {CHAPTER_ORDER.map((chapterId) => {
              const chapterNode = getDagNodeById(chapterId)!;
              const isChapterOpen = expandedIds.has(chapterId);
              const visibleChildren = getChapterNodes(chapterId).filter(
                (child) => visibleNodeIds.has(child.id)
              );

              return (
                <section
                  key={`m-section-${chapterId}`}
                  aria-label={chapterNode.title}
                >
                  {renderChapterHeader(chapterNode, true)}

                  <div className="collapsible-panel" data-open={isChapterOpen}>
                    <div>
                      {visibleChildren.length > 0 && (
                        <div className="space-y-3.5 pt-3.5">
                          {visibleChildren.map((child) =>
                            renderNodeCard(child, true)
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
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
            aria-labelledby="dag-drawer-title"
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
                      <span className="rounded-md border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                        {drawerNode.stageLabel}
                      </span>
                    )}

                    {drawerNode.splitVariable && (
                      <span className="rounded-md border border-cyan-400/45 bg-cyan-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-cyan-100">
                        SPLIT ON: {drawerNode.splitVariable}
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
                    id="dag-drawer-title"
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
                {/* Exact Conditions & What It Affects */}
                <div className="rounded-xl border border-white/[0.08] bg-canvas/70 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                    Exact Conditions &amp; Impact
                  </div>
                  <p className="mt-1.5 font-medium text-slate-200">
                    {drawerNode.unlockCondition}
                  </p>
                  {drawerNode.impactTags && drawerNode.impactTags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {drawerNode.impactTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-semibold text-cyan-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <ul className="mt-3 space-y-1.5 text-slate-300">
                    {drawerNode.requirements.map((req) => (
                      <li key={req} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Incoming Paths */}
                {drawerIncoming.length > 0 && (
                  <div className="rounded-xl border border-white/[0.08] bg-canvas/70 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {drawerIncoming.length > 1
                        ? `Incoming Paths (${drawerIncoming.length})`
                        : 'Incoming Path'}
                    </div>
                    <div className="mt-2 space-y-2">
                      {drawerIncoming.map((inEdge) => {
                        const parent = getDagNodeById(inEdge.from);
                        return (
                          <button
                            key={inEdge.id}
                            type="button"
                            onClick={() => setDrawerNodeId(inEdge.from)}
                            className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-cyan-400/50"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-white">
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

                {/* Outgoing Branches */}
                {drawerOutgoing.length > 0 && (
                  <div className="rounded-xl border border-white/[0.08] bg-canvas/70 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Downstream Branches ({drawerOutgoing.length})
                    </div>
                    <div className="mt-2 space-y-2">
                      {drawerOutgoing.map((outEdge) => {
                        const child = getDagNodeById(outEdge.to);
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

                {drawerNode.note && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-400/35 bg-amber-500/10 p-3.5 text-amber-100">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    <span>{drawerNode.note}</span>
                  </div>
                )}

                {/* Spoiler-Protected Consequences */}
                <div className="rounded-xl border border-white/[0.08] bg-canvas/70 p-4">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Plot-Sensitive Consequence
                  </div>
                  <SpoilerText
                    label={
                      drawerEnding
                        ? `${drawerEnding.code} ending outcome`
                        : 'Mission & story context'
                    }
                  >
                    {drawerNode.spoilerContext}
                  </SpoilerText>
                </div>

                {/* Completion Toggle & Simulator Jump */}
                {drawerEnding || drawerBonusTarget ? (
                  <div className="space-y-2.5 pt-1">
                    {(() => {
                      const targetEnding = drawerEnding ?? drawerBonusTarget!;
                      const done = completedSet.has(targetEnding.id);
                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => onToggleEnding(targetEnding.id)}
                            className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tabular-nums transition ${
                              done
                                ? 'border border-emerald-400/50 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20'
                                : 'bg-white text-slate-950 shadow-sm hover:bg-cyan-100'
                            }`}
                          >
                            {done ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                Marked as Completed ({targetEnding.code})
                              </>
                            ) : (
                              <>
                                <Circle className="h-4 w-4" />
                                Mark {targetEnding.code} Completed
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDrawerNodeId(null);
                              onInspectEnding(targetEnding.id);
                            }}
                            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/10"
                          >
                            <Compass className="h-4 w-4 text-cyan-400" />
                            Simulate {targetEnding.code} in Ending Navigator
                          </button>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/[0.08] bg-canvas/70 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Reachable Endings ({drawerNode.reachableEndings.length})
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
