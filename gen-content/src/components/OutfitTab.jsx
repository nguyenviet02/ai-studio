import { useState, useEffect } from 'react'
import ImageUploader from './ImageUploader'

export default function OutfitTab({ onGenerate, isGenerating }) {
  const [outfitFiles, setOutfitFiles] = useState([])
  const [modelFile, setModelFile] = useState(null)
  const [backgroundFile, setBackgroundFile] = useState(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [defaultModel, setDefaultModel] = useState(null)
  const [defaultBackground, setDefaultBackground] = useState(null)
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [resolution, setResolution] = useState('2K')

  // Load default images on mount
  useEffect(() => {
    fetch('/api/defaults/model')
      .then((r) => r.json())
      .then((d) => setDefaultModel(d.image))
      .catch(() => {})

    fetch('/api/defaults/background')
      .then((r) => r.json())
      .then((d) => setDefaultBackground(d.image))
      .catch(() => {})
  }, [])

  const handleSubmit = () => {
    if (!outfitFiles.length) return

    onGenerate({
      outfitFiles,
      modelFile,
      backgroundFile,
      customPrompt: customPrompt.trim(),
      aspectRatio,
      resolution,
    })
  }

  const aspectRatios = ['9:16', '16:9', '1:1', '3:4', '4:3']
  const resolutions = ['1K', '2K']

  return (
    <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <span>👗</span> Thay Đổi Trang Phục
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Tải lên ảnh trang phục và tùy chỉnh người mẫu & nền (tùy chọn)
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Outfit Upload - Required */}
        <ImageUploader
          id="outfit-upload"
          label="Ảnh Trang Phục"
          description="PNG, JPEG hoặc WebP — tối đa 10MB (có thể chọn nhiều ảnh)"
          required
          multiple
          icon="👕"
          onFileSelect={setOutfitFiles}
        />

        {/* Optional Uploads */}
        <div className="grid grid-cols-2 gap-4">
          <ImageUploader
            id="model-upload"
            label="Người Mẫu"
            description="Tùy chọn — sử dụng mặc định"
            icon="🧍‍♀️"
            defaultPreview={defaultModel}
            onFileSelect={setModelFile}
          />
          <ImageUploader
            id="background-upload"
            label="Nền"
            description="Tùy chọn — sử dụng mặc định"
            icon="🖼️"
            defaultPreview={defaultBackground}
            onFileSelect={setBackgroundFile}
          />
        </div>

        <div>
          <label htmlFor="custom-prompt" className="text-sm font-medium text-text-primary mb-2 block">
            ✍️ Prompt Tùy Chỉnh
          </label>
          <textarea
            id="custom-prompt"
            rows={4}
            maxLength={1000}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ví dụ: thêm ánh sáng studio mềm, phong cách thời trang cao cấp, màu sắc tự nhiên..."
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 resize-y min-h-[110px]"
          />
          <p className="mt-1 text-xs text-text-muted text-right">
            {customPrompt.length}/1000
          </p>
        </div>

        {/* Settings */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              📐 Tỷ Lệ Khung Hình
            </label>
            <div className="flex flex-wrap gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`
                    px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                    ${aspectRatio === ratio
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'bg-surface-hover text-text-secondary hover:text-text-primary border border-border'
                    }
                  `}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              🔍 Độ Phân Giải
            </label>
            <div className="flex flex-wrap gap-2">
              {resolutions.map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`
                    px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                    ${resolution === res
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'bg-surface-hover text-text-secondary hover:text-text-primary border border-border'
                    }
                  `}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          id="generate-btn"
          onClick={handleSubmit}
          disabled={!outfitFiles.length || isGenerating}
          className={`
            w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer
            flex items-center justify-center gap-2
            ${outfitFiles.length && !isGenerating
              ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.99]'
              : 'bg-surface-hover text-text-muted cursor-not-allowed'
            }
          `}
        >
          {isGenerating ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang tạo...
            </>
          ) : (
            <>
              ✨ Tạo {outfitFiles.length > 1 ? `${outfitFiles.length} Ảnh` : 'Ảnh'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
