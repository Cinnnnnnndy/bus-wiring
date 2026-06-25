// ─── bus-wiring · 公共导出 ────────────────────────────────────────────────
// 用法：import { BusWiring, useBusVisibility, BusTypeSwitches } from './bus-wiring';

export type {
  BusType, BusConnection, BusDef, WireNode, BusColor, BusColorMap,
} from './types';
export { DEFAULT_BUS_COLORS, DEFAULT_BUS_LAYER_Y } from './types';

export { getConnectorPoint, computeRoute, roundedCurve, DEFAULT_LAYER_Y } from './routing';
export { DASH_VERT, DASH_FRAG } from './shaders';

export { BusRouteLine } from './BusRouteLine';
export type { BusRouteLineProps } from './BusRouteLine';

export { BusWiring } from './BusWiring';
export type { BusWiringProps } from './BusWiring';

export { useBusVisibility } from './useBusVisibility';
export { BusTypeSwitches } from './BusTypeSwitches';
export type { BusTypeSwitchesProps } from './BusTypeSwitches';
