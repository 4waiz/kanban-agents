import { Pipette, X } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { getBrightness, getDarkenedColor, MAX_BRIGHTNESS } from './colorUtils';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange, 
  disabled = false 
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [suggestedColor, setSuggestedColor] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [prevColor, setPrevColor] = useState<string>(color);

  useEffect(() => {
    // If external color changes and we are not in a suggestion state, update prevColor
    if (!suggestedColor) {
      setPrevColor(color);
    }
  }, [color, suggestedColor]);

  const handleLiveColorChange = (newColor: string) => {
    onChange(newColor);
    setSuggestedColor(null);
    setErrorMsg(null);
  };

  const handleCommitColorChange = (newColor: string) => {
    const brightness = getBrightness(newColor);
    if (brightness > MAX_BRIGHTNESS) {
      const suggested = getDarkenedColor(newColor);
      setSuggestedColor(suggested);
      setErrorMsg('Selected color is too light for white text.');
    } else {
      setSuggestedColor(null);
      setErrorMsg(null);
      setPrevColor(newColor);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative group/picker">
        <div
          onClick={() => !disabled && colorInputRef.current?.click()}
          className={`w-8 h-8 flex items-center justify-center transition-all ${
            !disabled ? 'cursor-pointer hover:scale-110 active:scale-90' : 'opacity-50'
          }`}
          style={{ backgroundColor: color || '#A855F7', border: '3px solid var(--stroke)', boxShadow: '3px 3px 0 0 var(--stroke)', borderRadius: 0 }}
        >
          {!disabled && (
            <Pipette size={14} className="text-white opacity-90" strokeWidth={2.5} />
          )}
        </div>
        <input
          ref={colorInputRef}
          type="color"
          value={color || '#A855F7'}
          onInput={(e) => handleLiveColorChange((e.target as HTMLInputElement).value)}
          onBlur={(e) => handleCommitColorChange((e.target as HTMLInputElement).value)}
          onChange={(e) => handleCommitColorChange((e.target as HTMLInputElement).value)}
          className="absolute inset-0 opacity-0 pointer-events-none"
          disabled={disabled}
        />
      </div>

      {(errorMsg || suggestedColor) && (
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          {errorMsg && (
            <p className="font-sketch uppercase tracking-[1.5px] text-[12px] leading-tight text-red-500">
              {errorMsg}
            </p>
          )}

          {suggestedColor && (
            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
              <button
                onClick={() => {
                  onChange(prevColor);
                  setSuggestedColor(null);
                  setErrorMsg(null);
                }}
                className="flex-1 py-1 px-2 font-sketch uppercase tracking-[1.5px] text-[12px] hover:opacity-80 transition-opacity"
                style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
                type="button"
              >
                No
              </button>
              <button
                onClick={() => {
                  onChange(suggestedColor);
                  setPrevColor(suggestedColor);
                  setSuggestedColor(null);
                  setErrorMsg(null);
                }}
                className="flex-[2] py-1 px-2 text-white font-sketch uppercase tracking-[1.5px] text-[12px] hover:opacity-90 transition-all"
                style={{ backgroundColor: suggestedColor, border: '3px solid var(--stroke)', boxShadow: '3px 3px 0 0 var(--stroke)', borderRadius: 0 }}
                type="button"
              >
                Use suggested
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
