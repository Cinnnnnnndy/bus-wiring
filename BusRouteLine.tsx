// ─── bus-wiring · 单根连线 ────────────────────────────────────────────────
// 圆管管体（ShaderMaterial 实色 + 流动彗星）+ 两端 connector 接点。
import { useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DASH_VERT, DASH_FRAG } from './shaders';
import { roundedCurve } from './routing';

export interface BusRouteLineProps {
  points: THREE.Vector3[];
  color: string;
  /** 主干线（每条总线第 0 根）更粗、端点更大。 */
  isTrunk?: boolean;
  /** active 时有流动彗星。 */
  isActive?: boolean;
  /** error 时端点/线呈红并呼吸闪烁。 */
  isError?: boolean;
  /** 静止透明度（hover 时本根自动升到 1）。 */
  alpha?: number;
  onClick?: () => void;
}

export function BusRouteLine({
  points, color, isTrunk = false, isActive = true, isError = false, alpha = 0.2, onClick,
}: BusRouteLineProps) {
  const [hovered, setHovered] = useState(false);
  const effColor = isError ? '#EF4444' : color;
  const effAlpha = hovered ? 1.0 : alpha;
  const tubeR = isTrunk ? 0.05 : 0.038;

  const { curvePath, totalLen, divisions } = useMemo(() => {
    const cp = roundedCurve(points, isTrunk ? 0.24 : 0.18);
    return { curvePath: cp, totalLen: Math.max(cp.getLength(), 0.01), divisions: Math.max(points.length * 16, 48) };
  }, [points, isTrunk]);

  const tubeGeo = useMemo(
    () => new THREE.TubeGeometry(curvePath, divisions, tubeR, 7, false),
    [curvePath, divisions, tubeR],
  );
  useEffect(() => () => tubeGeo.dispose(), [tubeGeo]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: DASH_VERT,
    fragmentShader: DASH_FRAG,
    uniforms: {
      uColor:    { value: new THREE.Color(effColor) },
      uTotalLen: { value: totalLen },
      uOffset:   { value: 0 },
      uOpacity:  { value: alpha },
      uActive:   { value: isActive ? 1 : 0 },
    },
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  useEffect(() => () => mat.dispose(), [mat]);

  useEffect(() => {
    mat.uniforms.uColor.value.set(effColor);
    mat.uniforms.uTotalLen.value = totalLen;
    mat.uniforms.uActive.value = isActive ? 1 : 0;
  }, [effColor, totalLen, isActive, mat]);

  useFrame(({ clock }) => {
    if (isActive) mat.uniforms.uOffset.value -= 0.012;
    const target = isError
      ? 0.45 + 0.5 * Math.abs(Math.sin(clock.getElapsedTime() * Math.PI * 2))
      : effAlpha;
    const u = mat.uniforms.uOpacity;
    u.value += (target - u.value) * 0.18;
  });

  const first = points[0];
  const last  = points[points.length - 1];
  const st = isTrunk ? 1.18 : 1;             // 主干端点略大
  const endAlpha = Math.max(effAlpha, 0.85); // 端点恒醒目

  return (
    <group
      userData={{ keepMaterial: true }}
      onClick={(e: any) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e: any) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh geometry={tubeGeo} material={mat} />

      {/* 端点接点：竖直接线柱 + 底部色环 + 白色中心点 */}
      {[first, last].map((pt, i) => (
        <group key={i} position={[pt.x, pt.y, pt.z]}>
          <mesh position={[0, 0.11 * st, 0]}>
            <cylinderGeometry args={[0.062 * st, 0.082 * st, 0.22 * st, 12]} />
            <meshBasicMaterial color={effColor} transparent opacity={endAlpha} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.115 * st, 0.175 * st, 24]} />
            <meshBasicMaterial color={effColor} transparent opacity={endAlpha * 0.9} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.05 * st, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.95} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
