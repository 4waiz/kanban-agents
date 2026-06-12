import { Edit2, Pipette, Trash2, Users, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AgenticSystem, DEFAULT_AGENTIC_SET_ID, getAllAgents } from '../../data/agents';
import { DEFAULT_MODELS, AVAILABLE_MODELS, ModelType } from '../../core/llm/constants';
import { USER_COLOR } from '../../theme/brand';
import { useTeamStore } from '../../integration/store/teamStore';
import { useSceneManager } from '../../simulation/SceneContext';
import { getBrightness, getDarkenedColor } from './colorUtils';
import { ColorPicker } from './ColorPicker';
import { InfoBubble } from '../components/InfoBubble';
import { TeamOutputBadge } from '../components/TeamOutputBadge';
import { SketchButton } from '../sketch';

interface TeamCardProps {
  system: AgenticSystem;
  isSelected: boolean;
  isActive: boolean;
  isPredefined: boolean;
  mode: 'view' | 'edit';
  onSelectTeam: (id: string) => void;
  onModeChange: (mode: 'view' | 'edit') => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  system,
  isSelected,
  isActive,
  isPredefined,
  mode,
  onSelectTeam,
  onModeChange,
}) => {
  const { setActiveTeam, updateSystem, deleteCustomSystem, selectedAgentSetId } = useTeamStore();
  const scene = useSceneManager();
  const colorInputRef = useRef<HTMLInputElement>(null);

  const [localEditData, setLocalEditData] = useState<Partial<AgenticSystem>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasColorSuggestion, setHasColorSuggestion] = useState(false);

  const isEditing = mode === 'edit' && isSelected;
  const agentCount = useMemo(() => getAllAgents(system).length, [system]);

  useEffect(() => {
    if (isEditing) {
      setLocalEditData({
        teamName: system.teamName || '',
        teamType: system.teamType || '',
        teamDescription: system.teamDescription || 'A custom agentic team.',
        color: system.color || '#A855F7',
        outputType: system.outputType || 'text',
        outputModel: system.outputModel || DEFAULT_MODELS.text,
        outputAutoApprove: system.outputAutoApprove !== undefined ? system.outputAutoApprove : (system.outputType === 'text')
      });
      setErrorMsg(null);
      setShowDeleteConfirm(false);
      setHasColorSuggestion(false);
    } else {
      setErrorMsg(null);
      setShowDeleteConfirm(false);
      setHasColorSuggestion(false);
    }
  }, [isEditing, system]);

  const hasUnsavedChanges = useMemo(() => {
    return localEditData.teamName !== (system.teamName || '') ||
      localEditData.teamType !== (system.teamType || '') ||
      localEditData.teamDescription !== (system.teamDescription || '') ||
      localEditData.color !== (system.color || '#A855F7') ||
      localEditData.outputType !== (system.outputType || 'text') ||
      localEditData.outputModel !== (system.outputModel || DEFAULT_MODELS.text) ||
      localEditData.outputAutoApprove !== (system.outputAutoApprove);
  }, [localEditData, system]);

  const isFormValid = !!(localEditData.teamName?.trim() &&
    localEditData.teamType?.trim() &&
    localEditData.teamDescription?.trim() &&
    !hasColorSuggestion);

  const handleSwitch = (e: React.MouseEvent) => {
    e.stopPropagation();
    scene?.resetScene();
    setActiveTeam(system.id);
  };

  const handleSave = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isFormValid) {
      setErrorMsg('Please fill Name, Type and Description or delete the team.');
      return;
    }
    updateSystem(system.id, localEditData);
    onModeChange('view');
  };

  const handleCloseEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFormValid) {
      if (hasColorSuggestion) {
        setErrorMsg('Please choose a darker color (use suggestion or pick another) before saving.');
      } else {
        setErrorMsg('Please fill Name, Type and Description or delete the team.');
      }
      return;
    }
    if (hasUnsavedChanges) {
      setErrorMsg('Unsaved changes will be lost. Save or close again to discard.');
      if (errorMsg?.includes('Unsaved changes')) {
        onModeChange('view');
      }
      return;
    }
    onModeChange('view');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
    setErrorMsg('Delete this team?');
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (system.id === selectedAgentSetId) {
      scene?.resetScene();
      setActiveTeam(DEFAULT_AGENTIC_SET_ID);
    }
    deleteCustomSystem(system.id);
    onModeChange('view');
  };

  const handleColorChange = (newColor: string) => {
    setLocalEditData(prev => ({ ...prev, color: newColor }));

    // Check if new color is too light to update form validity status
    const brightness = getBrightness(newColor);
    setHasColorSuggestion(brightness > 180);
    setErrorMsg(null);
  };

  return (
    <div
      onClick={() => onSelectTeam(system.id)}
      className="group relative p-3.5 transition-all cursor-pointer"
      style={{
        background: isSelected ? 'var(--bg-surface)' : 'var(--bg-base)',
        borderRadius: 0,
        border: `3px solid ${isSelected ? system.color : (isActive ? `${system.color}80` : 'var(--stroke)')}`,
        boxShadow: isSelected ? `4px 4px 0 0 ${system.color}` : '4px 4px 0 0 var(--stroke)'
      }}
    >
      {isEditing && (
        <div className="mb-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b-[3px]" style={{ borderColor: 'var(--stroke)' }}>
            <div className="flex items-center gap-2">
              <h3 className="font-marker uppercase text-base leading-[0.95]" style={{ color: 'var(--fg-base)' }}>Edit Team</h3>
            </div>
            <button onClick={handleCloseEdit} className="p-1 transition-opacity opacity-60 hover:opacity-100" style={{ color: 'var(--fg-base)' }}>
              <X size={14} strokeWidth={3} />
            </button>
          </div>
          {errorMsg && (
            <div className="flex items-center justify-between gap-2 p-2 bg-red-50 mb-2" style={{ border: '3px solid #ef4444', borderRadius: 0 }}>
              <p className="font-sketch text-red-600 leading-tight uppercase tracking-[1.5px] text-[12px]">
                {errorMsg}
              </p>
              {showDeleteConfirm && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); setErrorMsg(null); }} className="px-2 py-0.5 bg-white text-red-400 font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ border: '2px solid #ef4444', borderRadius: 0 }}>Cancel</button>
                  <button onClick={confirmDelete} className="px-2 py-0.5 bg-red-500 text-white font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ border: '2px solid #ef4444', borderRadius: 0 }}>OK</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isSelected && !isEditing && (
        <button
          onClick={(e) => { e.stopPropagation(); onModeChange('edit'); }}
          className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1.5 font-sketch uppercase tracking-[1.5px] text-[12px] transition-all opacity-0 group-hover:opacity-100 z-10"
          style={{ background: 'var(--bg-surface)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', boxShadow: '3px 3px 0 0 var(--stroke)', borderRadius: 0 }}
        >
          <Edit2 size={12} strokeWidth={2.5} />
          Edit Team
        </button>
      )}

      <div className="flex flex-col">
        {/* Header Row: Badge + Name/Type */}
        <div className="flex items-start gap-3.5 mb-3">
          {!isEditing && (
            <div className="relative shrink-0">
              <div
                className="h-9 px-3 flex items-center justify-center gap-2"
                style={{ backgroundColor: system.color, border: '3px solid var(--stroke)', boxShadow: '3px 3px 0 0 var(--stroke)', borderRadius: 0 }}
              >
                <Users size={14} className="text-white opacity-90" strokeWidth={3} />
                <span className="text-xs font-marker text-white leading-none">
                  {agentCount}
                </span>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col">
            {isEditing ? (
              <div className="space-y-1 mb-2">
                <label className="font-sketch uppercase tracking-[1.5px] text-[12px] ml-1" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Team Color</label>
                <div className="px-1">
                  <ColorPicker
                    color={localEditData.color || '#A855F7'}
                    onChange={handleColorChange}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-0.5">
                <h4 className="font-marker text-base leading-[0.95] uppercase truncate mb-0.5" style={{ color: 'var(--fg-base)', opacity: system.teamName ? 1 : 0.35 }}>{system.teamName || 'Untitled Team'}</h4>
                <p className="font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ color: 'var(--fg-base)', opacity: system.teamType ? 0.6 : 0.3 }}>{system.teamType || 'Unspecified Type'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Body Content: Spans full width */}
        <div className="flex flex-col flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2 mb-3" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-1">
                <label className="font-sketch uppercase tracking-[1.5px] text-[12px] ml-1" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Team Name</label>
                <input
                  value={localEditData.teamName || ''}
                  onChange={(e) => { setLocalEditData(prev => ({ ...prev, teamName: e.target.value })); setErrorMsg(null); }}
                  className="w-full font-hand text-sm px-2.5 py-1.5 outline-none transition-colors"
                  style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
                  onFocus={(e) => e.target.style.borderColor = USER_COLOR}
                  onBlur={(e) => e.target.style.borderColor = 'var(--stroke)'}
                />
              </div>
              <div className="space-y-1">
                <label className="font-sketch uppercase tracking-[1.5px] text-[12px] ml-1" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Team Type</label>
                <input
                  value={localEditData.teamType || ''}
                  onChange={(e) => { setLocalEditData(prev => ({ ...prev, teamType: e.target.value })); setErrorMsg(null); }}
                  className="w-full font-hand text-sm px-2.5 py-1.5 outline-none transition-colors"
                  style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
                  onFocus={(e) => e.target.style.borderColor = USER_COLOR}
                  onBlur={(e) => e.target.style.borderColor = 'var(--stroke)'}
                />
              </div>
              <div className="space-y-1">
                <label className="font-sketch uppercase tracking-[1.5px] text-[12px] ml-1" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Description</label>
                <textarea
                  value={localEditData.teamDescription || ''}
                  onChange={(e) => { setLocalEditData(prev => ({ ...prev, teamDescription: e.target.value })); setErrorMsg(null); }}
                  className="w-full font-hand text-sm p-2.5 outline-none resize-none h-20 leading-snug transition-colors"
                  style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
                  onFocus={(e) => e.target.style.borderColor = USER_COLOR}
                  onBlur={(e) => e.target.style.borderColor = 'var(--stroke)'}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-sketch uppercase tracking-[1.5px] text-[12px] ml-1" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Output Type</label>
                  <select
                    value={localEditData.outputType || 'text'}
                    onChange={(e) => {
                      const newType = e.target.value as keyof typeof DEFAULT_MODELS;
                      setLocalEditData(prev => ({
                        ...prev,
                        outputType: newType,
                        outputModel: DEFAULT_MODELS[newType] || prev.outputModel,
                        outputAutoApprove: newType === 'text'
                      }));
                    }}
                    className="w-full font-hand text-xs px-2.5 py-1.5 outline-none cursor-pointer"
                    style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
                  >
                    <option value="text">TEXT</option>
                    <option value="image">IMAGE</option>
                    <option value="music">MUSIC</option>
                    <option value="video">VIDEO</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-sketch uppercase tracking-[1.5px] text-[12px] ml-1" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Output Model</label>
                  <select
                    value={localEditData.outputModel || DEFAULT_MODELS.text}
                    onChange={(e) => setLocalEditData(prev => ({ ...prev, outputModel: e.target.value }))}
                    className="w-full font-mono text-[10px] px-2.5 py-1.5 outline-none cursor-pointer lowercase"
                    style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
                  >
                    {(AVAILABLE_MODELS[localEditData.outputType as ModelType] || []).map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 mt-0.5" style={{ background: 'var(--bg-surface)', border: '3px solid var(--stroke)', borderRadius: 0 }}>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ color: 'var(--fg-base)' }}>Auto-Approve Output</span>
                    <InfoBubble text="When enabled, the team will generate the final asset immediately after finishing all tasks without waiting for your review." />
                  </div>
                  <span className="font-hand text-xs leading-tight" style={{ color: 'var(--fg-base)', opacity: 0.55 }}>Generate asset without review</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalEditData(prev => ({ ...prev, outputAutoApprove: !prev.outputAutoApprove }))}
                  className="w-8 h-4 transition-all relative"
                  style={{ background: localEditData.outputAutoApprove !== false ? 'var(--fg-base)' : 'var(--bg-base)', border: '2px solid var(--stroke)', borderRadius: 0 }}
                >
                  <div className={`absolute top-0 w-3 h-3 transition-all ${localEditData.outputAutoApprove !== false ? 'left-[15px]' : 'left-0'}`} style={{ background: localEditData.outputAutoApprove !== false ? 'var(--bg-base)' : 'var(--fg-base)', borderRadius: 0 }} />
                </button>
              </div>

              <SketchButton onClick={handleSave} disabled={!isFormValid} variant="filled" size="md" seed="save-changes" className="w-full mt-1">Save Changes</SketchButton>
            </div>
          ) : (
            <div className="space-y-0.5 mb-2.5 px-2">
              <TeamOutputBadge system={system} className="mt-1" />

              <p className="font-hand text-sm leading-relaxed mt-2 line-clamp-2" style={{ color: 'var(--fg-base)', opacity: system.teamDescription ? 0.7 : 0.4 }}>{system.teamDescription || 'No description provided.'}</p>
            </div>
          )}

          <div className={`flex items-center justify-between mt-auto pt-2 ${isEditing ? 'border-t-[3px]' : ''}`} style={isEditing ? { borderColor: 'var(--stroke)' } : undefined}>
            <div className="flex items-center gap-1.5 px-2 py-1 font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ background: 'var(--bg-surface)', color: 'var(--fg-base)', opacity: 0.7, border: '2px solid var(--stroke)', borderRadius: 0 }}>
              <Users size={10} strokeWidth={3} />
              {agentCount} {agentCount === 1 ? 'AGENT' : 'AGENTS'}
            </div>
            <div className="flex items-center gap-2">
              {isActive && !isEditing && (
                <div className="px-2 py-0.5 text-white font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ backgroundColor: system.color, border: '2px solid var(--stroke)', borderRadius: 0 }}>Active</div>
              )}
              {isSelected && !isActive && !isEditing && (
                <SketchButton onClick={(e) => handleSwitch(e as any)} variant="filled" size="sm" seed="switch-team">Switch</SketchButton>
              )}
              {isEditing && (
                <button onClick={handleDelete} className="flex items-center gap-1.5 px-2 py-1 text-red-500 font-sketch uppercase tracking-[1.5px] text-[12px] transition-opacity hover:opacity-80">
                  <Trash2 size={12} />
                  Delete Team
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
