export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface/80 border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/25">
            G
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary leading-tight">
              Tạo Nội Dung
            </h1>
            <p className="text-xs text-text-muted leading-tight">
              Studio Thời Trang AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success/15 text-success border border-success/20">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Trực tuyến
          </span>
        </div>
      </div>
    </header>
  )
}
