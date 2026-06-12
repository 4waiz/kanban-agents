import { ExternalLink, X, Sparkles } from 'lucide-react';
import React from 'react';
import { GEMINI_PRICING } from '../core/llm/pricing';
import { DEFAULT_MODELS } from '../core/llm/constants';
import { SketchCard } from './sketch';

interface PricingModalProps {
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ onClose }) => {
  const reasoningModels = Object.entries(GEMINI_PRICING)
    .filter(([_, p]) => p.inputPer1M !== undefined)
    .sort(([a], [b]) => (a === DEFAULT_MODELS.text ? -1 : (b === DEFAULT_MODELS.text ? 1 : 0)));
  const outputModels = Object.entries(GEMINI_PRICING).filter(([_, p]) => p.inputPer1M === undefined);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 pointer-events-auto overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 animate-in fade-in duration-300"
        style={{ background: 'color-mix(in srgb, var(--bg-base) 75%, transparent)' }}
      />
      <SketchCard
        variant="paper"
        seed="pricing-modal"
        className="relative w-full max-w-4xl p-8 md:p-12 max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 transition-opacity opacity-60 hover:opacity-100 active:scale-95 z-10"
          style={{ color: 'var(--fg-base)' }}
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <h2
              className="font-marker uppercase text-3xl leading-[0.95] mb-3"
              style={{ color: 'var(--fg-base)' }}
            >
              Gemini API Pricing
            </h2>
            <div className="flex flex-col items-center gap-3">
              <a
                href="https://ai.google.dev/gemini-api/docs/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-1.5 border-[3px] transition-all duration-200"
                style={{ borderColor: '#3b82f6', color: '#2563eb', borderRadius: 0 }}
              >
                <span className="text-[11px] font-sketch uppercase tracking-[1.5px] text-blue-600">Official Pricing Page</span>
                <ExternalLink size={11} className="text-blue-500" />
              </a>
              <p
                className="font-hand text-sm leading-relaxed"
                style={{ color: 'var(--fg-base)', opacity: 0.7 }}
              >
                Official Google Gemini API pricing (March 2026).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Column 1: Reasoning & Image */}
            <div className="space-y-10">
              {/* Reasoning Models */}
              <div className="space-y-6">
                <h3
                  className="text-[12px] font-sketch uppercase tracking-[1.5px] px-1 border-l-[3px] border-blue-500 pl-3"
                  style={{ color: 'var(--fg-base)', opacity: 0.8 }}
                >Reasoning Models</h3>
                <div className="space-y-3">
                  {reasoningModels.map(([model, pricing]) => {
                    const isDefault = model === DEFAULT_MODELS.text;
                    return (
                      <div
                        key={model}
                        className="relative px-5 py-3.5 transition-all duration-300 flex items-center justify-between"
                        style={{
                          border: isDefault ? '3px solid #3b82f6' : '3px solid var(--stroke)',
                          background: 'var(--bg-base)',
                          borderRadius: 0,
                          boxShadow: '4px 4px 0 0 ' + (isDefault ? '#3b82f6' : 'var(--stroke)'),
                        }}
                      >
                        {isDefault && (
                          <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-2 py-0.5 bg-blue-600 text-white text-[8px] font-sketch uppercase tracking-[1.5px]" style={{ borderRadius: 0 }}>
                            <Sparkles size={8} className="fill-white" />
                            Default
                          </div>
                        )}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <p className="text-xs font-mono font-bold lowercase" style={{ color: 'var(--fg-base)' }}>
                            {model}
                          </p>
                          {isDefault && <Sparkles size={10} className="text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-5 text-xs font-mono font-bold">
                          <div className="flex items-center gap-2">
                            <span className="font-sketch uppercase text-[10px] tracking-[1px]" style={{ color: 'var(--fg-base)', opacity: 0.5 }}>In</span>
                            <span style={{ color: 'var(--fg-base)' }}>${pricing.inputPer1M?.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-sketch uppercase text-[10px] tracking-[1px]" style={{ color: 'var(--fg-base)', opacity: 0.5 }}>Out</span>
                            <span style={{ color: 'var(--fg-base)' }}>${pricing.outputPer1M?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Image Models */}
              {['image'].map(type => {
                const typeModels = outputModels.filter(([_, p]) => p.perImage !== undefined)
                  .sort(([a], [b]) => {
                    const defaultModel = DEFAULT_MODELS.image;
                    return (a === defaultModel ? -1 : (b === defaultModel ? 1 : 0));
                  });

                if (typeModels.length === 0) return null;

                return (
                  <div key={type} className="space-y-6">
                    <h4
                      className="text-[12px] font-sketch uppercase tracking-[1.5px] px-1 border-l-[3px] border-amber-400 pl-3"
                      style={{ color: 'var(--fg-base)', opacity: 0.8 }}
                    >
                      {type} models
                    </h4>
                    <div className="space-y-3">
                      {typeModels.map(([model, pricing]) => {
                        const isDefault = model === DEFAULT_MODELS.image;
                        return (
                          <div
                            key={model}
                            className="relative px-5 py-3.5 transition-all duration-300 flex items-center justify-between"
                            style={{
                              border: isDefault ? '3px solid #f59e0b' : '3px solid var(--stroke)',
                              background: 'var(--bg-base)',
                              borderRadius: 0,
                              boxShadow: '4px 4px 0 0 ' + (isDefault ? '#f59e0b' : 'var(--stroke)'),
                            }}
                          >
                            {isDefault && (
                              <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-2 py-0.5 bg-amber-500 text-white text-[8px] font-sketch uppercase tracking-[1.5px]" style={{ borderRadius: 0 }}>
                                <Sparkles size={8} className="fill-white" />
                                Default
                              </div>
                            )}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <p className="text-xs font-mono font-bold lowercase" style={{ color: 'var(--fg-base)' }}>
                                {model}
                              </p>
                              {isDefault && <Sparkles size={10} className="text-amber-500" />}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-sketch uppercase text-[10px] tracking-[1px]" style={{ color: 'var(--fg-base)', opacity: 0.5 }}>Img</span>
                              <span className="text-sm font-mono font-bold" style={{ color: 'var(--fg-base)' }}>
                                ${pricing.perImage?.toFixed(3)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Column 2: Video & Music */}
            <div className="space-y-10">
              {['video', 'music'].map(type => {
                const typeModels = outputModels.filter(([_, p]) => {
                  if (type === 'music') return p.perSong !== undefined;
                  return p.perSecond !== undefined;
                }).sort(([a], [b]) => {
                  const defaultModel = DEFAULT_MODELS[type as keyof typeof DEFAULT_MODELS];
                  return (a === defaultModel ? -1 : (b === defaultModel ? 1 : 0));
                });

                if (typeModels.length === 0) return null;

                const colors = type === 'video'
                  ? { border: 'border-rose-500', accent: '#f43f5e', badge: 'bg-rose-600', icon: 'text-rose-500' }
                  : { border: 'border-lime-400', accent: '#84cc16', badge: 'bg-lime-500', icon: 'text-lime-600' };

                return (
                  <div key={type} className="space-y-6">
                    <h4 className={`text-[12px] font-sketch uppercase tracking-[1.5px] px-1 border-l-[3px] ${colors.border} pl-3`} style={{ color: 'var(--fg-base)', opacity: 0.8 }}>
                      {type} models
                    </h4>
                    <div className="space-y-3">
                      {typeModels.map(([model, pricing]) => {
                        const isDefault = model === (DEFAULT_MODELS as any)[type];
                        const label = pricing.perSong !== undefined ? (model === 'lyria-3-clip-preview' ? '30 Sec Song' : 'Song') : 'Sec';

                        return (
                          <div
                            key={model}
                            className="relative px-5 py-3.5 transition-all duration-300 flex items-center justify-between"
                            style={{
                              border: isDefault ? `3px solid ${colors.accent}` : '3px solid var(--stroke)',
                              background: 'var(--bg-base)',
                              borderRadius: 0,
                              boxShadow: '4px 4px 0 0 ' + (isDefault ? colors.accent : 'var(--stroke)'),
                            }}
                          >
                            {isDefault && (
                              <div className={`absolute -top-3 left-4 flex items-center gap-1.5 px-2 py-0.5 ${colors.badge} text-white text-[8px] font-sketch uppercase tracking-[1.5px]`} style={{ borderRadius: 0 }}>
                                <Sparkles size={8} className="fill-white" />
                                Default
                              </div>
                            )}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <p className="text-xs font-mono font-bold lowercase" style={{ color: 'var(--fg-base)' }}>
                                {model}
                              </p>
                              {isDefault && <Sparkles size={10} className={colors.icon} />}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-sketch uppercase text-[10px] tracking-[1px]" style={{ color: 'var(--fg-base)', opacity: 0.5 }}>
                                {label}
                              </span>
                              <span className="text-sm font-mono font-bold" style={{ color: 'var(--fg-base)' }}>
                                ${(pricing.perSong || pricing.perSecond || 0).toFixed(3)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SketchCard>
    </div>
  );
};

export default PricingModal;
