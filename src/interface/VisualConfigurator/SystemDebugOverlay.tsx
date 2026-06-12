
import React, { useState } from 'react';
import { X, Code, Copy, Check } from 'lucide-react';

interface SystemDebugOverlayProps {
  system: any;
  onClose?: () => void;
}

export const SystemDebugOverlay: React.FC<SystemDebugOverlayProps> = ({ system, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(system, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 text-red-500 font-sketch uppercase tracking-[1.5px] text-[12px] hover:opacity-80 transition-opacity flex items-center gap-1.5"
        style={{ border: '3px solid #ef4444', boxShadow: '3px 3px 0 0 #ef4444', borderRadius: 0 }}
      >
        <Code size={10} />
        Debug System
      </button>

      {isOpen && (
        <div
          className="fixed inset-4 z-[1000] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ background: '#1A1521', color: '#7CE630', border: '3px solid var(--stroke)', boxShadow: '8px 8px 0 0 var(--stroke)', borderRadius: 0 }}
        >
          <div
            className="p-4 flex items-center justify-between border-b-[3px]"
            style={{ borderColor: '#7CE63040' }}
          >
            <div className="flex items-center gap-3">
              <Code size={14} style={{ color: '#7CE630' }} />
              <h3 className="font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ color: '#7CE630', opacity: 0.7 }}>
                System Debug Data — <span style={{ color: '#7CE630', opacity: 1 }}>{system.teamName || 'Untitled'}</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 font-sketch uppercase tracking-[1.5px] text-[12px] hover:opacity-80 transition-opacity active:scale-95"
                style={{ color: '#7CE630', border: '3px solid #7CE63060', borderRadius: 0 }}
              >
                {copied ? <Check size={12} style={{ color: '#7CE630' }} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 px-2 hover:opacity-80 transition-opacity"
                style={{ color: '#7CE630' }}
                title="Close overlay"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <pre className="flex-1 overflow-auto p-6 text-[11px] font-mono whitespace-pre-wrap selection:bg-green-500/20" style={{ background: '#1A1521', color: '#7CE630' }}>
            {JSON.stringify(system, null, 2)}
          </pre>

          <div className="p-3 flex justify-end border-t-[3px]" style={{ borderColor: '#7CE63040' }}>
            <p className="font-sketch uppercase tracking-[1.5px] text-[12px] italic" style={{ color: '#7CE630', opacity: 0.6 }}>
              Provisional Debug Tool • Close with ESC or button
            </p>
          </div>
        </div>
      )}
    </>
  );
};
