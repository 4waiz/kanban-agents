import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, GitPullRequest } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCoreStore } from '../integration/store/coreStore';
import { useUiStore } from '../integration/store/uiStore';
import { getAllAgents } from '../data/agents';
import { useActiveTeam } from '../integration/store/teamStore';
import { Avatar } from './components/Avatar';
import { InfoBubble } from './components/InfoBubble';
import { USER_COLOR } from '../theme/brand';
import { SketchButton, SketchCard } from './sketch';

interface AuditModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  viewOnly?: boolean;
}

export const AuditModal: React.FC<AuditModalProps> = ({ taskId, isOpen, onClose, viewOnly }) => {
  const { tasks, approveTask, rejectTask } = useCoreStore();
  const { setSelectedNpc, setChatting } = useUiStore();
  const activeTeam = useActiveTeam();
  const agents = getAllAgents(activeTeam);
  const [feedback, setFeedback] = useState('');
  const [selectedRevisionIndex, setSelectedRevisionIndex] = useState<number | null>(null);

  const task = tasks.find(t => t.id === taskId);
  if (!task || !isOpen) return null;

  const isViewMode = viewOnly || task.status === 'done';

  const agent = agents.find(a => a.index === task.assignedAgentId);

  const handleApprove = () => {
    approveTask(taskId);
    setSelectedNpc(null);
    setChatting(false);
    onClose();
  };

  const handleReject = () => {
    if (!feedback.trim()) return;
    rejectTask(taskId, feedback);
    setSelectedNpc(null);
    setChatting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-12">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-in fade-in duration-500"
        style={{ background: 'color-mix(in srgb, var(--bg-base) 75%, transparent)' }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="w-full max-w-4xl max-h-full flex animate-in zoom-in-95 fade-in duration-500 ease-out fill-mode-both"
        onClick={(e) => e.stopPropagation()}
      >
      <SketchCard
        variant="paper"
        seed="audit-modal"
        className="relative w-full max-h-full flex flex-col overflow-hidden"
        style={{ overflow: 'hidden' }}
      >

        {/* Header: Character Focus */}
        <div className="px-8 py-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                type={agent?.index === 0 ? 'user' : 'sub'}
                color={agent?.color}
                size={64}
              />
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center text-white"
                style={{ backgroundColor: agent?.color || '#333', border: '3px solid var(--bg-base)', borderRadius: 0 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ color: 'var(--fg-base)' }}>{agent?.name}</span>
                {!isViewMode && (
                  <span className="text-[10px] font-sketch uppercase tracking-[1.5px] px-2 py-0.5" style={{ border: `3px solid ${USER_COLOR}`, color: USER_COLOR, borderRadius: 0 }}>Requires Review</span>
                )}
              </div>
              <h2 className="font-marker uppercase text-2xl leading-[0.95]" style={{ color: 'var(--fg-base)' }}>
                {task.title}
              </h2>
              {isViewMode && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-sketch uppercase tracking-[1.5px] text-emerald-600">COMPLETED WORK</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-3 transition-opacity opacity-60 hover:opacity-100 active:scale-95 group"
            style={{ color: 'var(--fg-base)' }}
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] px-6 pb-6">
          <div className="flex gap-6">
            {/* Main content */}
            <div className={`flex-1 space-y-10 ${task.revisions.length > 0 ? 'border-r-[3px] pr-6' : ''}`} style={task.revisions.length > 0 ? { borderColor: 'var(--stroke)' } : undefined}>
              {/* Draft / Result Output */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4" style={{ background: 'var(--fg-base)' }} />
                    <h3 className="text-[12px] font-sketch uppercase tracking-[1.5px]" style={{ color: 'var(--fg-base)', opacity: 0.65 }}>
                      {selectedRevisionIndex !== null ? `Revision V${selectedRevisionIndex + 1}` : (isViewMode ? 'Final Output' : 'Current Proposal')}
                    </h3>
                  </div>
                  {selectedRevisionIndex !== null && (
                    <button
                      onClick={() => setSelectedRevisionIndex(null)}
                      className="text-[9px] font-sketch uppercase tracking-[1.5px] transition-opacity opacity-60 hover:opacity-100"
                      style={{ color: 'var(--fg-base)' }}
                    >
                      Back to latest
                    </button>
                  )}
                </div>
                <div className="p-8 min-h-[350px]" style={{ background: 'var(--bg-surface)', border: '3px solid var(--stroke)', borderRadius: 0 }}>
                  <div className="markdown-content text-sm leading-relaxed font-hand" style={{ color: 'var(--fg-base)' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedRevisionIndex !== null
                        ? task.revisions[selectedRevisionIndex].output
                        : (isViewMode ? (task.output || task.draftOutput) : (task.draftOutput || 'No content produced.'))}
                    </ReactMarkdown>
                  </div>
                </div>
              </section>

            </div>

            {/* Revision Sidebar (Creativa) */}
            {(task.revisions?.length ?? 0) > 0 && (
              <div className="w-56 shrink-0 flex flex-col pt-4 animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="flex items-center gap-2 mb-6" style={{ color: USER_COLOR }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: USER_COLOR }} />
                  <span className="text-[10px] font-sketch uppercase tracking-[1.5px]">Version History</span>
                  <InfoBubble text="View previous iterations of this task. You can see how the work evolved or revert to a stronger version." />
                </div>
                <div className="space-y-2 overflow-y-auto pr-2 max-h-[60vh] [scrollbar-width:none]">
                  {task.revisions.map((rev, idx) => {
                    const active = selectedRevisionIndex === idx;
                    return (
                    <button
                      key={idx}
                      onClick={() => setSelectedRevisionIndex(idx)}
                      className="w-full text-left p-2.5 transition-all group/rev"
                      style={{
                        background: active ? 'var(--fg-base)' : 'var(--bg-base)',
                        color: active ? 'var(--bg-base)' : 'var(--fg-base)',
                        border: '3px solid var(--stroke)',
                        borderRadius: 0,
                        boxShadow: active ? '4px 4px 0 0 var(--stroke)' : 'none',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-sketch uppercase tracking-[1.5px]" style={{ opacity: 0.7 }}>Version {idx + 1}</span>
                        <span className="text-[9px] font-sketch opacity-50 uppercase">{new Date(rev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {rev.feedback && (
                        <p className="text-[13px] leading-tight line-clamp-2 italic font-hand" style={{ opacity: 0.75 }}>
                          "{rev.feedback}"
                        </p>
                      )}
                    </button>
                    );
                  })}
                  {/* Current one indicator */}
                  {!isViewMode && (
                    <button
                      onClick={() => setSelectedRevisionIndex(null)}
                      className="w-full text-left p-3 transition-all mt-2 flex flex-col gap-1"
                      style={{
                        background: 'var(--bg-base)',
                        border: selectedRevisionIndex === null ? '3px solid #10b981' : '3px solid var(--stroke)',
                        borderRadius: 0,
                        boxShadow: selectedRevisionIndex === null ? '4px 4px 0 0 #10b981' : 'none',
                      }}
                    >
                      <span className="text-[12px] font-sketch uppercase tracking-[1.5px] text-emerald-600">Active Review</span>
                      <p className="text-[13px] text-emerald-500 font-hand leading-none">In review process...</p>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Area (Always Visible in Review Mode) */}
        {!isViewMode && selectedRevisionIndex === null && (
          <div className="px-8 py-4 border-t-[3px]" style={{ borderColor: 'var(--stroke)' }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--fg-base)', opacity: 0.65 }}>
              <div className="flex items-center gap-2">
                <GitPullRequest size={12} />
                <span className="text-[12px] font-sketch uppercase tracking-[1.5px]">Your Feedback</span>
              </div>
              <InfoBubble text="Provide specific instructions for what to change. The agent will read this and attempt a new version." />
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Describe what needs to be changed before rejecting..."
              className="w-full p-3 text-[14px] font-hand focus:outline-none transition-all resize-none h-20 placeholder:italic"
              style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-8 py-8 border-t-[3px] flex items-center justify-end gap-4 shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--stroke)' }}>
          {(isViewMode || selectedRevisionIndex !== null) ? (
            <SketchButton
              variant="filled"
              size="md"
              seed="audit-close-viewer"
              onClick={selectedRevisionIndex !== null ? () => setSelectedRevisionIndex(null) : onClose}
            >
              {selectedRevisionIndex !== null ? 'Show Active Review' : 'Close Viewer'}
            </SketchButton>
          ) : (
            <>
              <SketchButton
                variant="default"
                size="md"
                seed="audit-reject"
                onClick={handleReject}
                disabled={!feedback.trim()}
              >
                <AlertCircle size={14} strokeWidth={3} />
                Reject with Feedback
              </SketchButton>

              <SketchButton
                variant="filled"
                size="md"
                seed="audit-approve"
                onClick={handleApprove}
              >
                <CheckCircle2 size={14} strokeWidth={3} />
                Approve Task
              </SketchButton>
            </>
          )}
        </div>
      </SketchCard>
      </div>
    </div>
  );
};
