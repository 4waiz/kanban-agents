import { Cpu, Save, Target, Trash2, User, X, Check, Pipette, Zap, CircleUser } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { AgentNode, AgenticSystem, getAllCharacters } from '../../data/agents';
import { USER_COLOR, USER_COLOR_LIGHT, USER_COLOR_SOFT } from '../../theme/brand';
import { useCoreStore } from '../../integration/store/coreStore';
import { useTeamStore } from '../../integration/store/teamStore';
import { Avatar } from '../components/Avatar';
import { ColorPicker } from './ColorPicker';
import { InfoBubble } from '../components/InfoBubble';
import { getBrightness, MAX_BRIGHTNESS } from './colorUtils';
import { SketchButton } from '../sketch';

interface AgentConfigPanelProps {
  agent: AgentNode;
  system: AgenticSystem;
  onClose: (wasSaved: boolean) => void;
  onUpdate: (updatedAgent: AgentNode) => void;
  onRemove?: () => void;
  mode?: 'view' | 'edit';
}

export const AgentConfigPanel: React.FC<AgentConfigPanelProps> = ({
  agent,
  system: activeSystem,
  onClose,
  onUpdate,
  onRemove,
  mode = 'edit'
}) => {
  const isView = mode === 'view';
  const { availableModels } = useCoreStore();
  const { saveCustomSystem } = useTeamStore();

  const [editData, setEditData] = useState<AgentNode>(agent);
  const isUser = agent.index === 0;
  const isLead = agent.index === 1;

  useEffect(() => {
    setEditData(agent);
  }, [agent]);

  const updateDraft = (changes: Partial<AgentNode>) => {
    const newData = { ...editData, ...changes };
    setEditData(newData);
    onUpdate(newData);
  };

  const allCharacters = useMemo(() => getAllCharacters(activeSystem), [activeSystem]);


  const nameCollision = useMemo(() => {
    return allCharacters.some(c =>
      c.id !== agent.id && c.name.toLowerCase().trim() === editData.name.toLowerCase().trim()
    );
  }, [allCharacters, agent.id, editData.name]);

  const isValid = useMemo(() => {
    const brightness = getBrightness(editData.color);
    const isNameEmpty = editData.name.trim() === '';
    return brightness <= MAX_BRIGHTNESS && !nameCollision && !isNameEmpty;
  }, [editData.color, editData.name, nameCollision]);

  const handleSave = () => {
    if (!isValid) return;

    const oldId = agent.id;
    const newId = editData.id;

    // 1. Recursive update function
    const updateRecursive = (node: AgentNode): AgentNode => {
      // If this is the node being edited
      let updatedNode = node.id === agent.id ? { ...editData } : { ...node };


      // Recurse subagents
      if (updatedNode.subagents) {
        updatedNode.subagents = updatedNode.subagents.map(updateRecursive);
      }

      return updatedNode;
    };

    const newLeadAgent = updateRecursive(activeSystem.leadAgent);

    const updatedSystem: AgenticSystem = {
      ...activeSystem,
      leadAgent: newLeadAgent,
    };

    saveCustomSystem(updatedSystem);
    onClose(true); // SAVED
  };

  const handleNameChange = (name: string) => {
    // Limit to letters, numbers and spaces
    const sanitizedName = name.replace(/[^a-zA-Z0-9 ]/g, '');
    updateDraft({ name: sanitizedName });
  };


  const renderField = (label: string, icon: React.ReactNode, value: React.ReactNode, helpText?: string, inline?: boolean) => (
    <div className={inline ? "flex items-center justify-between" : "space-y-1.5"}>
      <div className="flex items-center gap-1.5">
        {icon && <div className="shrink-0" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>{icon}</div>}
        <label className="font-sketch uppercase tracking-[1.5px] text-[12px] block" style={{ color: 'var(--fg-base)', opacity: 0.7 }}>{label}</label>
        {helpText && <InfoBubble text={helpText} />}
      </div>
      <div className={inline ? "" : "px-1"}>{value}</div>
    </div>
  );

  return (
    <div className="w-80 h-full border-l-[3px] flex flex-col pointer-events-auto overflow-hidden animate-in slide-in-from-right-full duration-300" style={{ background: 'var(--bg-base)', borderColor: 'var(--stroke)' }}>
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b-[3px]" style={{ background: 'var(--bg-surface)', borderColor: 'var(--stroke)' }}>
        <div className="flex items-center gap-2">
          {isUser ? (
            <Avatar type="user" color={USER_COLOR} size={32} />
          ) : (
            <Avatar type={isLead ? 'lead' : 'sub'} color={editData.color} size={32} />
          )}
          <h3 className="font-marker uppercase text-base leading-[0.95] truncate" style={{ color: 'var(--fg-base)' }}>
            {isUser ? 'User Info' : (isLead ? 'Lead Agent Info' : 'Subagent Info')}
          </h3>
        </div>
        <button onClick={() => onClose(false)} className="p-1 transition-opacity opacity-60 hover:opacity-100" style={{ color: 'var(--fg-base)' }}>
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        {isUser ? (
          <div
            className="flex flex-col items-center justify-center p-8 text-center space-y-4"
            style={{ backgroundColor: USER_COLOR_LIGHT, border: `3px solid ${USER_COLOR}`, boxShadow: `4px 4px 0 0 ${USER_COLOR}`, borderRadius: 0 }}
          >
            <div className="p-1">
              <Avatar type="user" color={USER_COLOR} size={64} />
            </div>
            <div>
              <h4 className="font-marker uppercase text-base leading-[0.95] mb-1" style={{ color: 'var(--fg-base)' }}>Primary User</h4>
              <p className="font-hand text-sm leading-relaxed" style={{ color: 'var(--fg-base)', opacity: 0.7 }}>This is you. Your identity and role are fixed across all teams for consistency.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Identity Group */}
            <div className="space-y-6">
              {!isView && (
                <div className="space-y-1.5 px-1">
                  <div className="flex items-center gap-1.5">
                    <Pipette size={12} style={{ color: 'var(--fg-base)', opacity: 0.6 }} />
                    <label className="font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ color: 'var(--fg-base)', opacity: 0.7 }}>Agent Color</label>
                  </div>
                  <ColorPicker
                    color={editData.color}
                    onChange={(val) => updateDraft({ color: val })}
                  />
                </div>
              )}

              {renderField('Name', <CircleUser size={12} />, isView ? (
                <p className="font-hand text-base" style={{ color: 'var(--fg-base)' }}>{editData.name}</p>
              ) : (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 font-hand text-sm focus:outline-none"
                    style={{ background: 'var(--bg-base)', color: nameCollision ? '#dc2626' : 'var(--fg-base)', border: nameCollision ? '3px solid #ef4444' : '3px solid var(--stroke)', borderRadius: 0 }}
                  />
                  {nameCollision && (
                    <p className="font-sketch text-red-500 uppercase tracking-[1.5px] text-[12px] px-1">
                      This name is already used in the team
                    </p>
                  )}
                </div>
              ), 'Limit characters to letters, numbers and spaces. The ID is auto-generated.')}

              {renderField('LLM Model', <Cpu size={12} />, isView ? (
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono w-fit lowercase" style={{ background: 'var(--bg-surface)', color: 'var(--fg-base)', opacity: 0.85, border: '3px solid var(--stroke)', borderRadius: 0 }}>
                  {editData.model || 'gemini-3-flash-preview'}
                </div>
              ) : (
                <select
                  value={editData.model || 'gemini-3-flash-preview'}
                  onChange={(e) => updateDraft({ model: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono focus:outline-none cursor-pointer lowercase"
                  style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
                >
                  {availableModels.map(m => <option key={m} value={m} className="lowercase">{m}</option>)}
                </select>
              ), 'The specific Gemini model this agent will use.')}
            </div>

            {/* Content Group */}
            <div className="space-y-6">
              {renderField('Description', <Target size={12} />, isView ? (
                <div className="p-4 min-h-[120px]" style={{ background: 'var(--bg-surface)', border: '3px solid var(--stroke)', borderRadius: 0 }}>
                  <p className="font-hand text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--fg-base)', opacity: 0.8 }}>
                    {editData.description || "No description provided."}
                  </p>
                </div>
              ) : (
                <textarea
                  value={editData.description}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                  className="w-full h-48 px-3 py-2 font-hand text-sm leading-relaxed focus:outline-none resize-none"
                  style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
                  placeholder="What is this agent specialized in? What are its primary goals and constraints?"
                />
              ), 'A concise yet comprehensive definition of the agent\'s role, expertise, and operational guidelines.')}
            </div>


            {/* Capabilities & Controls */}
            <div className="space-y-6">
              {renderField('Capabilities', <Zap size={12} />, (
                <div className="p-4 gap-y-3 flex flex-col" style={{ background: 'var(--bg-surface)', border: '3px solid var(--stroke)', borderRadius: 0 }}>
                  {isLead && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0" style={{ background: 'var(--fg-base)', borderRadius: 0 }}>
                        <Check size={10} style={{ color: 'var(--bg-base)' }} strokeWidth={3} />
                      </div>
                      <span className="font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ color: 'var(--fg-base)' }}>Set Project Brief</span>
                    </div>
                  )}
                  {(editData.subagents?.length || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0" style={{ background: 'var(--fg-base)', borderRadius: 0 }}>
                        <Check size={10} style={{ color: 'var(--bg-base)' }} strokeWidth={3} />
                      </div>
                      <span className="font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ color: 'var(--fg-base)' }}>Propose Tasks</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0" style={{ background: 'var(--fg-base)', borderRadius: 0 }}>
                      <Check size={10} style={{ color: 'var(--bg-base)' }} strokeWidth={3} />
                    </div>
                    <span className="font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ color: 'var(--fg-base)' }}>Execute & Complete Tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0" style={{ background: 'var(--fg-base)', borderRadius: 0 }}>
                      <Check size={10} style={{ color: 'var(--bg-base)' }} strokeWidth={3} />
                    </div>
                    <span className="font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ color: 'var(--fg-base)' }}>Autonomous Reasoning</span>
                  </div>
                  {isLead && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0" style={{ background: 'var(--fg-base)', borderRadius: 0 }}>
                        <Check size={10} style={{ color: 'var(--bg-base)' }} strokeWidth={3} />
                      </div>
                      <span className="font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ color: 'var(--fg-base)' }}>Deliver Project</span>
                    </div>
                  )}
                </div>
              ), "Tools are automatically assigned based on the agent's role and team hierarchy.")}

              {renderField('Supervision', <User size={12} />, (
                <div
                  onClick={() => !isView && updateDraft({ humanInTheLoop: !editData.humanInTheLoop })}
                  className={`
                      group flex items-center justify-between p-4 transition-all duration-200
                      ${isView ? 'pointer-events-none' : 'cursor-pointer active:scale-[0.98]'}
                    `}
                  style={{
                    backgroundColor: editData.humanInTheLoop ? USER_COLOR_LIGHT : 'var(--bg-surface)',
                    border: editData.humanInTheLoop ? `3px solid ${USER_COLOR}` : '3px solid var(--stroke)',
                    boxShadow: editData.humanInTheLoop ? `4px 4px 0 0 ${USER_COLOR}` : '4px 4px 0 0 var(--stroke)',
                    borderRadius: 0
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="font-sketch uppercase tracking-[1.5px] text-[12px]"
                      style={{ color: editData.humanInTheLoop ? USER_COLOR : 'var(--fg-base)' }}
                    >
                      Human-in-the-loop
                    </span>
                    <span className="font-hand text-xs leading-tight max-w-[160px]" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>
                      Agent must request your validation before completing any task.
                    </span>
                  </div>
                  <div className="w-8 h-4 relative transition-colors duration-200"
                    style={{ backgroundColor: editData.humanInTheLoop ? USER_COLOR : 'var(--bg-base)', border: '2px solid var(--stroke)', borderRadius: 0 }}
                  >
                    <div className={`
                        absolute top-0 w-3 h-3 transition-transform duration-200
                        ${editData.humanInTheLoop ? 'translate-x-4' : 'translate-x-0'}
                      `}
                      style={{ background: 'var(--fg-base)', borderRadius: 0 }}
                    />
                  </div>
                </div>
              ), "When enabled, the agent will pause their work to submit the result for your review and feedback before finalizing.")}
            </div>
          </>
        )}
      </div>

      {/* Footer Actions */}
      {!isView && !isUser && (
        <div className="p-4 border-t-[3px] flex flex-col gap-2" style={{ background: 'var(--bg-surface)', borderColor: 'var(--stroke)' }}>
          <SketchButton
            variant="filled"
            size="md"
            onClick={handleSave}
            disabled={!isValid}
            seed="update-agent"
            className="w-full"
          >
            <Save size={16} strokeWidth={2.5} />
            Update Agent
          </SketchButton>
          {onRemove && (
            <button
              onClick={onRemove}
              className="w-full py-2.5 text-red-500 font-sketch uppercase tracking-[1.5px] text-[12px] flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
            >
              <Trash2 size={14} />
              Remove from Team
            </button>
          )}
        </div>
      )}
    </div>
  );
};
