import { FolderOpen, Lock, MessageSquare, MessageSquareWarning, GitPullRequest } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { getAgentSet, getAllCharacters } from '../data/agents';
import { USER_COLOR, USER_COLOR_LIGHT, USER_COLOR_SOFT } from '../theme/brand';
import { useChatAvailability } from '../integration/hooks/useChatAvailability';
import { useCoreStore } from '../integration/store/coreStore';
import { useTeamStore, useActiveTeam } from '../integration/store/teamStore';
import { useUiStore } from '../integration/store/uiStore';
import { useSceneManager } from '../simulation/SceneContext';
import { Avatar } from './components/Avatar';
import AgentStatusPanel from './AgentStatusPanel';
import ChatPanel from './ChatPanel';
import ProjectView from './ProjectView';
import { ReferenceImages } from './components/ReferenceImages';

interface InspectorPanelProps {
  isFloating?: boolean;
}

const InspectorPanel: React.FC<InspectorPanelProps> = ({ isFloating }) => {
  const { selectedNpcIndex, isChatting } = useUiStore();
  const scene = useSceneManager();
  const { phase, setFinalOutputOpen, tasks } = useCoreStore();
  const system = useActiveTeam();
  const agents = getAllCharacters(system);
  const { canChat, reason } = useChatAvailability(selectedNpcIndex);
  const prevCanChat = useRef(canChat);

  const agent = selectedNpcIndex !== null ? agents.find(a => a.index === selectedNpcIndex) ?? null : null;
  const isProjectReady = phase === 'done' && selectedNpcIndex === system.leadAgent.index;

  const isLeadAgentIdle = selectedNpcIndex === system.leadAgent.index && phase === 'idle';
  const currentTask = tasks.find(t => t.assignedAgentId === selectedNpcIndex && t.status === 'in_progress');
  const tasksOnHold = agent ? tasks.filter(
    t => t.assignedAgentId === agent.index && t.status === 'on_hold'
  ) : [];
  const hasTaskOnHold = tasksOnHold.length > 0;

  const needsInput = isLeadAgentIdle || hasTaskOnHold;

  // When canChat transitions true → false, end any active chat
  useEffect(() => {
    if (prevCanChat.current && !canChat) {
      if (isChatting) useUiStore.getState().setChatting(false);
    }
    prevCanChat.current = canChat;
  }, [canChat, isChatting]);

  const handleEndChat = () => {
    useUiStore.getState().setChatting(false);
  };

  const handleStartChat = () => {
    if (canChat && selectedNpcIndex !== null) {
      scene?.startChat(selectedNpcIndex);
    }
  };

  return (
    <div
      className={`${isFloating ? 'w-full h-full max-h-[85vh] self-end' : 'w-80 h-full border-l-[3px]'} flex flex-col pointer-events-auto shrink-0 relative z-30 overflow-hidden transition-all duration-300`}
      style={{
        background: 'var(--bg-base)',
        borderColor: 'var(--stroke)',
        ...(isFloating ? { border: '3px solid var(--stroke)', boxShadow: '6px 6px 0 0 var(--stroke)', borderRadius: 0 } : {}),
      }}
    >
      {!agent ? (
        !isFloating && <ProjectView />
      ) : (
        <>
          {/* Header Section */}
          <div className="px-4 py-3 border-b-[3px]" style={{ borderColor: 'var(--stroke)', background: isFloating ? 'var(--bg-surface)' : 'var(--bg-base)' }}>
            <div className="flex flex-col gap-4">
              {/* Agent Title Row */}
              <div className="flex items-center gap-4">
                <div className="shrink-0 p-0.5" style={{ background: 'var(--bg-surface)', border: '3px solid var(--stroke)', borderRadius: 0 }}>
                  <Avatar
                    type={agent.index === system.user.index ? 'user' : (agent.index === system.leadAgent.index ? 'lead' : 'sub')}
                    color={agent.color}
                    size={48}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="font-marker uppercase leading-[0.95] text-xl truncate" style={{ color: 'var(--fg-base)' }}>
                    {agent.name}
                  </h2>
                  {agent.index !== system.user.index && (
                    <div className="flex mt-1.5">
                      {agent.index === system.leadAgent.index ? (
                        <div
                          className="font-sketch uppercase tracking-[1px] text-[9px] px-1.5 py-0.5 leading-none flex items-center shrink-0"
                          style={{
                            backgroundColor: `${agent.color}15`,
                            color: agent.color,
                            border: `3px solid ${agent.color}`,
                            borderRadius: 0,
                          }}
                        >
                          Lead Agent
                        </div>
                      ) : (
                        <div
                          className="font-sketch uppercase tracking-[1px] text-[9px] px-1.5 py-0.5 leading-none flex items-center shrink-0"
                          style={{
                            backgroundColor: `${agent.color}15`,
                            color: agent.color,
                            border: `3px solid ${agent.color}`,
                            borderRadius: 0,
                          }}
                        >
                          Subagent
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Conditional Discussion/Chat Actions */}
              {needsInput && isChatting && (
                <div
                  className="p-3 animate-in fade-in slide-in-from-top-1"
                  style={{ backgroundColor: USER_COLOR_LIGHT, border: `3px solid ${USER_COLOR}`, borderRadius: 0 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-4 h-4 text-white" style={{ backgroundColor: USER_COLOR, borderRadius: 0 }}>
                        <MessageSquareWarning size={10} strokeWidth={3} />
                      </div>
                      <span className="font-sketch uppercase tracking-[1.5px] text-[9px]" style={{ color: USER_COLOR }}>Review Requested</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-sketch uppercase tracking-[1.5px] text-[9px] text-emerald-600">Active</span>
                    </div>
                  </div>
                  <p className="text-[12px] font-bold leading-tight mt-1.5 font-hand" style={{ color: '#27272a' }}>
                    {isLeadAgentIdle
                      ? "Waiting to review user brief."
                      : `${agent?.name} needs input.`}
                  </p>
                </div>
              )}

              {needsInput && !isChatting ? (
                <div
                  className="flex flex-col gap-3 p-4 animate-in fade-in slide-in-from-top-1"
                  style={{ background: 'var(--bg-surface)', border: '3px solid var(--stroke)', boxShadow: '4px 4px 0 0 var(--stroke)', borderRadius: 0 }}
                >
                  <div className="flex items-center gap-1.5 font-sketch uppercase tracking-[1.5px] text-[9px]">
                    <div
                      className="flex items-center justify-center w-5 h-5"
                      style={{ backgroundColor: USER_COLOR_LIGHT, border: `3px solid ${USER_COLOR}`, color: USER_COLOR, borderRadius: 0 }}
                    >
                      <MessageSquareWarning size={12} strokeWidth={3} />
                    </div>
                    <span style={{ color: USER_COLOR }}>Review Requested</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-[12px] font-bold leading-tight font-hand" style={{ color: 'var(--fg-base)' }}>
                      {isLeadAgentIdle
                        ? "Review the user brief with the team."
                        : `I've finished the task "${tasksOnHold[0]?.title ?? 'Work'}". I've submitted my work for your review.`}
                    </p>

                    {isLeadAgentIdle && (system.outputType === 'image' || system.outputType === 'video') && (
                      <div className="mt-1 pt-3 border-t-[3px]" style={{ borderColor: 'var(--stroke)' }}>
                        <ReferenceImages />
                      </div>
                    )}

                    <button
                      onClick={isLeadAgentIdle ? handleStartChat : () => useUiStore.getState().setActiveAuditTaskId(tasksOnHold[0]?.id)}
                      disabled={isLeadAgentIdle ? !canChat : false}
                      className="flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 px-4 py-3 font-sketch uppercase tracking-[1.5px] text-[10px] transition-all mt-1"
                      style={{ background: 'var(--fg-base)', color: 'var(--bg-base)', border: '3px solid var(--stroke)', boxShadow: '4px 4px 0 0 var(--stroke)', borderRadius: 0 }}
                    >
                      {isLeadAgentIdle ? (
                        <>
                          <MessageSquare size={14} strokeWidth={3} />
                          Chat about the brief
                        </>
                      ) : (
                        <>
                          <GitPullRequest size={14} strokeWidth={3} />
                          Review Task
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Chat Action Button below name - ONLY SHOW IF NOT NEEDS DISCUSSION (OR IF CHATTING) */
                <div className="w-full">
                  {agent.index === system.user.index ? (
                    null // No chat button for the local player
                  ) : isProjectReady ? (
                    <div
                      className="bg-yellow-50 p-4 flex flex-col gap-3"
                      style={{ border: '3px solid #ca8a04', boxShadow: '4px 4px 0 0 #ca8a04', borderRadius: 0 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        <span className="font-sketch uppercase tracking-[1.5px] text-[10px] text-yellow-700">Project Ready</span>
                      </div>
                      <button
                        onClick={() => setFinalOutputOpen(true)}
                        className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black px-4 py-2.5 font-sketch uppercase tracking-[1.5px] text-[10px] transition-all w-full"
                        style={{ border: '3px solid #ca8a04', boxShadow: '4px 4px 0 0 #ca8a04', borderRadius: 0 }}
                      >
                        <FolderOpen size={14} strokeWidth={3} />
                        View Final Output
                      </button>
                    </div>
                  ) : isChatting ? (
                    null
                  ) : (
                    <button
                      onClick={handleStartChat}
                      disabled={!canChat}
                      title={!canChat ? reason : undefined}
                      className="w-full h-10 px-4 flex items-center justify-center gap-2 transition-all active:scale-95 font-sketch uppercase tracking-[1.5px] text-[10px]"
                      style={canChat ? {
                        background: 'var(--fg-base)',
                        color: 'var(--bg-base)',
                        border: '3px solid var(--stroke)',
                        boxShadow: '4px 4px 0 0 var(--stroke)',
                        borderRadius: 0,
                      } : {
                        background: 'var(--bg-surface)',
                        color: 'var(--fg-base)',
                        opacity: 0.5,
                        border: '3px solid var(--stroke)',
                        borderRadius: 0,
                        cursor: 'not-allowed',
                      }}
                    >
                      {canChat ? (
                        <>
                          <MessageSquare size={13} />
                          Open Chat
                        </>
                      ) : (
                        <>
                          <Lock size={12} className="opacity-60" />
                          {reason}
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto relative min-h-0" style={{ background: isFloating ? 'var(--bg-base)' : 'var(--bg-surface)' }}>
            {isChatting ? (
              <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
                <div className="flex-1 overflow-y-auto">
                  <ChatPanel />
                </div>
                {/* Close Chat button at the bottom when chatting */}
                <div className="p-3 border-t-[3px] shrink-0" style={{ background: 'var(--bg-base)', borderColor: 'var(--stroke)' }}>
                  <button
                    onClick={handleEndChat}
                    className="w-full h-10 px-4 flex items-center justify-center gap-2 transition-all active:scale-95 font-sketch uppercase tracking-[1.5px] text-[10px]"
                    style={{ background: 'var(--fg-base)', color: 'var(--bg-base)', border: '3px solid var(--stroke)', boxShadow: '4px 4px 0 0 var(--stroke)', borderRadius: 0 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--bg-base)' }} />
                    Close Chat
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <AgentStatusPanel agentIndex={selectedNpcIndex!} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InspectorPanel;
