import { AlertTriangle, RefreshCcw, X } from 'lucide-react';
import React from 'react';
import { SketchButton, SketchCard } from './sketch';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 animate-in fade-in duration-300"
        style={{ background: 'color-mix(in srgb, var(--bg-base) 75%, transparent)' }}
      />
      <SketchCard
        variant="paper"
        seed="reset-modal"
        className="relative w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 flex items-center justify-center text-red-500 shrink-0"
              style={{ border: '3px solid #ef4444', borderRadius: 0 }}
            >
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>
            <h3
              className="font-marker uppercase text-2xl leading-[0.95]"
              style={{ color: 'var(--fg-base)' }}
            >
              Start New Project?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-opacity opacity-60 hover:opacity-100 active:scale-95"
            style={{ color: 'var(--fg-base)' }}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <p
          className="font-hand text-base leading-relaxed mb-8"
          style={{ color: 'var(--fg-base)', opacity: 0.8 }}
        >
          This will clear the current user brief, all tasks, logs, and conversation histories.
          The team will return to their starting positions and the project will revert to idle.
        </p>

        <div className="flex flex-col gap-3 items-stretch">
          <SketchButton
            variant="filled"
            size="md"
            seed="reset-confirm"
            className="w-full"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <RefreshCcw size={14} strokeWidth={2.5} />
            Yes, Reset Everything
          </SketchButton>
          <SketchButton
            variant="default"
            size="md"
            seed="reset-cancel"
            className="w-full"
            onClick={onClose}
          >
            Cancel
          </SketchButton>
        </div>
      </SketchCard>
    </div>
  );
};

export default ResetModal;
