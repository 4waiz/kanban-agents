import { Eye, EyeOff, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useUiStore } from '../integration/store/uiStore';
import { DEFAULT_MODELS } from '../core/llm/constants';
import { SketchButton, SketchCard, SketchLabel } from './sketch';

interface BYOKModalProps {
  onClose: () => void;
}

const STORAGE_KEY = 'byok-config';

const BYOKModal: React.FC<BYOKModalProps> = ({ onClose }) => {
  const { llmConfig, setLlmConfig, byokError } = useUiStore();

  const [apiKey, setApiKey] = useState<string>(llmConfig.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isErrorExpanded, setIsErrorExpanded] = useState(false);

  const handleSave = () => {
    const config = {
      apiKey: apiKey.trim(),
      model: llmConfig.model || DEFAULT_MODELS.text,
    };
    setLlmConfig(config);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save BYOK config', e);
    }
    onClose();
  };

  const handleClear = () => {
    const emptyConfig = {
      apiKey: '',
      model: llmConfig.model || DEFAULT_MODELS.text,
    };
    setApiKey('');
    setLlmConfig(emptyConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyConfig));
    } catch (e) {
      console.error('Failed to clear BYOK config', e);
    }
  };

  const isSaved = !!llmConfig.apiKey;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 pointer-events-auto overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 animate-in fade-in duration-300"
        style={{ background: 'color-mix(in srgb, var(--bg-base) 75%, transparent)' }}
      />
      <SketchCard
        variant="paper"
        seed="byok-modal"
        className="relative w-full max-w-md p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 transition-opacity opacity-60 hover:opacity-100 active:scale-95"
          style={{ color: 'var(--fg-base)' }}
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2
              className="font-marker uppercase text-3xl leading-[0.95] mb-3"
              style={{ color: 'var(--fg-base)' }}
            >
              Gemini API Key
            </h2>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener"
              className="group inline-flex items-center gap-2 px-3 py-1.5 border-[3px] transition-all duration-200 mb-3"
              style={{ borderColor: '#10b981', color: '#059669', borderRadius: 0 }}
            >
              <span className="text-[10px] font-sketch uppercase tracking-[1.5px] text-emerald-600">Get Gemini API Key</span>
              <svg className="text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
            <p
              className="font-hand text-base leading-relaxed max-w-[240px]"
              style={{ color: 'var(--fg-base)', opacity: 0.7 }}
            >
              Your key is stored locally and never leaves your browser.
            </p>
          </div>

          {/* Error Message */}
          {byokError && (() => {
            const isLongError = byokError.length > 120;
            const displayError = isErrorExpanded || !isLongError ? byokError : byokError.slice(0, 110) + '...';

            return (
              <div
                className="mb-6 p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2"
                style={{ border: '3px solid #ef4444', borderRadius: 0 }}
              >
                <div className="mt-0.5 text-red-500 shrink-0">
                  <X size={14} strokeWidth={3} className="rotate-45" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-sketch uppercase tracking-[1.5px] text-red-500 mb-0.5">API Error</p>
                  <div className={`${isErrorExpanded ? 'max-h-48' : 'max-h-24'} overflow-y-auto pr-1`}>
                    <p className="text-[11px] font-hand text-red-600 leading-tight break-words whitespace-pre-wrap">
                      {displayError}
                    </p>
                    {isLongError && (
                      <button
                        onClick={() => setIsErrorExpanded(!isErrorExpanded)}
                        className="mt-1 text-[9px] font-sketch uppercase tracking-[1.5px] text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        {isErrorExpanded ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}


          {/* API Key input */}
          <div className="mb-10">
            <div className="mb-4 ml-1">
              <SketchLabel prefix seed="api-key-label">API Key</SketchLabel>
            </div>
            <div className="relative group">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here"
                className="w-full px-6 py-4 pr-14 text-sm font-mono focus:outline-none transition-all"
                style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-5 top-1/2 -translate-y-1/2 transition-opacity opacity-50 hover:opacity-100 cursor-pointer"
                style={{ color: 'var(--fg-base)' }}
              >
                {showKey ? <EyeOff size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleClear}
              disabled={!isSaved && !apiKey}
              className="flex items-center gap-2 text-[11px] font-sketch uppercase tracking-[1.5px] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed group hover:text-red-400"
              style={{ color: 'var(--fg-base)', opacity: 0.7 }}
            >
              <Trash2 size={16} strokeWidth={2.5} />
              Clear
            </button>

            <SketchButton
              variant="filled"
              size="md"
              onClick={handleSave}
              disabled={!apiKey.trim()}
              seed="byok-save"
            >
              Save
            </SketchButton>
          </div>
        </div>
      </SketchCard>
    </div>
  );
};

export default BYOKModal;
