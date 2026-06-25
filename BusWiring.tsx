// ─── bus-wiring · 编排组件 ────────────────────────────────────────────────
// 给它节点 + 总线定义，它自动算出 master→slave 走线并渲染所有可见连线。
import { useMemo } from 'react';
import type { BusDef, WireNode, BusColorMap, BusType } from './types';
import { DEFAULT_BUS_COLORS, DEFAULT_BUS_LAYER_Y } from './types';
import { getConnectorPoint, computeRoute, DEFAULT_LAYER_Y } from './routing';
import { BusRouteLine } from './BusRouteLine';

export interface BusWiringProps {
  nodes: WireNode[];
  buses: BusDef[];
  /** 配色，默认 DEFAULT_BUS_COLORS。 */
  colors?: BusColorMap;
  /** 每类线层高，默认 DEFAULT_BUS_LAYER_Y。设成同一值即单层。 */
  layers?: Record<BusType, number>;
  /** 被隐藏的总线类型（true=隐藏）。 */
  hiddenTypes?: Record<BusType, boolean>;
  /** 当前选中的总线 / 节点（用于高亮，可选）。 */
  selectedBusId?: string | null;
  selectedNodeId?: string | null;
  onBusClick?: (busId: string) => void;
}

function membersOf(nodes: WireNode[], busId: string): WireNode[] {
  return nodes.filter((n) => n.connections.some((b) => b.busId === busId));
}

/** 一条总线：从 master 向每个 slave 拉一根线。 */
function BusLines({
  bus, members, colors, layerY, selectedBusId, selectedNodeId, onBusClick,
}: {
  bus: BusDef; members: WireNode[]; colors: BusColorMap; layerY: number;
  selectedBusId?: string | null; selectedNodeId?: string | null;
  onBusClick?: (busId: string) => void;
}) {
  const isSelected = selectedBusId === bus.id;
  const busHasSelectedNode = !!selectedNodeId && members.some((m) => m.id === selectedNodeId);
  const someNodeSelected = !!selectedNodeId;
  const baseAlpha =
      isSelected         ? 1.0
    : busHasSelectedNode ? 0.95
    : someNodeSelected   ? 0.05
    :                      0.2;

  const isError  = bus.busStatus === 'error';
  const isActive = bus.busStatus !== 'error' && bus.busStatus !== 'idle';
  const lineColor = colors[bus.type]?.css ?? '#888888';

  const master = members.find((c) =>
    c.connections.some((b) => b.busId === bus.id && b.role === 'master')) ?? members[0];
  const slaves = members.filter((c) => c.id !== master.id);

  const routes = useMemo(() => {
    const masterPt = getConnectorPoint(master, bus.id);
    return slaves.map((slave, idx) => ({
      points: computeRoute(masterPt, getConnectorPoint(slave, bus.id), idx, layerY),
      isTrunk: idx === 0,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus.id, layerY]);

  return (
    <group>
      {routes.map((r, ri) => (
        <BusRouteLine
          key={`${bus.id}-${ri}`}
          points={r.points}
          color={lineColor}
          isTrunk={r.isTrunk}
          isActive={isActive}
          isError={isError}
          alpha={baseAlpha}
          onClick={() => onBusClick?.(bus.id)}
        />
      ))}
    </group>
  );
}

export function BusWiring({
  nodes, buses,
  colors = DEFAULT_BUS_COLORS,
  layers = DEFAULT_BUS_LAYER_Y,
  hiddenTypes = {},
  selectedBusId = null, selectedNodeId = null, onBusClick,
}: BusWiringProps) {
  const entries = useMemo(
    () => buses
      .map((bus) => ({ bus, members: membersOf(nodes, bus.id) }))
      .filter((e) => e.members.length >= 2),
    [buses, nodes],
  );

  return (
    <>
      {entries
        .filter(({ bus }) => !hiddenTypes[bus.type])
        .map(({ bus, members }) => (
          <BusLines
            key={bus.id}
            bus={bus}
            members={members}
            colors={colors}
            layerY={layers[bus.type] ?? DEFAULT_LAYER_Y}
            selectedBusId={selectedBusId}
            selectedNodeId={selectedNodeId}
            onBusClick={onBusClick}
          />
        ))}
    </>
  );
}
