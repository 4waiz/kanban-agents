import { Maximize2, Minimize2, Eye } from 'lucide-react';
import React, { useState } from 'react';
import { useCoreStore } from '../integration/store/coreStore';
import { useTeamStore, useActiveTeam } from '../integration/store/teamStore';
import { useUiStore } from '../integration/store/uiStore';
import InspectorPanel from './InspectorPanel';
import UIOverlay from './UIOverlay';
import TeamFlowModal from './TeamFlowModal';
import { AuditModal } from './AuditModal';
import { TeamBadge } from './components/TeamBadge';
import { TeamOutputBadge } from './components/TeamOutputBadge';

interface SimulationViewProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
}

const SimulationView: React.FC<SimulationViewProps> = ({ canvasRef, isFullscreen, setIsFullscreen }) => {
  const { selectedNpcIndex, activeAuditTaskId, setActiveAuditTaskId } = useUiStore();
  const activeSet = useActiveTeam();
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);

  React.useEffect(() => {
    if (activeAuditTaskId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [activeAuditTaskId]);

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0 relative">
      {/* Simulation View Header */}
      <div
        className="h-14 border-b-[3px] flex items-center justify-between px-5 shrink-0"
        style={{ background: 'var(--bg-base)', borderColor: 'var(--stroke)' }}
      >
        <div className="flex-1 flex items-center gap-4">
          <button
            onClick={() => setIsFlowModalOpen(true)}
            className="flex items-center gap-4 px-2.5 py-1.5 transition-all active:scale-95 group cursor-pointer hover:opacity-80"
            title="View Team Flow"
          >
            <TeamBadge system={activeSet} />
            <div
              className="w-8 h-8 flex items-center justify-center transition-colors"
              style={{ border: '3px solid var(--stroke)', color: 'var(--fg-base)', borderRadius: 0 }}
            >
              <Eye size={14} />
            </div>
          </button>

          <TeamOutputBadge system={activeSet} className="hidden md:flex" />
        </div>

        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 transition-opacity hover:opacity-100 opacity-60 cursor-pointer"
            style={{ color: 'var(--fg-base)' }}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Panel"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div ref={canvasRef} className="flex-1 min-h-0 relative overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
        <UIOverlay />
        {isFullscreen && selectedNpcIndex !== null && (
          <div className="absolute top-4 right-4 bottom-4 w-96 z-50 pointer-events-none flex flex-col gap-4">
            <InspectorPanel isFloating />
          </div>
        )}
      </div>

      {isFlowModalOpen && (
        <TeamFlowModal
          isOpen={isFlowModalOpen}
          onClose={() => setIsFlowModalOpen(false)}
          system={activeSet}
        />
      )}

      {activeAuditTaskId && (
        <AuditModal
          isOpen={!!activeAuditTaskId}
          taskId={activeAuditTaskId}
          onClose={() => setActiveAuditTaskId(null)}
        />
      )}
    </div>
  );
};

export default SimulationView;
