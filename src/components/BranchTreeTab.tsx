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
  Anchor,
  ArrowRight,
  CheckCircle2,
  Circle,
  Compass,
  GitBranch,
  Lock,
  PanelBottomOpen,
  RotateCw,
  Shield,
  X,
} from 'lucide-react';
import {
  BRANCH_EDGES,
  BRANCH_FILTERS,
  BRANCH_NODES,
  ENDING_CLUSTERS,
  SAFETY_RAIL_NODES,
} from '../data/branchGraph';
import { getEndingById } from '../data/endings';
import { getSlotById } from '../data/saveSlots';
import type {
  BranchEdge,
  BranchNode,
  BranchPathFilter,
  EndingId,
  SaveSlotItem,
} from '../types/tracker';
import { SpoilerText } from './SpoilerText';

interface BranchTreeTabProps {
  checkedSlots: string[];
  completedEndings: string[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onToggleSlot: (slotId: string) => void;
  onInspectEnding: (endingId: EndingId) => void;
}

interface SvgEdgeRender {
  id: string;
  d: string;
  stroke: string;
  markerEnd: string;
  dimmed: boolean;
}

function getEdgeStrokeAndMarker(kind: BranchEdge['kind']): {
  stroke: string;
  markerEnd: string;
} {
  switch (kind) {
    case 'clean':
      return { stroke: '#34d399', markerEnd: 'url(#tree-arrow-clean)' };
    case 'chaos':
      return {
        stroke: 'url(#tree-chaos-grad)',
        markerEnd: 'url(#tree-arrow-chaos)',
      };
    case 'spine':
    default:
      return { stroke: '#22d3ee', markerEnd: 'url(#tree-arrow-spine)' };
  }
}

function computeVerticalTreeEdgePath(
  edge: BranchEdge,
  fromRect: DOMRect,
  toRect: DOMRect,
  containerRect: DOMRect
): string {
  const from = {
    left: fromRect.left - containerRect.left,
    right: fromRect.right - containerRect.left,
    top: fromRect.top - containerRect.top,
    bottom: fromRect.bottom - containerRect.top,
    cx: fromRect.left - containerRect.left + fromRect.width / 2,
    cy: fromRect.top - containerRect.top + fromRect.height / 2,
  };
  const to = {
    left: toRect.left - containerRect.left,
    right: toRect.right - containerRect.left,
    top: toRect.top - containerRect.top,
    bottom: toRect.bottom - containerRect.top,
    cx: toRect.left - containerRect.left + toRect.width / 2,
    cy: toRect.top - containerRect.top + toRect.height / 2,
  };

  if (edge.routeStyle === 'vertical-trunk') {
    const startX = from.cx;
    const startY = from.bottom + 2;
    const endX = to.cx;
    const endY = to.top - 5;
    const midY = (startY + endY) / 2;
    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  }

  if (edge.routeStyle === 'fork-curve-long') {
    const startX = from.right + 2;
    const startY = from.cy;
    const endX = to.cx;
    const endY = to.top - 5;
    return `M ${startX} ${startY} C ${endX} ${startY}, ${endX} ${startY + 72}, ${endX} ${endY}`;
  }

  // 'fork-curve-right' (Slot 8 -> Slot 10)
  const startX = from.right + 2;
  const startY = from.cy;
  const endX = to.left - 5;
  const endY = to.cy;
  const midX = (startX + endX) / 2;
  return `M ${startX} ${startY} C ${midX + 14} ${startY}, ${midX - 14} ${endY}, ${endX} ${endY}`;
}

interface NodeDetailContentProps {
  slot: SaveSlotItem;
  isChecked: boolean;
  upstreamNodes: BranchNode[];
  downstreamNodes: BranchNode[];
  onSelectNode: (id: string) => void;
  onToggleSlot: (id: string) => void;
  onInspectEnding: (endingId: EndingId) => void;
}

function NodeDetailContent({
  slot,
  isChecked,
  upstreamNodes,
  downstreamNodes,
  onSelectNode,
  onToggleSlot,
  onInspectEnding,
}: NodeDetailContentProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-md border border-cyan-400/35 bg-canvas px-2.5 py-0.5 font-mono text-xs font-bold tabular-nums text-cyan-200">
            {slot.slotLabel}
          </span>
          {slot.isAnchor && (
            <span className="inline-flex items-center gap-1 rounded-md border border-cyan-400/45 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-cyan-100">
              <Anchor className="h-3 w-3 text-cyan-300" />
              ANCHOR
            </span>
          )}
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-semibold text-slate-300">
            {slot.badge}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {slot.chapterLabel}
          </span>
        </div>
        <h3 className="font-display text-lg font-bold leading-snug text-white">
          {slot.title}
        </h3>
      </div>

      <dl className="space-y-2.5 rounded-xl border border-white/[0.07] bg-canvas/70 p-3.5 text-xs leading-relaxed">
        <div>
          <dt className="font-semibold text-slate-200">Save Timing:</dt>
          <dd className="mt-0.5 text-slate-300">{slot.whenToSave}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Exact Rule:</dt>
          <dd className="mt-0.5 text-slate-300">{slot.whyItMatters}</dd>
        </div>
        <div className="pt-1">
          <SpoilerText label="Story & mission context">
            {slot.spoilerContext}
          </SpoilerText>
        </div>
      </dl>

      {(upstreamNodes.length > 0 || downstreamNodes.length > 0) && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/[0.07] bg-canvas/70 p-3.5 text-xs">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Upstream
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {upstreamNodes.length > 0 ? (
                upstreamNodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => onSelectNode(node.id)}
                    className="min-h-9 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-slate-200 transition hover:border-cyan-400/50"
                  >
                    {node.label}
                  </button>
                ))
              ) : (
                <span className="text-slate-500">Campaign start</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Downstream
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {downstreamNodes.length > 0 ? (
                downstreamNodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => onSelectNode(node.id)}
                    className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-cyan-200 transition hover:border-cyan-400/50"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {node.label}
                  </button>
                ))
              ) : (
                <span className="text-slate-500">Branch finale</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/[0.07] bg-canvas/70 p-3.5 text-xs">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Reachable Endings
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {slot.recommendedEndings.map((endingId) => (
            <button
              key={endingId}
              type="button"
              onClick={() => onInspectEnding(endingId)}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tabular-nums text-slate-200 transition hover:border-cyan-400/60 hover:text-cyan-200"
            >
              <Compass className="h-3 w-3 text-cyan-400" />
              {endingId}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onToggleSlot(slot.id)}
        className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
          isChecked
            ? 'border border-emerald-400/45 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20'
            : 'bg-white text-slate-950 shadow-sm hover:bg-cyan-100'
        }`}
      >
        {isChecked ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Checkpoint Secured
          </>
        ) : (
          <>
            <Circle className="h-4 w-4" />
            Mark {slot.slotLabel} Secured
          </>
        )}
      </button>
    </div>
  );
}

export function BranchTreeTab({
  checkedSlots,
  completedEndings,
  selectedNodeId,
  onSelectNode,
  onToggleSlot,
  onInspectEnding,
}: BranchTreeTabProps) {
  const [activeFilter, setActiveFilter] = useState<BranchPathFilter>('all');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [svgState, setSvgState] = useState<{
    width: number;
    height: number;
    edges: SvgEdgeRender[];
  }>({ width: 0, height: 0, edges: [] });

  const checkedSet = useMemo(() => new Set(checkedSlots), [checkedSlots]);
  const completedEndingSet = useMemo(
    () => new Set(completedEndings),
    [completedEndings]
  );

  const setNodeRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) {
        nodeRefs.current.set(id, el);
      } else {
        nodeRefs.current.delete(id);
      }
    },
    []
  );

  const measureEdges = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) {
      return;
    }

    const computed: SvgEdgeRender[] = [];
    for (const edge of BRANCH_EDGES) {
      const fromEl = nodeRefs.current.get(edge.from);
      const toEl = nodeRefs.current.get(edge.to);
      if (!fromEl || !toEl) {
        continue;
      }
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      const d = computeVerticalTreeEdgePath(
        edge,
        fromRect,
        toRect,
        containerRect
      );
      const { stroke, markerEnd } = getEdgeStrokeAndMarker(edge.kind);
      const dimmed =
        activeFilter !== 'all' && !edge.paths.includes(activeFilter);

      computed.push({
        id: edge.id,
        d,
        stroke,
        markerEnd,
        dimmed,
      });
    }

    setSvgState({
      width: containerRect.width,
      height: containerRect.height,
      edges: computed,
    });
  }, [activeFilter]);

  useLayoutEffect(() => {
    measureEdges();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(() => {
      measureEdges();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [measureEdges, checkedSlots, selectedNodeId]);

  useEffect(() => {
    if (!mobileDrawerOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen]);

  const selectedSlot =
    getSlotById(selectedNodeId) ??
    getSlotById('slot-8') ??
    getSlotById('slot-1')!;

  const upstreamNodes = useMemo(
    () =>
      BRANCH_EDGES.filter((edge) => edge.to === selectedSlot.id)
        .map((edge) => BRANCH_NODES.find((node) => node.id === edge.from))
        .filter((node): node is BranchNode => Boolean(node)),
    [selectedSlot.id]
  );

  const downstreamNodes = useMemo(
    () =>
      BRANCH_EDGES.filter((edge) => edge.from === selectedSlot.id)
        .map((edge) => BRANCH_NODES.find((node) => node.id === edge.to))
        .filter((node): node is BranchNode => Boolean(node)),
    [selectedSlot.id]
  );

  const currentFilterMeta =
    BRANCH_FILTERS.find((item) => item.id === activeFilter) ??
    BRANCH_FILTERS[0]!;

  const handleSelectTreeOrSafetyNode = (
    id: string,
    openDrawerOnMobile = false
  ) => {
    onSelectNode(id);
    if (openDrawerOnMobile) {
      setMobileDrawerOpen(true);
    }
  };

  const mainSpineNodes = BRANCH_NODES.filter(
    (node) => node.lane === 'spine' || node.lane === 'clean'
  );
  const chaosForkNode = BRANCH_NODES.find((node) => node.id === 'slot-10');
  const routeACluster = ENDING_CLUSTERS.find(
    (c) => c.id === 'route-a-endings'
  )!;
  const routeBCluster = ENDING_CLUSTERS.find(
    (c) => c.id === 'route-b-endings'
  )!;

  return (
    <div className="space-y-6">
      {/* Editorial Header & 4 Refined Filter Pills */}
      <section className="surface-card rounded-2xl border border-white/[0.08] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 shrink-0 text-cyan-400" />
              <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                15-Slot Anchor &amp; Branch Tree
              </h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
              {currentFilterMeta.description}
            </p>
          </div>

          <div
            role="group"
            aria-label="Branch path filters"
            className="flex shrink-0 flex-wrap gap-2"
          >
            {BRANCH_FILTERS.map((filter) => {
              const active = activeFilter === filter.id;
              let activeStyle =
                'border-cyan-400/70 bg-cyan-500/18 text-cyan-100 shadow-[0_0_18px_-6px_rgba(34,211,238,0.55)]';
              if (active && filter.id === 'clean-run') {
                activeStyle =
                  'border-emerald-400/70 bg-emerald-500/18 text-emerald-100 shadow-[0_0_18px_-6px_rgba(52,211,153,0.55)]';
              } else if (active && filter.id === 'chaos-run') {
                activeStyle =
                  'border-rose-400/70 bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-rose-100 shadow-[0_0_18px_-6px_rgba(251,113,133,0.55)]';
              } else if (active && filter.id === 'safety-loop') {
                activeStyle =
                  'border-amber-400/70 bg-amber-500/18 text-amber-100 shadow-[0_0_18px_-6px_rgba(251,191,36,0.55)]';
              }

              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`min-h-11 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition ${
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
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.07] pt-3.5 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30" />
            Anchor Points (1, 4, 6, 8, 9)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Clean Run → Route A
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-400" />
            Chaos / Alt Fork → Route B
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-dashed border-amber-400 bg-amber-400/20" />
            Active Safety Rail (11–15)
          </span>
        </div>
      </section>

      {/* Main 12-Column Responsive Layout */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Active Safety Rail + Desktop Sticky Detail Panel */}
        <aside className="min-w-0 space-y-5 lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:sticky lg:top-20">
          <section
            aria-label="Active Safety Rail"
            className={`rounded-2xl border border-dashed p-4 transition duration-200 ${
              activeFilter === 'clean-run' || activeFilter === 'chaos-run'
                ? 'border-amber-400/25 bg-surface/50 opacity-30'
                : activeFilter === 'safety-loop'
                  ? 'border-amber-400/75 bg-amber-950/20 ring-1 ring-amber-400/30'
                  : 'border-amber-400/40 bg-surface/80'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <h3 className="font-display text-sm font-bold text-white">
                  Active Safety Rail
                </h3>
              </div>
              <span className="rounded-full border border-dashed border-amber-400/45 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                Protects Active Run
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Dedicated backup slots that protect your live progress—kept
              separate from story branch wiring.
            </p>

            <div className="mt-3 space-y-2.5">
              {SAFETY_RAIL_NODES.map((node) => {
                const isSelected = selectedSlot.id === node.slotId;
                const isChecked = checkedSet.has(node.slotId);
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => handleSelectTreeOrSafetyNode(node.slotId, true)}
                    className={`flex min-h-11 w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-amber-400/80 bg-white/[0.06] ring-1 ring-amber-400/35'
                        : 'border-white/[0.08] bg-canvas/60 hover:border-amber-400/45'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded bg-canvas px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-amber-300 ring-1 ring-amber-500/35">
                          {node.label}
                        </span>
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
                          {node.ruleTag}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">
                        {node.shortTitle}
                      </div>
                      <div className="text-[11px] leading-snug text-slate-400">
                        {node.subtitle}
                      </div>
                    </div>

                    {isChecked ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    ) : node.slotId === 'slot-15' ? (
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    ) : (
                      <RotateCw className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Desktop Sticky Detail Panel */}
          <section
            aria-label="Selected slot details"
            className="surface-card hidden rounded-2xl border border-cyan-400/30 p-5 lg:block"
          >
            <NodeDetailContent
              slot={selectedSlot}
              isChecked={checkedSet.has(selectedSlot.id)}
              upstreamNodes={upstreamNodes}
              downstreamNodes={downstreamNodes}
              onSelectNode={(id) => handleSelectTreeOrSafetyNode(id, false)}
              onToggleSlot={onToggleSlot}
              onInspectEnding={onInspectEnding}
            />
          </section>
        </aside>

        {/* Left Vertical Git-Graph Tree (Desktop + Mobile) */}
        <div className="min-w-0 lg:col-span-8 lg:col-start-1 lg:row-start-1">
          {/* Mobile quick bar to reopen detail drawer */}
          <div className="surface-card mb-3 flex items-center justify-between gap-2 rounded-xl border border-cyan-400/30 px-3.5 py-2.5 lg:hidden">
            <div className="min-w-0 text-xs">
              <span className="text-slate-400">Selected: </span>
              <span className="font-mono font-bold tabular-nums text-cyan-200">
                {selectedSlot.slotLabel}
              </span>
              <span className="ml-1.5 truncate text-slate-300">
                · {selectedSlot.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-3 py-2 text-xs font-bold text-cyan-200"
            >
              <PanelBottomOpen className="h-3.5 w-3.5" />
              Details
            </button>
          </div>

          {/* Desktop Vertical Git-Graph (CSS Grid + Inline Cubic Bezier SVG) */}
          <section
            aria-label="Vertical save branch tree"
            className="tree-dot-canvas hidden rounded-2xl border border-white/[0.08] bg-surface/85 p-6 shadow-xl shadow-black/30 md:block"
          >
            <div className="mb-5 grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-x-10 border-b border-white/[0.08] pb-3.5 text-[11px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2 text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Main Spine (Slots 1–9) &amp; Clean Fork
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-400" />
                Chaos / Alternate Fork
              </div>
            </div>

            <div ref={containerRef} className="relative">
              {svgState.width > 0 && (
                <svg
                  aria-hidden="true"
                  width={svgState.width}
                  height={svgState.height}
                  viewBox={`0 0 ${svgState.width} ${svgState.height}`}
                  className="pointer-events-none absolute inset-0 z-0 overflow-visible"
                >
                  <defs>
                    <linearGradient
                      id="tree-chaos-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#fb7185" />
                    </linearGradient>
                    <marker
                      id="tree-arrow-spine"
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
                      id="tree-arrow-clean"
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
                      id="tree-arrow-chaos"
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

                  {svgState.edges.map((edge) => (
                    <path
                      key={edge.id}
                      d={edge.d}
                      fill="none"
                      stroke={edge.stroke}
                      strokeWidth={edge.dimmed ? 2 : 3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd={edge.markerEnd}
                      style={{ opacity: edge.dimmed ? 0.16 : 0.92 }}
                      className="transition-opacity duration-200"
                    />
                  ))}
                </svg>
              )}

              <div className="relative z-10 grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-x-10 gap-y-5">
                {BRANCH_NODES.map((node) => {
                  const isSelected = selectedSlot.id === node.slotId;
                  const isChecked = checkedSet.has(node.slotId);
                  const isDimmed =
                    activeFilter !== 'all' && !node.paths.includes(activeFilter);

                  let cardAppearance =
                    'w-[88%] mx-auto min-h-[60px] px-3.5 py-2.5 border border-white/[0.1] bg-[#101626]/95 hover:border-cyan-400/50';
                  let slotBadgeStyle =
                    'border-cyan-400/35 bg-cyan-500/10 text-cyan-200';

                  if (node.lane === 'clean') {
                    cardAppearance =
                      'w-full min-h-[84px] p-4 border-2 border-emerald-400/65 bg-[#101926]/95 ring-1 ring-emerald-400/20 shadow-[0_0_26px_-12px_rgba(52,211,153,0.5)]';
                    slotBadgeStyle =
                      'border-emerald-400/45 bg-emerald-500/15 text-emerald-200';
                  } else if (node.lane === 'chaos') {
                    cardAppearance =
                      'w-full min-h-[84px] p-4 border-2 border-rose-400/65 bg-[#191321]/95 ring-1 ring-amber-400/20 shadow-[0_0_26px_-12px_rgba(251,113,133,0.45)]';
                    slotBadgeStyle =
                      'border-rose-400/45 bg-rose-500/15 text-rose-200';
                  } else if (node.isAnchor) {
                    cardAppearance =
                      'w-full min-h-[84px] p-4 border-2 border-cyan-400/70 bg-[#101829]/95 ring-1 ring-cyan-400/25 shadow-[0_0_28px_-12px_rgba(34,211,238,0.55)]';
                    slotBadgeStyle =
                      'border-cyan-400/50 bg-cyan-500/18 text-cyan-100';
                  }

                  return (
                    <button
                      key={node.id}
                      ref={setNodeRef(node.id)}
                      type="button"
                      onClick={() =>
                        handleSelectTreeOrSafetyNode(node.slotId, true)
                      }
                      style={{
                        gridColumnStart: node.gridCol,
                        gridRowStart: node.gridRow,
                      }}
                      className={`group flex flex-col justify-between rounded-xl text-left transition duration-200 ${cardAppearance} ${
                        isSelected ? 'ring-2 ring-white/85' : ''
                      } ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${slotBadgeStyle}`}
                          >
                            {node.label}
                          </span>
                          {node.isAnchor && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-cyan-400/45 bg-cyan-500/18 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-cyan-100">
                              <Anchor className="h-3 w-3 text-cyan-300" />
                              ANCHOR
                            </span>
                          )}
                          {node.lane === 'chaos' && (
                            <span className="rounded-md border border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                              Route B Branch
                            </span>
                          )}
                        </div>

                        {isChecked ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-slate-400" />
                        )}
                      </div>

                      <div
                        className={
                          node.isAnchor || node.lane === 'chaos'
                            ? 'mt-2'
                            : 'mt-1.5'
                        }
                      >
                        <div
                          className={`font-display font-bold leading-snug text-white ${
                            node.isAnchor || node.lane === 'chaos'
                              ? 'text-sm'
                              : 'text-xs'
                          }`}
                        >
                          {node.shortTitle}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {node.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Terminal Ending Cluster Cards */}
                {ENDING_CLUSTERS.map((cluster) => {
                  const isDimmed =
                    activeFilter !== 'all' &&
                    !cluster.paths.includes(activeFilter);
                  const isClean = cluster.lane === 'clean';

                  return (
                    <div
                      key={cluster.id}
                      ref={setNodeRef(cluster.id)}
                      style={{
                        gridColumnStart: cluster.gridCol,
                        gridRowStart: cluster.gridRow,
                      }}
                      className={`rounded-xl border p-4 transition duration-200 ${
                        isClean
                          ? 'border-emerald-400/45 bg-emerald-950/25'
                          : 'border-rose-400/45 bg-rose-950/25'
                      } ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
                    >
                      <div
                        className={`font-display text-xs font-extrabold uppercase tracking-wider ${
                          isClean ? 'text-emerald-300' : 'text-rose-300'
                        }`}
                      >
                        {cluster.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cluster.subtitle}
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {cluster.endingIds.map((endingId) => {
                          const ending = getEndingById(endingId);
                          const done = completedEndingSet.has(endingId);
                          return (
                            <button
                              key={endingId}
                              type="button"
                              onClick={() => onInspectEnding(endingId)}
                              title={`${ending.code}: ${ending.name}`}
                              className={`inline-flex min-h-9 items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold tabular-nums transition ${
                                done
                                  ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100'
                                  : isClean
                                    ? 'border-emerald-400/35 bg-canvas/80 text-emerald-200 hover:border-emerald-400'
                                    : 'border-rose-400/35 bg-canvas/80 text-rose-200 hover:border-amber-400'
                              }`}
                            >
                              {done && (
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              )}
                              {ending.code}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Mobile Single-Column Vertical Flow (<md) */}
          <section
            aria-label="Mobile save branch timeline"
            className="surface-card space-y-6 rounded-2xl border border-white/[0.08] p-4 md:hidden"
          >
            <div>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Main Spine (Slots 1–9) &amp; Clean Fork
              </div>

              <div className="relative space-y-2.5 pl-6 before:absolute before:bottom-4 before:left-2.5 before:top-4 before:w-0.5 before:bg-gradient-to-b before:from-cyan-400 before:via-cyan-400 before:to-emerald-400">
                {mainSpineNodes.map((node) => {
                  const isSelected = selectedSlot.id === node.slotId;
                  const isChecked = checkedSet.has(node.slotId);
                  const isDimmed =
                    activeFilter !== 'all' && !node.paths.includes(activeFilter);
                  const isClean = node.lane === 'clean';

                  return (
                    <div
                      key={node.id}
                      className={`relative transition ${
                        isDimmed ? 'opacity-25' : 'opacity-100'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute top-5 rounded-full ring-4 ring-surface ${
                          node.isAnchor
                            ? '-left-[21px] h-3.5 w-3.5'
                            : '-left-[19px] h-2.5 w-2.5'
                        } ${isClean ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectTreeOrSafetyNode(node.slotId, true)
                        }
                        className={`min-h-11 w-full rounded-xl text-left transition ${
                          node.isAnchor
                            ? isClean
                              ? 'border-2 border-emerald-400/65 bg-surface-elevated p-3.5 ring-1 ring-emerald-400/20'
                              : 'border-2 border-cyan-400/70 bg-surface-elevated p-3.5 ring-1 ring-cyan-400/25'
                            : 'border border-white/[0.08] bg-canvas/70 px-3 py-2.5'
                        } ${isSelected ? 'ring-2 ring-white/80' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${
                                isClean
                                  ? 'border-emerald-400/45 bg-emerald-500/15 text-emerald-200'
                                  : 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200'
                              }`}
                            >
                              {node.label}
                            </span>
                            {node.isAnchor && (
                              <span className="inline-flex items-center gap-1 rounded border border-cyan-400/45 bg-cyan-500/18 px-1.5 py-0.5 text-[10px] font-extrabold text-cyan-100">
                                <Anchor className="h-2.5 w-2.5 text-cyan-300" />
                                ANCHOR
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">
                              Ch. {node.chapter}
                            </span>
                          </div>
                          {isChecked ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-slate-600" />
                          )}
                        </div>
                        <div className="mt-1.5 font-display text-sm font-bold text-white">
                          {node.shortTitle}
                        </div>
                        <div className="text-xs text-slate-400">
                          {node.subtitle}
                        </div>
                      </button>
                    </div>
                  );
                })}

                <div
                  className={`relative transition ${
                    activeFilter !== 'all' &&
                    !routeACluster.paths.includes(activeFilter)
                      ? 'opacity-25'
                      : 'opacity-100'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -left-[20px] top-4 h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-surface"
                  />
                  <div className="rounded-xl border border-emerald-400/45 bg-emerald-950/20 p-3.5">
                    <div className="font-display text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                      {routeACluster.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {routeACluster.subtitle}
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {routeACluster.endingIds.map((endingId) => {
                        const ending = getEndingById(endingId);
                        const done = completedEndingSet.has(endingId);
                        return (
                          <button
                            key={endingId}
                            type="button"
                            onClick={() => onInspectEnding(endingId)}
                            className={`inline-flex min-h-11 items-center gap-1 rounded-lg border px-3 py-1.5 font-mono text-xs font-bold tabular-nums ${
                              done
                                ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100'
                                : 'border-emerald-400/35 bg-canvas text-emerald-200'
                            }`}
                          >
                            {done && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            )}
                            {ending.code}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {chaosForkNode && (
              <div className="border-t border-white/[0.08] pt-5">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-rose-300">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-400" />
                  Chaos / Alternate Fork (From Slot 6 &amp; Slot 8)
                </div>

                <div className="relative space-y-2.5 pl-6 before:absolute before:bottom-4 before:left-2.5 before:top-4 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:to-rose-500">
                  <div
                    className={`relative transition ${
                      activeFilter !== 'all' &&
                      !chaosForkNode.paths.includes(activeFilter)
                        ? 'opacity-25'
                        : 'opacity-100'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-[20px] top-5 h-3 w-3 rounded-full bg-amber-400 ring-4 ring-surface"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectTreeOrSafetyNode(chaosForkNode.slotId, true)
                      }
                      className={`min-h-11 w-full rounded-xl border-2 border-rose-400/65 bg-surface-elevated p-3.5 text-left transition ${
                        selectedSlot.id === chaosForkNode.slotId
                          ? 'ring-2 ring-white/80'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded border border-rose-400/45 bg-rose-500/15 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-rose-200">
                            {chaosForkNode.label}
                          </span>
                          <span className="text-[11px] font-semibold text-amber-200">
                            {chaosForkNode.mobileBranchTag}
                          </span>
                        </div>
                        {checkedSet.has(chaosForkNode.slotId) ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-slate-600" />
                        )}
                      </div>
                      <div className="mt-1.5 font-display text-sm font-bold text-white">
                        {chaosForkNode.shortTitle}
                      </div>
                      <div className="text-xs text-slate-400">
                        {chaosForkNode.subtitle}
                      </div>
                    </button>
                  </div>

                  <div
                    className={`relative transition ${
                      activeFilter !== 'all' &&
                      !routeBCluster.paths.includes(activeFilter)
                        ? 'opacity-25'
                        : 'opacity-100'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-[20px] top-4 h-3 w-3 rounded-full bg-rose-400 ring-4 ring-surface"
                    />
                    <div className="rounded-xl border border-rose-400/45 bg-rose-950/20 p-3.5">
                      <div className="font-display text-xs font-extrabold uppercase tracking-wider text-rose-300">
                        {routeBCluster.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {routeBCluster.subtitle}
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {routeBCluster.endingIds.map((endingId) => {
                          const ending = getEndingById(endingId);
                          const done = completedEndingSet.has(endingId);
                          return (
                            <button
                              key={endingId}
                              type="button"
                              onClick={() => onInspectEnding(endingId)}
                              className={`inline-flex min-h-11 items-center gap-1 rounded-lg border px-3 py-1.5 font-mono text-xs font-bold tabular-nums ${
                                done
                                  ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100'
                                  : 'border-rose-400/35 bg-canvas text-rose-200'
                              }`}
                            >
                              {done && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              )}
                              {ending.code}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Slide-Up Detail Drawer (<lg) */}
      {mobileDrawerOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Slot detail drawer"
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-md lg:hidden"
            onClick={() => setMobileDrawerOpen(false)}
          >
            <div
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border-t border-cyan-400/40 bg-[#101626] p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Checkpoint Details
                </span>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close detail drawer"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NodeDetailContent
                slot={selectedSlot}
                isChecked={checkedSet.has(selectedSlot.id)}
                upstreamNodes={upstreamNodes}
                downstreamNodes={downstreamNodes}
                onSelectNode={(id) => handleSelectTreeOrSafetyNode(id, true)}
                onToggleSlot={onToggleSlot}
                onInspectEnding={(endingId) => {
                  setMobileDrawerOpen(false);
                  onInspectEnding(endingId);
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
