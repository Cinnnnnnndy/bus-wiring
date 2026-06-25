// ─── bus-wiring · 走线 ────────────────────────────────────────────────────
import * as THREE from 'three';
import type { WireNode } from './types';

export const DEFAULT_LAYER_Y = 3.4;

/**
 * 端点引出位置：节点世界中心 + size，按 connectorPos 选一个面。
 * y（高度）取节点中心高度；top/bottom 沿深度(z)，left/right 沿宽度(x)。
 */
export function getConnectorPoint(node: WireNode, busId: string): THREE.Vector3 {
  const c = node.connections.find((b) => b.busId === busId);
  const { x, y, z } = node.position;
  const { w, d } = node.size;
  if (!c) return new THREE.Vector3(x, y, z);
  switch (c.connectorPos) {
    case 'top':    return new THREE.Vector3(x,          y, z - d / 2);
    case 'bottom': return new THREE.Vector3(x,          y, z + d / 2);
    case 'left':   return new THREE.Vector3(x - w / 2,  y, z);
    case 'right':  return new THREE.Vector3(x + w / 2,  y, z);
    default:       return new THREE.Vector3(x,          y, z);
  }
}

/**
 * 单层折线走线：抬到层高 → X 直角 → Z 直角 → 落到接口。
 * idx 给同一条总线上的多条平行线一个横向错位，避免重叠。
 */
export function computeRoute(
  from: THREE.Vector3,
  to: THREE.Vector3,
  idx: number,
  layerY: number = DEFAULT_LAYER_Y,
  parallelGap = 0.14,
): THREE.Vector3[] {
  const Y = layerY;
  const zOff = idx * parallelGap;
  const fx = from.x, fz = from.z + zOff;
  const tx = to.x,   tz = to.z   + zOff;
  const pts: THREE.Vector3[] = [];
  const push = (p: THREE.Vector3) => {
    if (!pts.length || p.distanceTo(pts[pts.length - 1]) > 0.02) pts.push(p);
  };
  push(from.clone());
  push(new THREE.Vector3(fx, Y, from.z));
  if (Math.abs(from.z - fz) > 0.02) push(new THREE.Vector3(fx, Y, fz));
  if (Math.abs(fx - tx)     > 0.04) push(new THREE.Vector3(tx, Y, fz));
  if (Math.abs(fz - tz)     > 0.04) push(new THREE.Vector3(tx, Y, tz));
  if (Math.abs(tz - to.z)   > 0.02) push(new THREE.Vector3(tx, Y, to.z));
  push(to.clone());
  return pts;
}

/** 把折点串转成带圆角的 CurvePath（折角处插二次贝塞尔）。 */
export function roundedCurve(pts: THREE.Vector3[], radius: number): THREE.CurvePath<THREE.Vector3> {
  const cp = new THREE.CurvePath<THREE.Vector3>();
  if (pts.length < 2) return cp;
  if (pts.length === 2) {
    cp.add(new THREE.LineCurve3(pts[0].clone(), pts[1].clone()));
    return cp;
  }
  let from = pts[0].clone();
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const dIn  = p.clone().sub(pts[i - 1]); const lIn  = dIn.length() || 1;  dIn.normalize();
    const dOut = pts[i + 1].clone().sub(p); const lOut = dOut.length() || 1; dOut.normalize();
    const r = Math.min(radius, lIn * 0.5, lOut * 0.5);
    const cStart = p.clone().addScaledVector(dIn, -r);
    const cEnd   = p.clone().addScaledVector(dOut, r);
    cp.add(new THREE.LineCurve3(from.clone(), cStart));
    cp.add(new THREE.QuadraticBezierCurve3(cStart, p.clone(), cEnd));
    from = cEnd;
  }
  cp.add(new THREE.LineCurve3(from.clone(), pts[pts.length - 1].clone()));
  return cp;
}
