/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCoreStore } from './integration/store/coreStore';
import { ActionLogPanel } from './interface/ActionLogPanel';
import { FinalOutputModal } from './interface/FinalOutputModal';
import Header from './interface/Header';
import InspectorPanel from './interface/InspectorPanel';
import { KanbanPanel } from './interface/KanbanPanel';
import { OutputReviewModal } from './interface/OutputReviewModal';
import SimulationView from './interface/SimulationView';
import { VisualConfigurator } from './interface/VisualConfigurator/VisualConfigurator';
import { SceneContext } from './simulation/SceneContext';
import { SceneManager } from './simulation/SceneManager';


const App: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<SceneManager | null>(null);
  const [sceneManager, setSceneManager] = useState<SceneManager | null>(null);
  const { isLogOpen, isKanbanOpen, setIsResizing, viewMode, setViewMode } = useCoreStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [kanbanHeight, setKanbanHeight] = useState(220);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, [setIsResizing]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, [setIsResizing]);

  const resize = useCallback((e: MouseEvent) => {
    if (useCoreStore.getState().isResizing) {
      const windowHeight = window.innerHeight;
      const newHeight = windowHeight - e.clientY;
      const minHeight = windowHeight * 0.2;
      const maxHeight = windowHeight * 0.5;
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setKanbanHeight(newHeight);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    if (canvasRef.current && !managerRef.current) {
      const manager = new SceneManager(canvasRef.current);
      managerRef.current = manager;
      setSceneManager(manager);
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.dispose();
        managerRef.current = null;
        setSceneManager(null);
      }
    };
  }, []);

  return (
    <SceneContext.Provider value={sceneManager}>
      <div
        className="w-screen h-screen overflow-hidden flex flex-col font-hand"
        style={{ background: 'var(--bg-base)', color: 'var(--fg-base)' }}
      >
        {/* Top: Header */}
        {!isFullscreen && <Header />}

        <div className="flex-1 flex flex-row min-h-0 min-w-0 overflow-hidden">
          {/* Left: Log panel */}
          {isLogOpen && !isFullscreen && viewMode !== 'design' && <ActionLogPanel />}

          {/* Center: canvas + kanban drawer stacked */}
          <div
            className="relative flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden"
            style={{ background: 'var(--bg-surface)' }}
          >

            {/* Simulation Context - Persistently Mounted */}
            <div
              className="flex-1 flex flex-col min-w-0 min-h-0"
              style={{ visibility: viewMode === 'design' ? 'hidden' : 'visible' }}
            >
              <SimulationView canvasRef={canvasRef} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} />

              {/* Resize Bar */}
              {isKanbanOpen && !isFullscreen && (
                <div
                  className="h-2 bg-transparent transition-colors cursor-row-resize z-30 flex items-center justify-center group shrink-0 border-t-[3px]"
                  style={{ borderColor: 'var(--stroke)' }}
                  onMouseDown={startResizing}
                >
                  <div className="w-12 h-1.5" style={{ background: 'var(--stroke)' }} />
                </div>
              )}

              {isKanbanOpen && !isFullscreen && <KanbanPanel height={kanbanHeight} />}
            </div>
          </div>

          {/* Right: Inspector sidebar */}
          {!isFullscreen && viewMode !== 'design' && <InspectorPanel />}
        </div>

        {/* Design Mode Overlay (Modal) */}
        {viewMode === 'design' && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6"
            style={{ background: 'color-mix(in srgb, var(--bg-base) 70%, transparent)' }}
          >
            <div
              className="w-full h-full overflow-hidden flex flex-col"
              style={{
                background: 'var(--bg-base)',
                border: '3px solid var(--stroke)',
                boxShadow: '10px 10px 0 0 var(--stroke)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <VisualConfigurator />
            </div>
          </div>
        )}

        {/* Final output — fixed viewport overlay */}
        <FinalOutputModal />
        <OutputReviewModal />
      </div>
    </SceneContext.Provider>
  );
};

export default App;

