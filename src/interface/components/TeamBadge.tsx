import { Users } from 'lucide-react';
import React from 'react';
import { AgenticSystem, getAllAgents } from '../../data/agents';

interface TeamBadgeProps {
  system: AgenticSystem;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({ system }) => {
  const agentCount = getAllAgents(system).length;

  return (
    <div className="flex items-center gap-3">
      <div
        className="h-9 px-3 flex items-center justify-center gap-2"
        style={{
          backgroundColor: system.color,
          border: '3px solid var(--stroke)',
          boxShadow: '4px 4px 0 0 var(--stroke)',
          borderRadius: 0,
        }}
      >
        <Users size={14} className="text-white opacity-90" strokeWidth={3} />
        <span className="text-xs font-black text-white leading-none">
          {agentCount}
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="font-marker uppercase leading-[0.95] text-sm" style={{ color: 'var(--fg-base)' }}>
          {system.teamName}
        </span>
        <span className="font-sketch uppercase tracking-[1.5px] text-[9px] leading-tight" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>
          {system.teamType}
        </span>
      </div>
    </div>
  );
};
