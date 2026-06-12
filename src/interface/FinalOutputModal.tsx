import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useCoreStore } from '../integration/store/coreStore'
import { useActiveTeam } from '../integration/store/teamStore'
import { Loader2, Download } from 'lucide-react'
import { TeamOutputBadge } from './components/TeamOutputBadge'
import { SketchButton, SketchCard, SketchLabel } from './sketch'

export function FinalOutputModal() {
  const {
    isFinalOutputOpen,
    setFinalOutputOpen,
    finalOutput,
    finalAssetType,
    finalAssetContent,
    isGeneratingAsset,
    referenceImages
  } = useCoreStore()
  const activeTeam = useActiveTeam()
  const [copied, setCopied] = useState(false)

  if (!isFinalOutputOpen) return null

  const handleCopy = async () => {
    // We always copy finalOutput which contains the text result or the prompt/metadata
    await navigator.clipboard.writeText(finalOutput || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!finalAssetContent) return;

    const link = document.createElement('a');
    if (finalAssetType === 'image') {
      link.href = `data:image/png;base64,${finalAssetContent}`;
      link.download = `agentic-image-${Date.now()}.png`;
    } else if (finalAssetType === 'audio') {
      link.href = `data:audio/mp3;base64,${finalAssetContent}`;
      link.download = `agentic-audio-${Date.now()}.mp3`;
    } else if (finalAssetType === 'video') {
      link.href = finalAssetContent; // It's usually a URL
      link.download = `agentic-video-${Date.now()}.mp4`;
      link.target = "_blank";
    }
    link.click();
  }

  const renderContent = () => {
    if (isGeneratingAsset) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin" size={40} strokeWidth={2} style={{ color: 'var(--fg-base)', opacity: 0.5 }} />
          <p className="font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Generating {finalAssetType} asset...</p>
        </div>
      );
    }

    if (finalAssetType === 'text') {
      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {finalOutput || ''}
        </ReactMarkdown>
      );
    }

    if (finalAssetType === 'image' && finalAssetContent) {
      return (
        <div className="space-y-4">
          <div className="relative group">
            <img
              src={`data:image/png;base64,${finalAssetContent}`}
              alt="Final Generated Asset"
              className="w-full"
              style={{ border: '3px solid var(--stroke)', borderRadius: 0 }}
            />
            <button
              onClick={handleDownload}
              className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
              style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
              title="Download Image"
            >
              <Download size={18} strokeWidth={2.5} />
            </button>
          </div>
          <div className="p-4" style={{ border: '3px solid var(--stroke)', borderRadius: 0 }}>
            <p className="font-sketch uppercase tracking-[1.5px] text-[12px] mb-1" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Prompt Used:</p>
            <p className="font-hand text-base italic leading-relaxed" style={{ color: 'var(--fg-base)', opacity: 0.8 }}>{finalOutput || "No prompt metadata available."}</p>
          </div>
        </div>
      );
    }

    if (finalAssetType === 'audio' && finalAssetContent) {
      return (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3" style={{ background: 'var(--bg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}>
            <audio controls className="flex-1 h-9">
              <source src={`data:audio/mp3;base64,${finalAssetContent}`} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
            <SketchButton variant="filled" size="sm" onClick={handleDownload} seed="download-audio" className="shrink-0">
              <Download size={14} strokeWidth={2.5} />
              Download Audio
            </SketchButton>
          </div>
          <div className="p-4" style={{ border: '3px solid var(--stroke)', borderRadius: 0 }}>
            <p className="font-sketch uppercase tracking-[1.5px] text-[12px] mb-1" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Lyrics / Prompt:</p>
            <p className="font-hand text-base italic leading-relaxed" style={{ color: 'var(--fg-base)', opacity: 0.8 }}>{finalOutput || "No prompt metadata available."}</p>
          </div>
        </div>
      );
    }

    if (finalAssetType === 'video' && finalAssetContent) {
      return (
        <div className="space-y-4">
          <div className="relative group">
            <video controls className="w-full" style={{ border: '3px solid var(--stroke)', borderRadius: 0 }}>
              <source src={finalAssetContent} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button
              onClick={handleDownload}
              className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 z-10"
              style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
              title="Download Video"
            >
              <Download size={18} strokeWidth={2.5} />
            </button>
          </div>
          <div className="p-4" style={{ border: '3px solid var(--stroke)', borderRadius: 0 }}>
            <p className="font-sketch uppercase tracking-[1.5px] text-[12px] mb-1" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>Script / Prompt:</p>
            <p className="font-hand text-base italic leading-relaxed" style={{ color: 'var(--fg-base)', opacity: 0.8 }}>{finalOutput || "No prompt metadata available."}</p>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--bg-base) 75%, transparent)' }}
      onClick={() => setFinalOutputOpen(false)}
    >
      <div
        className="w-180 max-w-full flex"
        onClick={(e) => e.stopPropagation()}
      >
      <SketchCard
        variant="paper"
        seed="final-output-modal"
        className="w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{ overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b-[3px]" style={{ borderColor: 'var(--stroke)' }}>
          <div className="flex items-center gap-6">
            <div>
              <h2 className="font-marker uppercase text-xl leading-[0.95] flex items-center gap-2" style={{ color: 'var(--fg-base)' }}>
                {finalAssetType !== 'text' && (
                  <span className="px-2 py-0.5 text-[8px] font-sketch tracking-[1px]" style={{ background: 'var(--fg-base)', color: 'var(--bg-base)', borderRadius: 0 }}>
                    {(activeTeam?.outputType || finalAssetType).toUpperCase()}
                  </span>
                )}
                Final {finalAssetType} Deliverable
              </h2>
              <p className="font-hand text-sm mt-1" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>
                Refined and generated by your autonomous team
              </p>
            </div>
            <TeamOutputBadge system={activeTeam} className="hidden sm:flex" />
          </div>
          <button
            onClick={() => setFinalOutputOpen(false)}
            className="w-8 h-8 flex items-center justify-center transition-opacity opacity-60 hover:opacity-100 active:scale-90 text-lg leading-none"
            style={{ color: 'var(--fg-base)' }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="markdown-content font-hand text-base leading-relaxed" style={{ color: 'var(--fg-base)' }}>
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t-[3px] flex flex-col gap-6" style={{ borderColor: 'var(--stroke)' }}>
          {referenceImages.length > 0 && (
            <div className="space-y-3">
              <SketchLabel prefix seed="visual-inspiration-final">Visual Inspiration</SketchLabel>
              <div className="flex gap-2">
                {referenceImages.map((img, idx) => (
                  <div key={idx} className="w-12 h-12 overflow-hidden" style={{ border: '3px solid var(--stroke)', borderRadius: 0 }}>
                    <img src={img} alt="Ref" className="w-full h-full object-cover grayscale opacity-50" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="font-sketch uppercase tracking-[1.5px] text-[12px] leading-none" style={{ color: 'var(--fg-base)', opacity: 0.5 }}>
              Generated March 2026
            </div>
            <SketchButton variant="filled" size="md" onClick={handleCopy} seed="copy-output">
              {copied ? 'Copied!' : `Copy ${finalAssetType === 'text' ? 'Output' : 'Prompt'}`}
            </SketchButton>
          </div>
        </div>
      </SketchCard>
      </div>
    </div>
  )
}
