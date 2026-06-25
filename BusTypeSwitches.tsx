// ─── bus-wiring · 分类显隐图例（DOM 浮层，受控）────────────────────────────
import type { BusColorMap, BusType } from './types';
import { DEFAULT_BUS_COLORS } from './types';

export interface BusTypeSwitchesProps {
  /** 要显示开关的类型列表；缺省用 colors 的所有 key。 */
  types?: BusType[];
  colors?: BusColorMap;
  hidden: Record<BusType, boolean>;
  onToggle: (type: BusType) => void;
  /** 容器样式覆盖（默认浮在左下角）。 */
  style?: React.CSSProperties;
}

export function BusTypeSwitches({
  types, colors = DEFAULT_BUS_COLORS, hidden, onToggle, style,
}: BusTypeSwitchesProps) {
  const list = types ?? (Object.keys(colors) as BusType[]);
  return (
    <div style={{
      position: 'absolute', bottom: 14, left: 14, zIndex: 10,
      display: 'flex', gap: 7, alignItems: 'center',
      padding: '7px 11px', borderRadius: 12,
      background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(120,150,190,0.25)',
      boxShadow: '0 4px 14px rgba(60,80,120,0.12)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      ...style,
    }}>
      <span style={{ fontSize: 11, color: '#9aa3b2', marginRight: 2 }}>连线</span>
      {list.map((type) => {
        const off = !!hidden[type];
        const c = colors[type]?.css ?? '#888888';
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            title={off ? `显示 ${type}` : `隐藏 ${type}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 9, cursor: 'pointer',
              fontSize: 11.5, fontWeight: 600,
              border: `1px solid ${off ? '#dfe3ea' : `${c}66`}`,
              background: off ? '#f1f3f7' : `${c}1a`,
              color: off ? '#aab1bf' : '#3a424f',
              textDecoration: off ? 'line-through' : 'none',
              transition: 'all 0.12s',
            }}
          >
            <span style={{
              width: 9, height: 9, borderRadius: '50%',
              background: off ? '#c6ccd6' : c,
              boxShadow: off ? 'none' : `0 0 5px ${c}88`,
            }} />
            {type}
          </button>
        );
      })}
    </div>
  );
}
