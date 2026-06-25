// ─── bus-wiring · 着色器 ──────────────────────────────────────────────────
// 实色管体 + 一段沿线移动的白色亮带（“彗星”流动高亮）。

export const DASH_VERT = /* glsl */ `
  varying float vArcLen;
  void main() {
    vArcLen = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const DASH_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uTotalLen;
  uniform float uOffset;
  uniform float uOpacity;
  uniform float uActive;
  varying float vArcLen;
  void main() {
    vec3 col = uColor;
    float pos  = fract(vArcLen * uTotalLen * 0.45 - uOffset);
    float band = smoothstep(0.0, 0.03, pos) * (1.0 - smoothstep(0.03, 0.13, pos));
    col = mix(col, vec3(1.0), band * uActive * 0.55);
    gl_FragColor = vec4(col, uOpacity);
  }
`;
