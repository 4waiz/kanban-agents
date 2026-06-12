import { Info, KeyRound, Maximize2, Settings } from 'lucide-react';
import React, { useState } from 'react';
import packageJson from '../../package.json';
import { useCoreStore } from '../integration/store/coreStore';
import { useUiStore } from '../integration/store/uiStore';
import BYOKModal from './BYOKModal';
import InfoModal from './InfoModal';
import { SketchButton, ThemeToggle } from './sketch';

const version = packageJson.version;

const Header: React.FC = () => {
  const { llmConfig, isBYOKOpen, setBYOKOpen } = useUiStore();
  const { setViewMode } = useCoreStore();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const hasKey = !!llmConfig.apiKey;

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-5 md:px-6 shrink-0 relative z-40 border-b-[3px]"
      style={{ background: 'var(--bg-base)', borderColor: 'var(--stroke)' }}
    >
      {/* Left: Brand */}
      <div className="flex items-center min-w-0 gap-3">
        <img
          src="images/kanban-agents.svg"
          alt="Kanban Agents"
          className="h-9 w-auto shrink-0"
          style={{ color: 'var(--fg-base)' }}
        />

        <div className="flex items-center gap-3 min-w-0 self-start mt-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsInfoOpen(true)}
              className="transition-opacity hover:opacity-100 opacity-60"
              style={{ color: 'var(--fg-base)' }}
              title="About Kanban Agents"
            >
              <Info size={15} strokeWidth={2.5} />
            </button>
            <span
              className="text-[11px] font-sketch uppercase tracking-[1.5px]"
              style={{ color: 'var(--fg-base)', opacity: 0.6 }}
            >
              v{version}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 min-w-0">
            <span
              className="text-[11px] font-sketch uppercase tracking-[1.5px] truncate"
              style={{ color: 'var(--fg-base)', opacity: 0.6 }}
            >
              @AwaizAhmed
            </span>
          </div>
        </div>
      </div>

      {/* Right: Global Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        <SketchButton
          variant="filled"
          size="sm"
          onClick={() => setViewMode('design')}
          seed="manage-teams"
          title="Manage Teams"
        >
          <Settings size={14} strokeWidth={2.5} />
          <span className="hidden sm:inline">Manage Teams</span>
        </SketchButton>

        <div className="w-[3px] h-5 self-center" style={{ background: 'var(--stroke)' }} />

        <div className="flex items-center gap-3">
          <button
            onClick={handleFullscreen}
            className="transition-opacity hover:opacity-100 opacity-60 p-1"
            style={{ color: 'var(--fg-base)' }}
            title="Fullscreen Browser"
          >
            <Maximize2 size={17} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => setBYOKOpen(true)}
            className="relative transition-opacity hover:opacity-100 opacity-60 p-1"
            style={{ color: 'var(--fg-base)' }}
            title="API Key (BYOK)"
          >
            <KeyRound
              size={17}
              strokeWidth={2.5}
              className={hasKey ? 'text-emerald-500 hover:text-emerald-600 opacity-100' : ''}
            />
            {hasKey && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <ThemeToggle />
        </div>
      </div>

      {isInfoOpen && (
        <InfoModal key="info-modal" onClose={() => setIsInfoOpen(false)} />
      )}

      {isBYOKOpen && (
        <BYOKModal key="byok-modal" onClose={() => setBYOKOpen(false)} />
      )}
    </header>
  );
};

export default Header;
