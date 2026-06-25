# bus-wiring

仿真调试视图的「彩色流动连线」抽出来的**项目无关**模块：分层走线、圆管管体、
流动彗星高亮、两端 connector 接点、逐根 hover、分类显隐。

**整个 `bus-wiring/` 文件夹拷到任意 React + R3F 项目即可用。**

## 依赖

```
three   @react-three/fiber   react
```

不依赖 drei、不依赖任何状态库。端点接点是纯 three 原生几何。

## 60 秒上手

```tsx
import { Canvas } from '@react-three/fiber';
import {
  BusWiring, BusTypeSwitches, useBusVisibility,
  type WireNode, type BusDef,
} from './bus-wiring';

// 1) 你的节点：世界中心 position + size + 连接声明
const nodes: WireNode[] = [
  { id: 'mb',  position: { x: 0, y: 0, z: 0 }, size: { w: 6, h: 0.3, d: 6 },
    connections: [{ busId: 'i2c', busType: 'I2C', role: 'master', connectorPos: 'top' }] },
  { id: 'bmc', position: { x: -5, y: 0, z: 0 }, size: { w: 2, h: 0.3, d: 4 },
    connections: [{ busId: 'i2c', busType: 'I2C', role: 'slave',  connectorPos: 'right' }] },
  // …
];

// 2) 总线定义
const buses: BusDef[] = [
  { id: 'i2c', type: 'I2C', label: '板级 I2C', busStatus: 'active' },
];

function Scene() {
  const { hidden, toggle } = useBusVisibility();
  return (
    <>
      <Canvas orthographic camera={{ position: [40, 40, 40], zoom: 12 }}>
        {/* …你的节点 mesh… */}
        <BusWiring nodes={nodes} buses={buses} hiddenTypes={hidden} />
      </Canvas>
      {/* 左下角分类开关（普通 DOM，放 Canvas 外层容器里） */}
      <BusTypeSwitches hidden={hidden} onToggle={toggle} />
    </>
  );
}
```

> 容器需 `position: relative`，开关用绝对定位浮在左下角。

## 数据契约

| 字段 | 说明 |
|---|---|
| `WireNode.position` | 世界坐标**中心**（y 向上） |
| `WireNode.size` | `{w 宽(x), h 高(y), d 深(z)}`，算端点引出面用 |
| `BusConnection.role` | 每条线选 **1 个 `master`(起点)**，其余 `slave`(终点) |
| `BusConnection.connectorPos` | 线从节点哪个面引出：top/bottom(沿深度) · left/right(沿宽度) |

引擎自动 `master → 每个 slave` 拉线。**连接关系要你自己按真实拓扑声明**。

## `<BusWiring>` props

| prop | 默认 | 说明 |
|---|---|---|
| `nodes` / `buses` | — | 必填 |
| `colors` | `DEFAULT_BUS_COLORS` | 每类线颜色 |
| `layers` | `DEFAULT_BUS_LAYER_Y` | 每类线层高；全设同值=单层 |
| `hiddenTypes` | `{}` | `{ I2C: true }` 隐藏该类 |
| `selectedBusId` / `selectedNodeId` | `null` | 高亮联动（可选） |
| `onBusClick` | — | 点线回调 |

## 自定义旋钮

| 想改 | 改哪 |
|---|---|
| 颜色 | `colors` prop / `DEFAULT_BUS_COLORS` |
| 分层 / 单层 | `layers` prop |
| 线粗 | `BusRouteLine` 的 `tubeR` |
| 圆角 | `routing.ts` `roundedCurve(pts, radius)` |
| 默认透明度 | `BusWiring` 里 `baseAlpha` |
| 平行线间距 | `computeRoute(..., parallelGap)` |
| 彗星速度/长度 | `shaders.ts` DASH_FRAG + `BusRouteLine` useFrame |

## 注意

- **别用 drei `<Html>` 做端点/标签**：每帧 DOM reflow，场景一重就卡死。本模块全用 three 原生几何 / sprite。
- 若你的场景有「每帧 traverse 统一材质」逻辑，连线 group 已打 `userData.keepMaterial`，记得在你的遍历里跳过它，否则彩色线被刷成灰。
- 透视相机也能用，但样式是按**正交 / 2.5D 等距**视角调的，那种视角下最好看。
