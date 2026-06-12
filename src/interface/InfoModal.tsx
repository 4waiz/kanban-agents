import React from 'react';
import { X } from 'lucide-react';
import { SketchButton, SketchCard, SketchLabel, HighlighterText } from './sketch';

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 pointer-events-auto overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 animate-in fade-in duration-300"
        style={{ background: 'color-mix(in srgb, var(--bg-base) 75%, transparent)' }}
      />

      <SketchCard
        variant="paper"
        seed="info-modal"
        className="relative w-full max-w-xl p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 transition-opacity opacity-60 hover:opacity-100 active:scale-95"
          style={{ color: 'var(--fg-base)' }}
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-7">
            <img
              src="images/kanban-agents.svg"
              alt="Kanban Agents Logo"
              width={256}
              className="h-auto"
              style={{ color: 'var(--fg-base)' }}
            />
          </div>

          <h2
            className="font-marker uppercase text-3xl md:text-4xl leading-[0.95] mb-6 text-center"
            style={{ color: 'var(--fg-base)' }}
          >
            A no-code 3D playground to explore{' '}
            <HighlighterText color="yellow">Agentic AI</HighlighterText> systems
          </h2>

          <div
            className="space-y-5 font-hand text-lg leading-relaxed text-center sm:text-left"
            style={{ color: 'var(--fg-base)', opacity: 0.85 }}
          >
            <p>
              Kanban Agents is an experimental workspace where you stop prompting and
              start delegating to a team of autonomous AI agents in a living 3D office.
            </p>
            <p>
              Designed for enthusiasts, educators, and creative developers to understand
              multi-agent collaboration, making complex AI processes transparent,
              collaborative, and human-centered.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6">
            <SketchButton variant="default" size="md" onClick={onClose} seed="got-it">
              Got it
            </SketchButton>

            <div
              className="pt-4 w-full flex flex-col items-center border-t-[3px]"
              style={{ borderColor: 'var(--stroke)' }}
            >
              <SketchLabel prefix seed="credit">
                Developed with &hearts; by Awaiz Ahmed
              </SketchLabel>
            </div>
          </div>
        </div>
      </SketchCard>
    </div>
  );
};

export default InfoModal;
