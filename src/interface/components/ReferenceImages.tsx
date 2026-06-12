import React, { useRef } from 'react';
import { Image as ImageIcon, Plus, X, UploadCloud } from 'lucide-react';
import { useCoreStore } from '../../integration/store/coreStore';
import { useActiveTeam } from '../../integration/store/teamStore';
import { USER_COLOR } from '../../theme/brand';

export const ReferenceImages: React.FC = () => {
  const { referenceImages, addReferenceImage, removeReferenceImage } = useCoreStore();
  const activeTeam = useActiveTeam();
  const maxImages = (activeTeam.outputType === 'video' && activeTeam.outputModel === 'veo-3.1-lite-generate-preview') ? 1 : 3;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const processFiles = (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        if (referenceImages.length >= maxImages) break;

        const reader = new FileReader();
        reader.onloadend = () => {
          addReferenceImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`space-y-3 p-3 transition-all duration-300 ${isDragging ? 'scale-[1.02]' : ''}`}
      style={{
        border: isDragging ? '3px dashed var(--stroke)' : '3px solid transparent',
        background: isDragging ? 'var(--bg-surface)' : 'transparent',
        borderRadius: 0,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5" style={{ color: 'var(--fg-base)', opacity: isDragging ? 1 : 0.6 }}>
          <UploadCloud size={12} className={isDragging ? 'animate-bounce' : ''} />
          <span className="font-sketch uppercase tracking-[1.5px] text-[10px] transition-colors">Reference Images</span>
        </div>
        <span className="font-sketch uppercase tracking-[1px] text-[9px]" style={{ color: 'var(--fg-base)', opacity: 0.5 }}>
          {referenceImages.length}/{maxImages} Slots
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {/* Existing Images */}
        {referenceImages.map((img, idx) => (
          <div
            key={idx}
            className="group relative aspect-square overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ border: '3px solid var(--stroke)', borderRadius: 0 }}
          >
            <img
              src={img}
              alt={`Reference ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeReferenceImage(idx);
                }}
                className="p-1.5 bg-white/20 hover:bg-white/40 text-white transition-all active:scale-90"
                style={{ borderRadius: 0 }}
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}

        {/* Add Button */}
        {referenceImages.length < maxImages && (
          <button
            onClick={triggerUpload}
            className="aspect-square transition-all flex flex-col items-center justify-center gap-1 group active:scale-95"
            style={{
              border: '3px dashed var(--stroke)',
              background: isDragging ? 'var(--bg-surface)' : 'transparent',
              borderRadius: 0,
            }}
          >
            <div
              className="w-6 h-6 flex items-center justify-center transition-colors"
              style={{
                border: '3px solid var(--stroke)',
                background: isDragging ? 'var(--fg-base)' : 'var(--bg-surface)',
                borderRadius: 0,
              }}
            >
              <Plus size={14} style={{ color: isDragging ? 'var(--bg-base)' : 'var(--fg-base)' }} />
            </div>
            <span className="font-sketch uppercase tracking-[1px] text-[8px] transition-colors" style={{ color: 'var(--fg-base)', opacity: isDragging ? 1 : 0.55 }}>Add</span>
          </button>
        )}

        {/* Empty Slots */}
        {Array.from({ length: Math.max(0, maxImages - referenceImages.length - (referenceImages.length < maxImages ? 1 : 0)) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-square flex items-center justify-center opacity-30"
            style={{ border: '3px solid var(--stroke)', borderRadius: 0 }}
          >
            <ImageIcon size={14} style={{ color: 'var(--fg-base)' }} />
          </div>
        ))}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      <p className="font-hand text-[12px] leading-tight transition-colors" style={{ color: 'var(--fg-base)', opacity: isDragging ? 1 : 0.7 }}>
        {isDragging ? 'Drop images to add as reference' : 'Add visual references (or drop them here) to guide the team.'}
      </p>
    </div>
  );
};
