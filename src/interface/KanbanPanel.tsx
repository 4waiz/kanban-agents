import { ChevronDown, ChevronRight, MessageSquareWarning, Trash2, GitPullRequest } from 'lucide-react'
import React, { useState } from 'react'
import { getAllAgents, USER_NAME } from '../data/agents'
import { USER_COLOR, USER_COLOR_LIGHT, USER_COLOR_SOFT } from '../theme/brand'
import { useCoreStore, type Task, type TaskStatus } from '../integration/store/coreStore'
import { getActiveAgentSet, useTeamStore } from '../integration/store/teamStore'
import { useUiStore } from '../integration/store/uiStore'
import DeleteTaskModal from './DeleteTaskModal'

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'scheduled', label: 'Scheduled' },
  { status: 'on_hold', label: 'On Hold' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
]

interface KanbanPanelProps {
  height?: number;
}

function renderAgentTag(agentIndex: number) {
  const system = getActiveAgentSet();
  if (agentIndex === 0) { // Client / You
    return (
      <span key={agentIndex} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: USER_COLOR }}>
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: USER_COLOR }}
        />
        {USER_NAME}
      </span>
    )
  }
  const agent = getAllAgents(system).find(a => a.index === agentIndex)
  if (!agent) return null
  return (
    <span key={agentIndex} className="flex items-center gap-1 text-[10px] font-hand" style={{ color: 'var(--fg-base)', opacity: 0.7 }}>
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: agent.color }}
      />
      {agent.name}
    </span>
  )
}

function TaskCard({ task }: { task: Task; key?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { removeTask } = useCoreStore()
  const { setSelectedNpc, setActiveAuditTaskId } = useUiStore()

  // For visual representation, we show both the owner and any consultation target
  const effectiveAgentIds = [task.assignedAgentId];

  const handleSelectAgent = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Select the assigned NPC
    setSelectedNpc(task.assignedAgentId);
  };

  return (
    <div
      key={task.id}
      className="p-3 space-y-2 group relative"
      style={{
        background: 'var(--bg-surface)',
        border: '3px solid var(--stroke)',
        boxShadow: '4px 4px 0 0 var(--stroke)',
        borderRadius: 0,
      }}
    >
      <div
        className="flex items-start justify-between gap-1 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xs leading-snug font-bold flex-1 font-hand" style={{ color: 'var(--fg-base)' }}>
          {task.title || 'Untitled Task'}
        </h3>
        <div className="flex items-center gap-1 opacity-100 group-hover:opacity-100 transition-opacity">

          {task.status !== 'done' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDeleteModalOpen(true)
                }}
                className="p-1 hover:text-red-500 transition-all opacity-50 hover:opacity-100"
                style={{ color: 'var(--fg-base)', borderRadius: 0 }}
                title="Remove task"
              >
                <Trash2 size={12} />
              </button>
              <DeleteTaskModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => removeTask(task.id)}
                taskTitle={task.title}
              />
            </>
          )}
        </div>
        <button className="transition-opacity opacity-40 group-hover:opacity-70" style={{ color: 'var(--fg-base)' }}>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {isExpanded && (
        <p
          className="text-[11px] leading-relaxed p-2 font-hand animate-in fade-in slide-in-from-top-1 duration-200"
          style={{
            color: 'var(--fg-base)',
            opacity: 0.85,
            background: 'var(--bg-base)',
            border: '3px solid var(--stroke)',
            borderRadius: 0,
          }}
        >
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-x-2 gap-y-1 pt-1">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {effectiveAgentIds.map(renderAgentTag)}
        </div>

        <div className="flex items-center gap-2">
          {task.status === 'in_progress' && (
            <span
              className="inline-block font-sketch uppercase tracking-[1px] text-[10px] px-2 py-0.5 whitespace-nowrap"
              style={{
                color: USER_COLOR,
                backgroundColor: USER_COLOR_LIGHT,
                border: `3px solid ${USER_COLOR}`,
                borderRadius: 0,
              }}
            >
              working
            </span>
          )}

          {(task.status === 'done' || task.draftOutput || (task.revisions && task.revisions.length > 0)) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveAuditTaskId(task.id);
              }}
              className="p-1 px-2 hover:text-emerald-500 transition-all flex items-center gap-1.5 group/audit opacity-60 hover:opacity-100"
              style={{ color: 'var(--fg-base)', borderRadius: 0 }}
              title="View work details"
            >
              {task.revisions?.length > 0 && (
                <span className="text-[10px] font-black group-hover/audit:text-emerald-400 transition-colors" style={{ color: 'var(--fg-base)', opacity: 0.5 }}>
                  {task.revisions.length}
                </span>
              )}
              <GitPullRequest size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function KanbanPanel({ height = 320 }: KanbanPanelProps) {
  const { tasks } = useCoreStore()

  return (
    <div
      className="w-full border-t-[3px] flex flex-col pointer-events-auto shrink-0 relative"
      style={{ height, background: 'var(--bg-base)', borderColor: 'var(--stroke)' }}
    >
      {/* Columns Scroll Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden" style={{ background: 'var(--bg-surface)' }}>
        <div className="flex h-full min-w-max px-5 py-4 gap-4">
          {COLUMNS.map(({ status, label }) => {
            const colTasks = tasks.filter((t) => t.status === status)
            return (
              <div key={status} className="w-52 flex flex-col gap-3">
                <div className="flex items-center justify-between shrink-0 select-none">
                  <div className="flex items-center gap-2">
                    <span className="font-sketch uppercase tracking-[1.5px] text-[10px] leading-none" style={{ color: 'var(--fg-base)', opacity: 0.65 }}>
                      {label}
                    </span>
                    <span
                      className="px-1.5 py-0.5 text-[9px] font-bold min-w-4.5 text-center"
                      style={{
                        background: 'var(--fg-base)',
                        color: 'var(--bg-base)',
                        borderRadius: 0,
                      }}
                    >
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 pb-1">
                  {colTasks.map((t) => (
                    <TaskCard key={t.id} task={t} />
                  ))}
                  {colTasks.length === 0 && (
                    <div
                      className="p-4 flex items-center justify-center select-none"
                      style={{ border: '3px dashed var(--stroke)', opacity: 0.4, borderRadius: 0 }}
                    >
                      <span className="font-sketch uppercase tracking-[1.5px] text-[10px]" style={{ color: 'var(--fg-base)' }}>Empty</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
