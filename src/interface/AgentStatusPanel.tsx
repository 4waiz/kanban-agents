import React from 'react';
import { getAgentSet, getAllAgents, getAllCharacters } from '../data/agents';
import { useCoreStore } from '../integration/store/coreStore';
import { useTeamStore, useActiveTeam } from '../integration/store/teamStore';
import { Avatar } from './components/Avatar';

import { formatTokens } from './ProjectView';

interface AgentStatusPanelProps {
  agentIndex: number;
}

const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({ agentIndex }) => {
  const { tasks } = useCoreStore();
  const system = useActiveTeam();
  const agents = getAllAgents(system);

  const agent = agents.find(a => a.index === agentIndex);
  if (!agent) return null;

  const activeTask = tasks.find(
    (t) => t.assignedAgentId === agentIndex && t.status === 'in_progress'
  ) ?? null;

  const usage = useCoreStore.getState().agentTokenUsage[agentIndex] || { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Agent Info */}
      <div className="mb-8 space-y-6">
        {/* Role/Description */}
        {agent.index !== 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="font-sketch uppercase tracking-[1.5px] text-[10px]" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Description</p>
              <div className="h-[3px] flex-1" style={{ background: 'var(--stroke)', opacity: 0.3 }} />
            </div>
            <p className="text-xs leading-relaxed font-hand capitalize-first" style={{ color: 'var(--fg-base)', opacity: 0.85 }}>{agent.description}</p>
          </div>
        )}
        {/* Model */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="font-sketch uppercase tracking-[1.5px] text-[10px]" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Model</p>
            <div className="h-[3px] flex-1" style={{ background: 'var(--stroke)', opacity: 0.3 }} />
          </div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 font-mono"
            style={{ background: 'var(--bg-surface)', border: '3px solid var(--stroke)', borderRadius: 0 }}
          >
            <p className="text-[11px] font-bold uppercase tracking-tighter" style={{ color: 'var(--fg-base)' }}>
              {agent.model}
            </p>
          </div>
        </div>
        {/* Token Usage */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="font-sketch uppercase tracking-[1.5px] text-[10px]" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Token Usage</p>
            <div className="h-[3px] flex-1" style={{ background: 'var(--stroke)', opacity: 0.3 }} />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold font-mono" style={{ color: 'var(--fg-base)' }}>
            <span>{formatTokens(usage.promptTokens)} <span className="font-medium opacity-50">input</span></span>
            <span className="opacity-40">+</span>
            <span>{formatTokens(usage.completionTokens)} <span className="font-medium opacity-50">output</span></span>
          </div>
        </div>
      </div>

      <div className="h-[3px] w-full mb-6" style={{ background: 'var(--stroke)' }} />

      {/* Task Status */}
      {activeTask ? (
        <div className="mb-6">
          <p className="font-sketch uppercase tracking-[1.5px] text-[10px] mb-2 flex items-center gap-2" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: agent.color }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: agent.color }}></span>
            </span>
            Doing Now
          </p>
          <p className="text-sm leading-snug font-bold font-hand" style={{ color: 'var(--fg-base)' }}>
            "{activeTask.title}"
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <p className="font-sketch uppercase tracking-[1.5px] text-[10px] mb-2" style={{ color: 'var(--fg-base)', opacity: 0.4 }}>
            Status
          </p>
          <p className="text-sm leading-snug italic font-hand" style={{ color: 'var(--fg-base)', opacity: 0.5 }}>
            Waiting for next task...
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentStatusPanel;
