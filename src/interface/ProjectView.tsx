import { Info, RefreshCcw, ScrollText, FileText, Image, Music, Video } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { getAgentSet, getAllAgents } from '../data/agents';
import { useCoreStore } from '../integration/store/coreStore';
import { useTeamStore, useActiveTeam } from '../integration/store/teamStore';
import { useSceneManager } from '../simulation/SceneContext';
import { USER_COLOR } from '../theme/brand';
import ResetModal from './ResetModal';
import PricingModal from './PricingModal';
import { SketchButton } from './sketch';

export function formatTokens(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

const ProjectView: React.FC = () => {
  const {
    userBrief,
    referenceImages,
    phase,
    actionLog,
    resetProject,
  } = useCoreStore();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const activeTeam = useActiveTeam();
  const scene = useSceneManager();

  const hasLogs = actionLog.length > 0;

  const handleResetConfirm = () => {
    // 1. Reset the 3D scene (teleport agents, clear chat)
    scene?.resetScene();
    // 3. Clear project state
    resetProject();
    setIsResetModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6" style={{ background: 'var(--bg-base)' }}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-marker uppercase leading-[0.95] text-2xl" style={{ color: 'var(--fg-base)' }}>Project Info</h2>
          <div className="flex items-center gap-2">
            <div
              className="px-2.5 py-1 font-sketch uppercase tracking-[1px] text-[9px] flex items-center gap-1.5 transition-colors"
              style={{
                backgroundColor: phase === 'working' ? USER_COLOR : (phase === 'done' ? '#22c55e' : 'var(--bg-surface)'),
                color: phase === 'idle' ? 'var(--fg-base)' : 'white',
                border: '3px solid var(--stroke)',
                borderRadius: 0,
              }}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${phase === 'working' ? 'bg-white animate-pulse' : (phase === 'idle' ? 'opacity-40' : 'bg-white opacity-40')}`} style={phase === 'idle' ? { backgroundColor: 'var(--fg-base)' } : undefined} />
              {phase === 'idle' ? 'Ready to Start' : phase}
            </div>
          </div>
        </div>
      </div>

      <div className="h-[3px] w-full mb-6" style={{ background: 'var(--stroke)' }} />

      {/* Reset Project Button */}
      {hasLogs && (
        <div className="mb-8 w-full">
          <SketchButton
            variant={phase === 'done' ? 'filled' : 'default'}
            size="md"
            onClick={() => setIsResetModalOpen(true)}
            seed="start-new-project"
            className="w-full group"
          >
            <RefreshCcw size={14} strokeWidth={3} className="transition-transform group-hover:rotate-180 duration-500" />
            <span>Start New Project</span>
          </SketchButton>
        </div>
      )}

      {/* Brief */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <p className="font-sketch uppercase tracking-[1.5px] text-[10px]" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>User Brief</p>
          <div className="h-[3px] flex-1" style={{ background: 'var(--stroke)', opacity: 0.3 }} />
        </div>
        {userBrief ? (
          <div className="space-y-4">
            <div
              className="markdown-content text-xs leading-relaxed font-hand p-4 max-h-[300px] overflow-y-auto custom-scrollbar"
              style={{
                color: 'var(--fg-base)',
                background: 'var(--bg-surface)',
                border: '3px solid var(--stroke)',
                borderRadius: 0,
              }}
            >
              <ReactMarkdown>
                {userBrief}
              </ReactMarkdown>
            </div>

            {(activeTeam.outputType === 'image' || activeTeam.outputType === 'video') && referenceImages.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="font-sketch uppercase tracking-[1.5px] text-[9px]" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Brief Logic References</p>
                <div className="grid grid-cols-3 gap-2">
                  {referenceImages.map((img, idx) => (
                    <div key={idx} className="aspect-square overflow-hidden" style={{ border: '3px solid var(--stroke)', borderRadius: 0 }}>
                      <img src={img} alt={`Ref ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs italic font-hand" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>No active brief. Talk to the Lead Agent to define your project.</p>
        )}
      </div>

      {/* Token Usage */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            <p className="font-sketch uppercase tracking-[1.5px] text-[10px]" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Token Usage</p>
            <div className="h-[3px] flex-1" style={{ background: 'var(--stroke)', opacity: 0.3 }} />
          </div>
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 transition-all active:scale-95 group ml-4 cursor-pointer"
            style={{ border: '3px solid #059669', borderRadius: 0 }}
          >
            <span className="font-sketch uppercase tracking-[0.5px] text-[10px] text-emerald-700">
              Total Est. ${useCoreStore.getState().totalEstimatedCost.toFixed(3)}
            </span>
            <Info size={11} className="text-emerald-600 group-hover:text-emerald-700" />
          </button>
        </div>

        <div
          className="p-5 mb-6"
          style={{
            background: 'var(--bg-surface)',
            border: '3px solid var(--stroke)',
            boxShadow: '4px 4px 0 0 var(--stroke)',
            borderRadius: 0,
          }}
        >
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-4xl font-mono font-black tracking-tighter" style={{ color: 'var(--fg-base)' }}>
              {formatTokens(useCoreStore.getState().totalTokenUsage.totalTokens)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold font-mono" style={{ color: 'var(--fg-base)' }}>
            <span>{formatTokens(useCoreStore.getState().totalTokenUsage.promptTokens)} <span className="font-medium opacity-50">input</span></span>
            <span className="opacity-40">+</span>
            <span>{formatTokens(useCoreStore.getState().totalTokenUsage.completionTokens)} <span className="font-medium opacity-50">output</span></span>
          </div>
        </div>

        <div className="space-y-1">
          {Object.entries(useCoreStore.getState().agentTokenUsage)
            .sort(([, a], [, b]) => b.totalTokens - a.totalTokens)
            .map(([idx, usage]) => {
              const agentIndex = parseInt(idx);
              const agents = getAllAgents(activeTeam);
              const agent = agentIndex === -1
                ? { name: 'System', color: '#71717a' }
                : agents.find(a => a.index === agentIndex);

              if (!agent || usage.totalTokens === 0) return null;

              return (
                <div key={idx} className="flex items-center justify-between py-2 px-2 transition-colors group hover:bg-[var(--bg-surface)]">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }} />
                    <span className="text-[11px] font-bold uppercase tracking-tight font-sketch" style={{ color: 'var(--fg-base)', opacity: 0.75 }}>
                      {agent.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      {useCoreStore.getState().agentEstimatedCost[agentIndex] > 0 && (
                        <span className="text-[9px] font-mono font-bold text-emerald-600/70">
                          ${useCoreStore.getState().agentEstimatedCost[agentIndex].toFixed(4)}
                        </span>
                      )}
                      <span className="text-[11px] font-mono font-black" style={{ color: 'var(--fg-base)' }}>
                        {formatTokens(usage.totalTokens)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold font-mono" style={{ color: 'var(--fg-base)', opacity: 0.5 }}>
                      <span>{formatTokens(usage.promptTokens)} <span className="font-medium opacity-70">input</span></span>
                      <span className="opacity-50">+</span>
                      <span>{formatTokens(usage.completionTokens)} <span className="font-medium opacity-70">output</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
      />

      {isPricingModalOpen && (
        <PricingModal onClose={() => setIsPricingModalOpen(false)} />
      )}
    </div>
  );
};

export default ProjectView;
