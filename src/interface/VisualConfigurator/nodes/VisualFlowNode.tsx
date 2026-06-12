import { Handle, Position } from '@xyflow/react';
import { User } from 'lucide-react';
import { HandleData } from '../flowUtils';
import { USER_COLOR, USER_COLOR_LIGHT, USER_COLOR_SOFT } from '../../../theme/brand';
import { Avatar } from '../../components/Avatar';

const NodeHandle = ({ h, i, total, position }: { h: HandleData, i: number, total: number, position: 'top' | 'bottom' }) => (
  <Handle
    type={h.role}
    position={position === 'top' ? Position.Top : Position.Bottom}
    id={h.id}
    className="!w-2.5 !h-2.5 hover:scale-125 transition-transform"
    style={{
      left: `calc(50% + ${(i - (total - 1) / 2) * 28}px)`,
      backgroundColor: h.color,
      border: '2px solid var(--stroke)',
      borderRadius: 0,
      [position]: 0,
      transform: `translate(-50%, ${position === 'top' ? '-50%' : '50%'})`,
    }}
  />
);

export const VisualFlowNode = ({ data, selected, type }: any) => {
  const isUser = type === 'user';
  const topHandles: HandleData[] = data.topHandles || [];
  const bottomHandles: HandleData[] = data.bottomHandles || [];

  const accentColor = isUser ? USER_COLOR : (data.color || '#ccc');

  return (
    <div
      className={`
        relative px-3 py-2.5 pointer-events-auto transition-all duration-300 w-fit min-w-[280px]
        ${selected ? 'scale-105 z-20' : 'z-10'}
        ${data.isDimmed ? 'opacity-20 translate-y-1' : 'opacity-100'}

      `}
      style={{
        background: 'var(--bg-base)',
        borderRadius: 0,
        border: `3px solid ${accentColor}`,
        boxShadow: selected ? `6px 6px 0 0 ${accentColor}` : `4px 4px 0 0 ${accentColor}`,
      }}
    >
      {/* Handles */}
      {topHandles.map((h, i) => <NodeHandle key={h.id} h={h} i={i} total={topHandles.length} position="top" />)}
      {bottomHandles.map((h, i) => <NodeHandle key={h.id} h={h} i={i} total={bottomHandles.length} position="bottom" />)}

      <div className="flex items-center gap-3">
        <div
          className="shrink-0 p-0.5"
          style={{ background: 'var(--bg-surface)', border: '3px solid var(--stroke)', borderRadius: 0 }}
        >
          <Avatar
            type={isUser ? "user" : (data.isLead ? "lead" : "sub")}
            color={isUser ? USER_COLOR : data.color}
            size={48}
          />
        </div>

        <div className="flex flex-col min-w-0 flex-1 gap-1">
          <div
            className="font-marker uppercase text-[14px] leading-[0.95] truncate min-w-0"
            style={{ color: isUser ? USER_COLOR : 'var(--fg-base)' }}
          >
            {data.label}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap gap-1.5 items-center">
              {data.isLead && !isUser && (
                <div
                  className="text-[9px] font-sketch px-1.5 py-0.5 uppercase tracking-[1.5px] leading-none flex items-center h-4 shrink-0 w-fit"
                  style={{
                    backgroundColor: `${data.color}20`,
                    color: data.color,
                    border: `2px solid ${data.color}`,
                    borderRadius: 0
                  }}
                >
                  Lead Agent
                </div>
              )}

              {!data.isLead && !isUser && (
                <div
                  className="text-[9px] font-sketch px-1.5 py-0.5 uppercase tracking-[1.5px] leading-none flex items-center h-4 shrink-0 w-fit"
                  style={{
                    backgroundColor: `${data.color}20`,
                    color: data.color,
                    border: `2px solid ${data.color}`,
                    borderRadius: 0
                  }}
                >
                  Subagent
                </div>
              )}

              {data.agent?.humanInTheLoop && (
                <div
                  className="text-[9px] font-sketch px-1.5 py-0.5 uppercase tracking-[1.5px] leading-none flex items-center h-4 shrink-0 w-fit gap-1"
                  style={{
                    backgroundColor: USER_COLOR_LIGHT,
                    color: USER_COLOR,
                    border: `2px solid ${USER_COLOR}`,
                    borderRadius: 0
                  }}
                >
                  <User size={8} strokeWidth={3} />
                  Human-in-the-loop
                </div>
              )}
            </div>

            {!isUser && (
              <div
                className="text-[9px] font-mono px-1.5 py-0.5 inline-block w-fit"
                style={{
                  color: 'var(--fg-base)',
                  opacity: 0.7,
                  border: '2px solid var(--stroke)',
                  background: 'var(--bg-surface)',
                  borderRadius: 0
                }}
              >
                {data.agent?.model}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
