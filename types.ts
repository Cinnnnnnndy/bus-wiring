// ─── bus-wiring · 类型与配色 ──────────────────────────────────────────────
// 项目无关的连线模块。把整个 bus-wiring/ 文件夹拷到任意 R3F 项目即可用。
// 依赖：three、@react-three/fiber、react。不依赖 drei 或任何状态库。

/** 总线类型。默认给一套，按你的项目自由增删（就是个 string key）。 */
export type BusType = string;

/** 节点上的一条连接声明：挂在哪条线、是起点(master)还是终点(slave)、从哪个面引出。 */
export interface BusConnection {
  busId: string;
  busType: BusType;
  role: 'master' | 'slave' | 'peer';
  connectorPos: 'top' | 'bottom' | 'left' | 'right';
}

/** 一条总线的定义。 */
export interface BusDef {
  id: string;
  type: BusType;
  label?: string;
  /** 'active' 时有流动彗星高亮；'error' 时呼吸闪烁。 */
  busStatus?: 'active' | 'idle' | 'error';
}

/**
 * 通用节点。连线只关心三样东西：
 *   id        — 唯一标识
 *   position  — 世界坐标「中心」（y 向上）
 *   size      — 包围盒 {w 宽(x), h 高(y), d 深(z)}，用于算端点引出位置
 *   connections — 这个节点的连接声明
 */
export interface WireNode {
  id: string;
  position: { x: number; y: number; z: number };
  size: { w: number; h: number; d: number };
  connections: BusConnection[];
}

/** 每类线一个颜色。图例和 3D 线共用同一份，保证永远一致。 */
export interface BusColor {
  hex: number;
  css: string;
}
export type BusColorMap = Record<BusType, BusColor>;

export const DEFAULT_BUS_COLORS: BusColorMap = {
  POWER: { hex: 0xffc233, css: '#FFC233' }, // 黄 — 电源 / 管理
  I2C:   { hex: 0x5e8bff, css: '#5E8BFF' }, // 蓝 — 信号
  PCIE:  { hex: 0xd29cff, css: '#D29CFF' }, // 紫 — 高速
  SATA:  { hex: 0xff8a3d, css: '#FF8A3D' }, // 橙 — 存储
  USB:   { hex: 0x34d399, css: '#34D399' }, // 绿
};

/** 每类线的悬浮层高度，不同协议永不在同一高度交叉（关键可读性技巧）。
 *  想用「单层」就把所有值设成同一个数。 */
export const DEFAULT_BUS_LAYER_Y: Record<BusType, number> = {
  POWER: 2.9, I2C: 3.35, PCIE: 3.8, SATA: 4.25, USB: 4.7,
};
