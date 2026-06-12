import { Trash2, X } from 'lucide-react';
import React from 'react';
import { SketchButton, SketchCard } from './sketch';

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle?: string;
}

const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({ isOpen, onClose, onConfirm, taskTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 animate-in fade-in duration-300"
        style={{ background: 'color-mix(in srgb, var(--bg-base) 75%, transparent)' }}
      />
      <SketchCard
        variant="paper"
        seed="delete-task-modal"
        className="relative w-full max-w-sm p-5 animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-10 h-10 flex items-center justify-center text-red-500 shrink-0"
            style={{ border: '3px solid #ef4444', borderRadius: 0 }}
          >
            <Trash2 size={20} strokeWidth={2.5} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 transition-opacity opacity-60 hover:opacity-100 active:scale-95"
            style={{ color: 'var(--fg-base)' }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <h3
          className="font-marker uppercase text-xl mb-1.5 leading-[0.95]"
          style={{ color: 'var(--fg-base)' }}
        >
          Delete Task?
        </h3>
        <p
          className="font-hand text-base leading-relaxed mb-6"
          style={{ color: 'var(--fg-base)', opacity: 0.8 }}
        >
          Are you sure you want to delete {taskTitle ? <span className="font-semibold" style={{ opacity: 1 }}>"{taskTitle}"</span> : "this task"}? This action cannot be undone.
        </p>

        <div className="flex items-center gap-2">
          <SketchButton
            variant="default"
            size="md"
            seed="delete-cancel"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </SketchButton>
          <SketchButton
            variant="filled"
            size="md"
            seed="delete-confirm"
            className="flex-1"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete Task
          </SketchButton>
        </div>
      </SketchCard>
    </div>
  );
};

export default DeleteTaskModal;
