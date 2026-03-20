import { useEffect, useRef, useState } from 'react'

export default function ImageUploader({
  id,
  label,
  description,
  required = false,
  defaultPreview = null,
  onFileSelect,
  accept = 'image/png,image/jpeg,image/webp',
  multiple = false,
  icon,
}) {
  const [preview, setPreview] = useState(defaultPreview)
  const [previewList, setPreviewList] = useState([])
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => {
      previewList.forEach((item) => {
        URL.revokeObjectURL(item.url)
      })
    }
  }, [previewList])

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    const firstFile = files[0]
    const label = multiple && files.length > 1 ? `${files.length} files selected` : firstFile.name
    setFileName(label)
    if (multiple) {
      previewList.forEach((item) => {
        URL.revokeObjectURL(item.url)
      })
      const nextPreviewList = files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      }))
      setPreviewList(nextPreviewList)
      setActivePreviewIndex(0)
      setPreview(nextPreviewList[0]?.url || null)
    } else {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(firstFile)
    }
    onFileSelect(multiple ? files : firstFile)
  }

  const handleChange = (e) => {
    handleFiles(e.target.files)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
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
    previewList.forEach((item) => {
      URL.revokeObjectURL(item.url)
    })
    setPreviewList([])
    setActivePreviewIndex(0)
    setPreview(defaultPreview)
    setFileName(null)
    onFileSelect(multiple ? [] : null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const hasCustomImage = fileName !== null
  const hasMultiplePreview = multiple && previewList.length > 1
  const activePreview = hasMultiplePreview ? previewList[activePreviewIndex] : null

  const showPreviousPreview = (e) => {
    e.stopPropagation()
    if (!previewList.length) return
    const nextIndex =
      activePreviewIndex === 0 ? previewList.length - 1 : activePreviewIndex - 1
    setActivePreviewIndex(nextIndex)
    setPreview(previewList[nextIndex].url)
  }

  const showNextPreview = (e) => {
    e.stopPropagation()
    if (!previewList.length) return
    const nextIndex =
      activePreviewIndex === previewList.length - 1 ? 0 : activePreviewIndex + 1
    setActivePreviewIndex(nextIndex)
    setPreview(previewList[nextIndex].url)
  }

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
                {activePreview?.name || fileName || (defaultPreview ? 'Ảnh mặc định' : '')}
              </p>
              <p className="text-white/70 text-xs mt-0.5">Nhấn để thay thế</p>
            </div>
            {hasMultiplePreview && (
              <>
                <button
                  type="button"
                  onClick={showPreviousPreview}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/65 text-white text-lg flex items-center justify-center transition-colors"
                  aria-label="Ảnh trước"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={showNextPreview}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/65 text-white text-lg flex items-center justify-center transition-colors"
                  aria-label="Ảnh tiếp theo"
                >
                  ›
                </button>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium">
                  {activePreviewIndex + 1}/{previewList.length}
                </div>
              </>
            )}
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

        {hasMultiplePreview && (
          <div className="p-2 border-t border-border bg-surface">
            <div className="flex items-center gap-2 overflow-x-auto">
              {previewList.map((item, index) => (
                <button
                  key={`${item.name}-${index}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActivePreviewIndex(index)
                    setPreview(item.url)
                  }}
                  className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === activePreviewIndex ? 'border-primary' : 'border-transparent'
                  }`}
                  aria-label={`Xem preview ${index + 1}`}
                >
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          id={id}
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
