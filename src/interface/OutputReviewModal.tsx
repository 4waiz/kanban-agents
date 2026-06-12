import { useState, useEffect } from 'react'
import { useCoreStore } from '../integration/store/coreStore'
import { useActiveTeam } from '../integration/store/teamStore'
import { useSceneManager } from '../simulation/SceneContext'
import {
  Sparkles,
  Settings2,
  Image as ImageIcon,
  Video,
  Music,
  Type,
  X,
  Check,
  Monitor,
  Clock,
  Maximize,
  Volume2,
  AlertCircle
} from 'lucide-react'
import { AVAILABLE_MODELS } from '../core/llm/constants'
import { InfoBubble } from './components/InfoBubble'
import { SketchButton, SketchCard, SketchLabel } from './sketch'

export function OutputReviewModal() {
  const {
    isReviewingOutput,
    setReviewingOutput,
    pendingOutputPrompt,
    pendingOutputParams,
    resetProject,
    referenceImages
  } = useCoreStore()

  const activeTeam = useActiveTeam()
  const scene = useSceneManager()
  const [prompt, setPrompt] = useState(pendingOutputPrompt)
  const [params, setParams] = useState(pendingOutputParams)
  const [isConfirmingReset, setIsConfirmingReset] = useState(false)

  // Sync internal state when store changes
  useEffect(() => {
    if (isReviewingOutput) {
      setPrompt(pendingOutputPrompt)
      setParams(pendingOutputParams)
      setIsConfirmingReset(false)
    }
  }, [isReviewingOutput, pendingOutputPrompt, pendingOutputParams])

  if (!isReviewingOutput) return null

  const handleGenerate = async () => {
    const brain = scene?.getLeadBrain()
    if (brain) {
      // Trigger the actual generation
      await brain.processFinalAsset(prompt, params)
    }
  }

  const handleCancelAndReset = () => {
    setIsConfirmingReset(true)
  }

  const confirmReset = () => {
    resetProject()
    setIsConfirmingReset(false)
    setReviewingOutput(false)
  }

  const updateParam = (key: string, value: any) => {
    setParams((prev: any) => ({ ...prev, [key]: value }))
  }

  const renderImageControls = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="font-sketch uppercase tracking-[1.5px] text-[12px] flex items-center gap-1.5" style={{ color: 'var(--fg-base)', opacity: 0.65 }}>
          <Maximize size={12} /> Aspect Ratio
          <InfoBubble text="The horizontal or vertical proportions of the generated asset." />
        </label>
        <select
          value={params.aspectRatio || '16:9'}
          onChange={(e) => updateParam('aspectRatio', e.target.value)}
          className="w-full px-3 py-2 text-xs font-hand focus:outline-none"
          style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
        >
          <option value="1:1">1:1 Square</option>
          <option value="16:9">16:9 Cinematic</option>
          <option value="9:16">9:16 Vertical</option>
          <option value="4:3">4:3 Classic</option>
          <option value="3:2">3:2 Professional</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="font-sketch uppercase tracking-[1.5px] text-[12px] flex items-center gap-1.5" style={{ color: 'var(--fg-base)', opacity: 0.65 }}>
          <Settings2 size={12} /> Image Size
          <InfoBubble text="Target dimensions for the final image. Higher sizes offer more detail but may take longer." />
        </label>
        <select
          value={params.imageSize || '1K'}
          onChange={(e) => updateParam('imageSize', e.target.value)}
          className="w-full px-3 py-2 text-xs font-hand focus:outline-none"
          style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
        >
          <option value="512">512px (Fast)</option>
          <option value="1K">1K (Standard)</option>
          <option value="2K">2K (High Res)</option>
          <option value="4K">4K (Ultra)</option>
        </select>
      </div>
    </div>
  )

  const renderVideoControls = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-sketch uppercase tracking-[1.5px] text-[12px] flex items-center gap-1.5" style={{ color: 'var(--fg-base)', opacity: 0.65 }}>
            <Monitor size={12} /> Resolution
            <InfoBubble text="Video output quality. Higher resolutions increase visual fidelity and processing requirements." />
          </label>
          <select
            value={params.resolution || '720p'}
            onChange={(e) => updateParam('resolution', e.target.value)}
            className="w-full px-3 py-2 text-xs font-hand focus:outline-none"
          style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
          >
            <option value="720p">720p HD</option>
            <option value="1080p">1080p Full HD</option>
            <option value="4k">4K Vision</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="font-sketch uppercase tracking-[1.5px] text-[12px] flex items-center gap-1.5" style={{ color: 'var(--fg-base)', opacity: 0.65 }}>
            <Clock size={12} /> Duration
            <InfoBubble text="Total runtime of the generated video clip." />
          </label>
          <select
            value={params.durationSeconds || 4}
            onChange={(e) => updateParam('durationSeconds', parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-hand focus:outline-none"
          style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
          >
            <option value="4">4 Seconds</option>
            <option value="6">6 Seconds</option>
            <option value="8">8 Seconds</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderModelControl = () => {
    const type = activeTeam.outputType === 'music' ? 'music' : (activeTeam.outputType as keyof typeof AVAILABLE_MODELS);
    const models = AVAILABLE_MODELS[type] || [];

    return (
      <div className="space-y-2">
        <label className="font-sketch uppercase tracking-[1.5px] text-[12px] flex items-center gap-1.5" style={{ color: 'var(--fg-base)', opacity: 0.65 }}>
          <Sparkles size={12} /> Generation Model
          <InfoBubble text="Select the specific Gemini model used for the final generation. Flash models are faster, Pro models are more capable." />
        </label>
        <select
          value={params.model || activeTeam.outputModel}
          onChange={(e) => updateParam('model', e.target.value)}
          className="w-full px-3 py-2 text-xs font-hand focus:outline-none"
          style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
        >
          {models.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    )
  }

  const Icon = {
    image: ImageIcon,
    video: Video,
    music: Music,
    text: Type
  }[activeTeam.outputType] || Sparkles

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--bg-base) 75%, transparent)' }}
      onClick={handleCancelAndReset}
    >
      <div
        className="w-180 max-w-full flex"
        onClick={(e) => e.stopPropagation()}
      >
      <SketchCard
        variant="paper"
        seed="output-review-modal"
        className="w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{ overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b-[3px]" style={{ borderColor: 'var(--stroke)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ background: 'var(--fg-base)', color: 'var(--bg-base)', borderRadius: 0 }}>
              <Icon size={24} />
            </div>
            <div>
              <h2 className="font-marker uppercase text-xl leading-[0.95] flex items-center gap-2" style={{ color: 'var(--fg-base)' }}>
                Review &amp; Optimize Output
              </h2>
              <p className="font-hand text-sm mt-1" style={{ color: 'var(--fg-base)', opacity: 0.6 }}>
                The lead agent has synthesized the team's work. Fine-tune it before final generation.
              </p>
            </div>
          </div>
          <button
            onClick={handleCancelAndReset}
            className="w-8 h-8 flex items-center justify-center transition-opacity opacity-60 hover:opacity-100 active:scale-90"
            style={{ color: 'var(--fg-base)' }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8" style={{ background: 'var(--bg-surface)' }}>
          {/* Prompt Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SketchLabel prefix seed="prompt-content-label">Prompt / Content</SketchLabel>
              <div className="px-2 py-0.5 font-sketch uppercase text-[9px] tracking-[1px]" style={{ border: '3px solid var(--stroke)', color: 'var(--fg-base)', opacity: 0.6, borderRadius: 0 }}>
                EDITABLE
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-40 p-4 text-sm leading-relaxed font-hand focus:outline-none resize-none"
              style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}
              placeholder="Enter the final generation prompt..."
            />
          </div>

          {/* Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {renderModelControl()}
              {activeTeam.outputType === 'image' && renderImageControls()}
              {activeTeam.outputType === 'video' && renderVideoControls()}
            </div>

            <div className="p-6 space-y-4" style={{ background: 'var(--fg-base)', color: 'var(--bg-base)', border: '3px solid var(--stroke)', borderRadius: 0, boxShadow: '6px 6px 0 0 var(--stroke)' }}>
              <h3 className="font-sketch uppercase tracking-[1.5px] text-[12px]" style={{ opacity: 0.6 }}>System Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-sketch text-[10px] uppercase tracking-[1.5px]" style={{ opacity: 0.55 }}>Team</p>
                  <p className="font-marker uppercase text-sm leading-[0.95]">{activeTeam.teamName}</p>
                </div>
                <div>
                  <p className="font-sketch text-[10px] uppercase tracking-[1.5px]" style={{ opacity: 0.55 }}>Output Type</p>
                  <p className="font-marker uppercase text-sm leading-[0.95]">{activeTeam.outputType}</p>
                </div>

                {referenceImages.length > 0 && (
                  <div className="pt-6 border-t-[3px] space-y-3" style={{ borderColor: 'color-mix(in srgb, var(--bg-base) 25%, transparent)' }}>
                    <p className="font-sketch text-[10px] uppercase tracking-[1.5px]" style={{ opacity: 0.55 }}>Visual Inspiration</p>
                    <div className="grid grid-cols-3 gap-2">
                      {referenceImages.map((img, idx) => (
                        <div key={idx} className="aspect-square overflow-hidden" style={{ border: '3px solid color-mix(in srgb, var(--bg-base) 30%, transparent)', borderRadius: 0 }}>
                          <img src={img} alt="Ref" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t-[3px]" style={{ borderColor: 'color-mix(in srgb, var(--bg-base) 25%, transparent)' }}>
                  <p className="font-hand text-sm leading-relaxed italic" style={{ opacity: 0.75 }}>
                    "This is the final terminal phase. You can adjust the parameters and the synthesized prompt to get the best result. Once approved, the simulation will complete and your asset will be generated."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t-[3px] flex justify-end items-center gap-3" style={{ borderColor: 'var(--stroke)' }}>
          <SketchButton variant="default" size="md" onClick={handleCancelAndReset} seed="cancel-reset-project">
            Cancel &amp; Reset Project
          </SketchButton>

          <SketchButton variant="filled" size="md" onClick={handleGenerate} seed="approve-generate">
            <Check size={14} strokeWidth={3} />
            Approve &amp; Generate
          </SketchButton>
        </div>
      </SketchCard>
      </div>

      {/* Confirmation Modal Overlay */}
      {isConfirmingReset && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 cursor-default"
          style={{ background: 'color-mix(in srgb, var(--bg-base) 75%, transparent)' }}
          onClick={(e) => {
            e.stopPropagation()
            setIsConfirmingReset(false)
          }}
        >
          <div
            className="w-96 flex"
            onClick={(e) => e.stopPropagation()}
          >
          <SketchCard
            variant="paper"
            seed="confirm-reset-modal"
            className="w-full p-8 flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-16 h-16 flex items-center justify-center text-red-500" style={{ border: '3px solid #ef4444', borderRadius: 0 }}>
              <AlertCircle size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-marker uppercase text-xl leading-[0.95]" style={{ color: 'var(--fg-base)' }}>Are you absolutely sure?</h3>
              <p className="font-hand text-base mt-2 leading-relaxed" style={{ color: 'var(--fg-base)', opacity: 0.7 }}>
                All progress will be lost and the project will be reset to its initial state. This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col w-full gap-2 mt-2 items-stretch">
              <SketchButton variant="filled" size="md" onClick={confirmReset} seed="yes-reset-project" className="w-full">
                Yes, Reset Project
              </SketchButton>
              <SketchButton variant="default" size="md" onClick={() => setIsConfirmingReset(false)} seed="no-go-back" className="w-full">
                No, Go Back
              </SketchButton>
            </div>
          </SketchCard>
          </div>
        </div>
      )}
    </div>
  )
}
