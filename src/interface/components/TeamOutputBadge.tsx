import { FileText, Image as ImageIcon, Music, Video } from 'lucide-react';
import React from 'react';
import { AgenticSystem } from '../../data/agents';
import { InfoTooltip } from './InfoTooltip';
import { USER_COLOR, USER_COLOR_SOFT } from '../../theme/brand';

interface TeamOutputBadgeProps {
  system: AgenticSystem;
  className?: string;
}

export const TeamOutputBadge: React.FC<TeamOutputBadgeProps> = ({ system, className = '' }) => {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-1.5 cursor-pointer ${className}`}
      style={{
        background: 'var(--bg-surface)',
        border: '3px solid var(--stroke)',
        boxShadow: '4px 4px 0 0 var(--stroke)',
        borderRadius: 0,
      }}
    >
      {/* Left Column: Stacked type and status */}
      <div className="flex flex-col justify-center gap-1 pr-3">
        {/* Output Type Row */}
        <div className="flex items-center gap-1.5" style={{ color: 'var(--fg-base)' }}>
          {system.outputType === 'text' && <FileText size={11} strokeWidth={2.5} />}
          {system.outputType === 'image' && <ImageIcon size={11} strokeWidth={2.5} />}
          {system.outputType === 'music' && <Music size={11} strokeWidth={2.5} />}
          {system.outputType === 'video' && <Video size={11} strokeWidth={2.5} />}
          <span className="font-sketch uppercase tracking-[1.5px] text-[8px] leading-none" style={{ color: 'var(--fg-base)' }}>
            {system.outputType || 'TEXT'}
          </span>
        </div>
        
        {/* Auto-Approve Status Row */}
        {system.outputAutoApprove !== undefined && (
          <InfoTooltip
            text={system.outputAutoApprove
              ? 'Output will be generated and delivered automatically'
              : 'Output requires your manual review and approval before generation'}
          >
            <div className="flex items-center gap-1.5">
              <div 
                className="w-1 h-1 rounded-full" 
                style={{ 
                  backgroundColor: system.outputAutoApprove ? '#10b981' : USER_COLOR,
                  boxShadow: system.outputAutoApprove ? undefined : `0 0 8px ${USER_COLOR_SOFT}`
                }} 
              />
              <span className="font-sketch uppercase tracking-[1px] text-[7px] leading-none whitespace-nowrap" style={{ color: 'var(--fg-base)', opacity: 0.55 }}>
                {system.outputAutoApprove ? 'AUTO APPROVE' : 'MANUAL REVIEW'}
              </span>
            </div>
          </InfoTooltip>
        )}
      </div>

      <div className="w-[3px] h-6 self-center" style={{ background: 'var(--stroke)' }} />

      {/* Right Column: Model Name */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0 pl-1">
        <span className="font-sketch uppercase tracking-[1.5px] text-[7px] leading-none" style={{ color: 'var(--fg-base)', opacity: 0.55 }}>GENERATION MODEL</span>
        <span className="text-[10px] font-bold font-mono lowercase leading-tight" style={{ color: 'var(--fg-base)' }}>
          {system.outputModel}
        </span>
      </div>
    </div>
  );
};
