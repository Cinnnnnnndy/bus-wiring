// ─── bus-wiring · 显隐状态 ────────────────────────────────────────────────
// 不想引状态库时用这个小 hook；已有 zustand/redux 的可忽略，自己管 hidden 即可。
import { useState, useCallback } from 'react';
import type { BusType } from './types';

export function useBusVisibility(initialHidden: BusType[] = []) {
  const [hidden, setHidden] = useState<Record<BusType, boolean>>(
    Object.fromEntries(initialHidden.map((t) => [t, true])),
  );
  const toggle = useCallback(
    (type: BusType) => setHidden((h) => ({ ...h, [type]: !h[type] })),
    [],
  );
  return { hidden, toggle };
}
