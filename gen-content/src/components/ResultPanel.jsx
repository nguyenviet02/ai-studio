import { useState } from 'react'

export default function ResultPanel({ image, isGenerating, error, onRetry }) {
  const [isZoomed, setIsZoomed] = useState(false)

  const handleDownload = () => {
    if (!image) return
    const link = document.createElement('a')
    link.href = image
    link.download = `generated_outfit_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="rounded-2xl bg-surface-card border border-border overflow-hidden h-full flex flex-col">
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-accent/5 to-primary/5">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <span>🎨</span> Kết Quả
        </h2>
        <p className="text-sm text-text-secondary mt-0.5">
          {isGenerating ? 'Đang tạo ảnh của bạn...' : image ? 'Ảnh đã tạo của bạn' : 'Kết quả sẽ xuất hiện ở đây'}
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
              <p className="text-xs text-text-muted mt-1">Có thể mất từ 30-60 giây...</p>
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
        ) : image ? (
          <div className="w-full">
            <div
              className="relative rounded-xl overflow-hidden cursor-zoom-in group"
              onClick={() => setIsZoomed(true)}
            >
              <img
                src={image}
                alt="Trang phục đã tạo"
                className="w-full h-auto max-h-[600px] object-contain rounded-xl"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  🔍 Nhấn để thu phóng
                </span>
              </div>
            </div>
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
      {image && !isGenerating && (
        <div className="px-6 py-4 border-t border-border flex items-center gap-3">
          <button
            onClick={handleDownload}
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
      {isZoomed && image && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={image}
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
