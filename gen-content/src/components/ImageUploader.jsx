import { useState, useRef } from 'react'

export default function ImageUploader({
  id,
  label,
  description,
  required = false,
  defaultPreview = null,
  onFileSelect,
  accept = 'image/png,image/jpeg,image/webp',
  icon,
}) {
  const [preview, setPreview] = useState(defaultPreview)
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState(null)
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
    onFileSelect(file)
  }

  const handleChange = (e) => {
    handleFile(e.target.files?.[0])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setPreview(defaultPreview)
    setFileName(null)
    onFileSelect(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const hasCustomImage = fileName !== null

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="text-sm font-medium text-text-primary flex items-center gap-2">
          <span className="text-base">{icon}</span>
          {label}
          {required && <span className="text-error text-xs">*Bắt buộc</span>}
        </label>
        {hasCustomImage && (
          <button
            onClick={handleClear}
            className="text-xs text-text-muted hover:text-error transition-colors cursor-pointer"
          >
            ✕ Xóa
          </button>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-300 ease-out overflow-hidden
          ${isDragOver
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : preview
              ? 'border-border-light hover:border-primary/50'
              : 'border-border hover:border-primary/50 hover:bg-surface-hover/50'
          }
        `}
      >
        {preview ? (
          <div className="relative aspect-[3/4] max-h-[280px]">
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-xs truncate">
                {fileName || (defaultPreview ? 'Ảnh mặc định' : '')}
              </p>
              <p className="text-white/70 text-xs mt-0.5">Nhấn để thay thế</p>
            </div>
            {!required && !hasCustomImage && defaultPreview && (
              <div className="absolute top-2 right-2">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/90 text-white">
                  Mặc định
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-hover flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">{icon}</span>
            </div>
            <p className="text-sm font-medium text-text-primary mb-1">
              Kéo thả ảnh vào đây hoặc nhấn để tải lên
            </p>
            <p className="text-xs text-text-muted">{description}</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          id={id}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
