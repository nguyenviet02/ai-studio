import { useEffect, useState } from 'react'

export default function ResultPanel({ images = [], isGenerating, error, onRetry, batchProgress }) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHoveringCarouselControl, setIsHoveringCarouselControl] = useState(false)
  const hasImages = images.length > 0
  const hasCarousel = images.length > 1
  const currentImage = hasImages ? images[activeIndex] : null

  useEffect(() => {
    if (!images.length) {
      setActiveIndex(0)
      return
    }
    setActiveIndex(images.length - 1)
  }, [images.length])

  const showPreviousResult = () => {
    if (!images.length) return
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const showNextResult = () => {
    if (!images.length) return
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleDownload = async () => {
    if (!currentImage) return
    const filename = `generated_outfit_${Date.now()}.png`
    const isMobile = /Android|webOS|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
      navigator.userAgent,
    )

    try {
      const response = await fetch(currentImage)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)

      const file = new File([blob], filename, {
        type: blob.type || 'image/png',
      })

      if (isMobile && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename })
        URL.revokeObjectURL(objectUrl)
        return
      }

      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch {
      if (isMobile) {
        window.open(currentImage, '_blank', 'noopener,noreferrer')
        return
      }
      const fallbackLink = document.createElement('a')
      fallbackLink.href = currentImage
      fallbackLink.download = filename
      document.body.appendChild(fallbackLink)
      fallbackLink.click()
      document.body.removeChild(fallbackLink)
    }
  }

  return (
    <div className="rounded-2xl bg-surface-card border border-border overflow-hidden h-full flex flex-col">
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-accent/5 to-primary/5">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <span>🎨</span> Kết Quả
        </h2>
        <p className="text-sm text-text-secondary mt-0.5">
          {isGenerating
            ? 'Đang tạo ảnh của bạn...'
            : hasImages
              ? `Đã tạo ${images.length} ảnh`
              : 'Kết quả sẽ xuất hiện ở đây'}
        </p>
      </div>

      <div className="flex-1 p-6 flex items-center justify-center min-h-[400px]">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            {/* Animated Loader */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-border" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-accent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">Đang tạo ảnh của bạn</p>
              <p className="text-xs text-text-muted mt-1">
                {batchProgress?.total
                  ? `Đang xử lý outfit ${batchProgress.current}/${batchProgress.total} (mỗi lần 1 ảnh)`
                  : 'Có thể mất từ 30-60 giây...'}
              </p>
            </div>
            <div className="w-48 h-1 rounded-full bg-surface-hover overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent shimmer-bg" style={{ width: '100%' }} />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 text-center max-w-xs">
            <div className="w-14 h-14 rounded-2xl bg-error/15 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-error">Tạo Ảnh Thất Bại</p>
              <p className="text-xs text-text-muted mt-1">{error}</p>
            </div>
          </div>
        ) : hasImages ? (
          <div className="w-full">
            <div
              className="relative rounded-xl overflow-hidden cursor-zoom-in group"
              onClick={() => setIsZoomed(true)}
            >
              <img
                src={currentImage}
                alt="Trang phục đã tạo"
                className="w-full h-auto max-h-[600px] object-contain rounded-xl"
              />
              {hasCarousel && (
                <>
                  <button
                    type="button"
                    onMouseEnter={() => setIsHoveringCarouselControl(true)}
                    onMouseLeave={() => setIsHoveringCarouselControl(false)}
                    onClick={(e) => {
                      e.stopPropagation()
                      showPreviousResult()
                    }}
                    className="absolute z-20 left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 text-white text-2xl flex items-center justify-center transition-colors"
                    aria-label="Kết quả trước"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onMouseEnter={() => setIsHoveringCarouselControl(true)}
                    onMouseLeave={() => setIsHoveringCarouselControl(false)}
                    onClick={(e) => {
                      e.stopPropagation()
                      showNextResult()
                    }}
                    className="absolute z-20 right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 text-white text-2xl flex items-center justify-center transition-colors"
                    aria-label="Kết quả tiếp theo"
                  >
                    ›
                  </button>
                  <div className="absolute z-20 top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
                    {activeIndex + 1}/{images.length}
                  </div>
                </>
              )}
              <div className="absolute inset-0 z-10 pointer-events-none bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <span className={`transition-opacity duration-300 text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm ${
                  isHoveringCarouselControl ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  🔍 Nhấn để thu phóng
                </span>
              </div>
            </div>
            {hasCarousel && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                {images.map((resultImage, index) => (
                  <button
                    key={`result-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      index === activeIndex ? 'border-primary' : 'border-transparent'
                    }`}
                    aria-label={`Xem kết quả ${index + 1}`}
                  >
                    <img src={resultImage} alt={`Kết quả ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center max-w-xs">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-surface-hover to-surface-elevated flex items-center justify-center border border-border">
              <span className="text-3xl opacity-50">🖼️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">Chưa có ảnh</p>
              <p className="text-xs text-text-muted mt-1">
                Tải lên trang phục và nhấn Tạo Ảnh để xem kết quả
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {hasImages && !isGenerating && (
        <div className="px-6 py-4 border-t border-border flex items-center gap-3">
          <button
            onClick={() => {
              void handleDownload()
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-success/15 text-success border border-success/20 hover:bg-success/25 transition-all duration-200 cursor-pointer"
          >
            ⬇️ Tải xuống
          </button>
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-all duration-200 cursor-pointer"
          >
            🔄 Thử lại
          </button>
        </div>
      )}

      {/* Zoomed Modal */}
      {isZoomed && currentImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={currentImage}
            alt="Trang phục đã tạo (thu phóng)"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-sm"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
