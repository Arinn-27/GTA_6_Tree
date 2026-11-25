import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Compass,
  GitBranch,
  Lock,
  RotateCw,
} from 'lucide-react';
import {
  BRANCH_EDGES,
  BRANCH_FILTERS,
  BRANCH_NODES,
} from '../data/branchGraph';
import { getSlotById } from '../data/saveSlots';
import type {
  BranchEdge,
  BranchLane,
  BranchNode,
  BranchPathFilter,
  EndingId,
} from '../types/tracker';
import { SpoilerText } from './SpoilerText';

interface BranchTreeTabProps {
  checkedSlots: string[];
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
  dashed: boolean;
  dimmed: boolean;
  label?: string;
  labelX?: number;
  labelY?: number;
}

const LANE_COLORS: Record<
  BranchLane,
  { stroke: string; marker: string; badge: string; ring: string }
> = {
  spine: {
    stroke: '#22d3ee',
    marker: 'url(#arrow-spine)',
    badge: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200',
    ring: 'border-cyan-400/50',
  },
  clean: {
    stroke: '#34d399',
    marker: 'url(#arrow-clean)',
    badge: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    ring: 'border-emerald-400/60',
  },
  chaos: {
    stroke: '#fb7185',
    marker: 'url(#arrow-chaos)',
    badge: 'border-rose-500/40 bg-rose-500/15 text-rose-200',
    ring: 'border-rose-400/60',
  },
  workspace: {
    stroke: '#fbbf24',
    marker: 'url(#arrow-workspace)',
    badge: 'border-amber-500/40 bg-amber-500/15 text-amber-200',
    ring: 'border-amber-400/50',
  },
  lock: {
    stroke: '#a78bfa',
    marker: 'url(#arrow-lock)',
    badge: 'border-violet-500/40 bg-violet-500/15 text-violet-200',
    ring: 'border-violet-400/50',
  },
};

function computeEdgePath(
  edge: BranchEdge,
  fromRect: DOMRect,
  toRect: DOMRect,
  containerRect: DOMRect
): Pick<SvgEdgeRender, 'd' | 'labelX' | 'labelY'> {
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

  if (edge.routeStyle === 'straight-h') {
    const startX = from.right + 2;
    const endX = to.left - 4;
    const midY = (from.cy + to.cy) / 2;
    return {
      d: `M ${startX} ${from.cy} C ${(startX + endX) / 2} ${from.cy}, ${(startX + endX) / 2} ${to.cy}, ${endX} ${to.cy}`,
      labelX: (startX + endX) / 2,
      labelY: midY - 10,
    };
  }

  if (edge.routeStyle === 'row1-to-row2-elbow') {
    const midGutterY = (from.bottom + to.top) / 2;
    const r = 12;
    const startX = from.cx;
    const startY = from.bottom + 2;
    const endX = to.cx;
    const endY = to.top - 4;
    const d = [
      `M ${startX} ${startY}`,
      `L ${startX} ${midGutterY - r}`,
      `Q ${startX} ${midGutterY} ${startX - r} ${midGutterY}`,
      `L ${endX + r} ${midGutterY}`,
      `Q ${endX} ${midGutterY} ${endX} ${midGutterY + r}`,
      `L ${endX} ${endY}`,
    ].join(' ');
    return {
      d,
      labelX: (startX + endX) / 2,
      labelY: midGutterY - 8,
    };
  }

  if (edge.routeStyle === 'chaos-arc') {
    const startX = from.cx;
    const startY = from.bottom + 2;
    const endX = to.left - 4;
    const endY = to.cy + (edge.from === 'slot-6' ? 8 : -8);
    const gutterY = to.top - 22;
    const d =
      edge.from === 'slot-6'
        ? `M ${startX} ${startY} C ${startX} ${gutterY}, ${to.left - 60} ${endY}, ${endX} ${endY}`
        : `M ${startX} ${startY} C ${startX} ${gutterY}, ${endX - 36} ${endY}, ${endX} ${endY}`;
    return {
      d,
      labelX:
        edge.from === 'slot-6' ? (startX + endX) / 2 - 20 : (startX + endX) / 2,
      labelY: edge.from === 'slot-6' ? endY - 10 : gutterY + 6,
    };
  }

  if (edge.routeStyle === 'workspace-dash') {
    const startX =
      edge.from === 'slots-11-14' && edge.to === 'slot-6'
        ? from.left + fromRect.width * 0.28
        : from.left + fromRect.width * 0.72;
    const startY = from.top - 2;
    const endX = to.cx - (edge.to === 'slot-8' ? 14 : 0);
    const endY = to.bottom + 4;
    return {
      d: `M ${startX} ${startY} C ${startX} ${(startY + endY) / 2}, ${endX} ${(startY + endY) / 2}, ${endX} ${endY}`,
      labelX: (startX + endX) / 2,
      labelY: (startY + endY) / 2,
    };
  }

  // lock-curve (e.g. slot-10 -> slot-15)
  const startX = from.right + 2;
  const startY = from.cy;
  const endX = to.cx;
  const endY = to.bottom + 4;
  return {
    d: `M ${startX} ${startY} C ${endX} ${startY}, ${endX} ${endY + 24}, ${endX} ${endY}`,
    labelX: (startX + endX) / 2 + 12,
    labelY: startY - 8,
  };
}

export function BranchTreeTab({
  checkedSlots,
  selectedNodeId,
  onSelectNode,
  onToggleSlot,
  onInspectEnding,
}: BranchTreeTabProps) {
  const [activeFilter, setActiveFilter] = useState<BranchPathFilter>('all');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [svgState, setSvgState] = useState<{
    width: number;
    height: number;
    edges: SvgEdgeRender[];
  }>({ width: 0, height: 0, edges: [] });

  const checkedSet = useMemo(() => new Set(checkedSlots), [checkedSlots]);

  const setNodeRef = useCallback(
    (id: string) => (el: HTMLButtonElement | null) => {
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
      const pathInfo = computeEdgePath(edge, fromRect, toRect, containerRect);
      const laneTheme = LANE_COLORS[edge.kind];
      const dimmed =
        activeFilter !== 'all' && !edge.paths.includes(activeFilter);

      computed.push({
        id: edge.id,
        d: pathInfo.d,
        stroke: laneTheme.stroke,
        markerEnd: laneTheme.marker,
        dashed: Boolean(edge.dashed),
        dimmed,
        label: edge.label,
        labelX: pathInfo.labelX,
        labelY: pathInfo.labelY,
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
  }, [measureEdges]);

  const selectedNode: BranchNode =
    BRANCH_NODES.find((node) => node.id === selectedNodeId) ?? BRANCH_NODES[0]!;
  const selectedSlot = getSlotById(selectedNode.slotId);
  const upstreamNodes = BRANCH_EDGES.filter(
    (edge) => edge.to === selectedNode.id
  )
    .map((edge) => BRANCH_NODES.find((node) => node.id === edge.from))
    .filter((node): node is BranchNode => Boolean(node));
  const downstreamNodes = BRANCH_EDGES.filter(
    (edge) => edge.from === selectedNode.id
  )
    .map((edge) => BRANCH_NODES.find((node) => node.id === edge.to))
    .filter((node): node is BranchNode => Boolean(node));

  const currentFilterMeta =
    BRANCH_FILTERS.find((item) => item.id === activeFilter) ??
    BRANCH_FILTERS[0]!;

  return (
    <div className="space-y-6">
      {/* Header & 4 Path Filters */}
      <section className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white sm:text-xl">
                15-Slot Save Branch Navigator
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              {currentFilterMeta.description}
            </p>
          </div>

          <div
            role="group"
            aria-label="Branch path filters"
            className="flex flex-wrap gap-1.5"
          >
            {BRANCH_FILTERS.map((filter) => {
              const active = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'border border-slate-700 bg-canvas text-slate-300 hover:border-cyan-500/50 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border-subtle/70 pt-3 text-[11px] text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            Main Spine (1–8)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Clean Run (8→9)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            Chaos Run (6 or 8→10)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Rolling FIFO (11–14)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
            Main Run Lock (15)
          </span>
        </div>
      </section>

      {/* Desktop Directed Graph: CSS Grid + Inline SVG Connectors (Zero Graph Libraries) */}
      <section className="hidden rounded-2xl border border-border-subtle bg-surface p-6 md:block">
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
                {(
                  [
                    ['spine', '#22d3ee'],
                    ['clean', '#34d399'],
                    ['chaos', '#fb7185'],
                    ['workspace', '#fbbf24'],
                    ['lock', '#a78bfa'],
                  ] as const
                ).map(([name, color]) => (
                  <marker
                    key={name}
                    id={`arrow-${name}`}
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill={color} />
                  </marker>
                ))}
              </defs>

              {svgState.edges.map((edge) => (
                <g
                  key={edge.id}
                  style={{ opacity: edge.dimmed ? 0.16 : 0.9 }}
                  className="transition-opacity duration-200"
                >
                  <path
                    d={edge.d}
                    fill="none"
                    stroke={edge.stroke}
                    strokeWidth={edge.dashed ? 2 : 2.5}
                    strokeDasharray={edge.dashed ? '6 5' : undefined}
                    strokeLinecap="round"
                    markerEnd={edge.markerEnd}
                  />
                  {edge.label &&
                    edge.labelX !== undefined &&
                    edge.labelY !== undefined &&
                    !edge.dimmed && (
                      <g transform={`translate(${edge.labelX}, ${edge.labelY})`}>
                        <rect
                          x="-28"
                          y="-9"
                          width="56"
                          height="16"
                          rx="6"
                          fill="#0b1020"
                          stroke={edge.stroke}
                          strokeOpacity="0.45"
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          y="-1"
                          fill="#e2e8f0"
                          fontSize="9.5"
                          fontWeight="600"
                        >
                          {edge.label}
                        </text>
                      </g>
                    )}
                </g>
              ))}
            </svg>
          )}

          <div className="relative z-10 grid grid-cols-5 grid-rows-3 gap-x-5 gap-y-14">
            {BRANCH_NODES.map((node) => {
              const isSelected = node.id === selectedNode.id;
              const isChecked = checkedSet.has(node.slotId);
              const isDimmed =
                activeFilter !== 'all' && !node.paths.includes(activeFilter);
              const theme = LANE_COLORS[node.lane];

              return (
                <button
                  key={node.id}
                  ref={setNodeRef(node.id)}
                  type="button"
                  onClick={() => onSelectNode(node.id)}
                  style={{
                    gridColumnStart: node.gridCol,
                    gridRowStart: node.gridRow,
                    gridColumnEnd: node.gridColSpan
                      ? `span ${node.gridColSpan}`
                      : undefined,
                  }}
                  className={`group flex flex-col justify-between rounded-xl border bg-surface-elevated p-3 text-left transition duration-200 ${
                    isSelected
                      ? `${theme.ring} ring-2 ring-cyan-300/60 shadow-lg`
                      : 'border-border-subtle hover:border-slate-500'
                  } ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold ${theme.badge}`}
                    >
                      {node.label}
                    </span>
                    {isChecked ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : node.lane === 'lock' ? (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                    ) : node.lane === 'workspace' ? (
                      <RotateCw className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-bold leading-snug text-white">
                      {node.shortTitle}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      {node.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mobile View (<md): Clean Vertical Timeline */}
      <section
        aria-label="Mobile save branch timeline"
        className="rounded-2xl border border-border-subtle bg-surface p-4 md:hidden"
      >
        <div className="relative space-y-3 pl-6 before:absolute before:bottom-3 before:left-2.5 before:top-3 before:w-0.5 before:bg-slate-800">
          {BRANCH_NODES.map((node) => {
            const isSelected = node.id === selectedNode.id;
            const isChecked = checkedSet.has(node.slotId);
            const isDimmed =
              activeFilter !== 'all' && !node.paths.includes(activeFilter);
            const theme = LANE_COLORS[node.lane];

            return (
              <div
                key={node.id}
                className={`relative transition ${
                  isDimmed ? 'opacity-30' : 'opacity-100'
                }`}
              >
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: theme.stroke }}
                  className="absolute -left-[20px] top-4 h-3 w-3 rounded-full ring-4 ring-surface"
                />
                <button
                  type="button"
                  onClick={() => onSelectNode(node.id)}
                  className={`w-full rounded-xl border bg-surface-elevated p-3 text-left transition ${
                    isSelected
                      ? 'border-cyan-400 ring-1 ring-cyan-400/50'
                      : 'border-border-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded border px-2 py-0.5 font-mono text-[11px] font-bold ${theme.badge}`}
                      >
                        {node.label}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {node.mobileBranchTag}
                      </span>
                    </div>
                    {isChecked ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-slate-600" />
                    )}
                  </div>
                  <div className="mt-1.5 text-sm font-bold text-white">
                    {node.shortTitle}
                  </div>
                  <div className="text-xs text-slate-400">{node.subtitle}</div>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Selected Node Detail Panel */}
      {selectedSlot && (
        <section
          aria-labelledby="node-detail-heading"
          className="rounded-2xl border border-cyan-500/35 bg-surface-elevated p-4 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-cyan-500/15 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-200 ring-1 ring-cyan-400/40">
                  {selectedSlot.slotLabel}
                </span>
                <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs font-semibold text-slate-300">
                  {selectedSlot.badge}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedSlot.chapterLabel}
                </span>
              </div>
              <h3
                id="node-detail-heading"
                className="text-base font-bold text-white sm:text-lg"
              >
                {selectedSlot.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onToggleSlot(selectedSlot.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                checkedSet.has(selectedSlot.id)
                  ? 'border border-emerald-500/50 bg-emerald-500/15 text-emerald-200'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
              }`}
            >
              {checkedSet.has(selectedSlot.id) ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Checkpoint Secured
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4" />
                  Mark Slot Secured
                </>
              )}
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-border-subtle bg-surface p-3.5 text-xs leading-relaxed">
              <div>
                <span className="font-semibold text-slate-200">
                  When to save:{' '}
                </span>
                <span className="text-slate-300">
                  {selectedSlot.whenToSave}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-200">
                  Why it matters:{' '}
                </span>
                <span className="text-slate-300">
                  {selectedSlot.whyItMatters}
                </span>
              </div>
              <div className="pt-1">
                <SpoilerText label="Story & mission context">
                  {selectedSlot.spoilerContext}
                </SpoilerText>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border-subtle bg-surface p-3.5 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="font-semibold text-slate-300">
                    Upstream Inputs
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {upstreamNodes.length > 0 ? (
                      upstreamNodes.map((node) => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => onSelectNode(node.id)}
                          className="rounded-md border border-slate-700 bg-canvas px-2 py-1 font-mono text-[11px] font-semibold text-slate-200 transition hover:border-cyan-400/60"
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
                  <div className="font-semibold text-slate-300">
                    Downstream Branches
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {downstreamNodes.length > 0 ? (
                      downstreamNodes.map((node) => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => onSelectNode(node.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-canvas px-2 py-1 font-mono text-[11px] font-semibold text-cyan-200 transition hover:border-cyan-400/60"
                        >
                          <ArrowRight className="h-3 w-3" />
                          {node.label}
                        </button>
                      ))
                    ) : (
                      <span className="text-slate-500">Terminal branch</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-300">
                  Reachable Endings (Inspect in Ending Navigator)
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {selectedSlot.recommendedEndings.map((endingId) => (
                    <button
                      key={endingId}
                      type="button"
                      onClick={() => onInspectEnding(endingId)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-canvas px-2 py-1 font-mono text-[11px] font-bold uppercase text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
                    >
                      <Compass className="h-3 w-3 text-cyan-400" />
                      {endingId}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
