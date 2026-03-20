import { useState, useRef } from 'react'
import Header from './components/Header'
import TabBar from './components/TabBar'
import OutfitTab from './components/OutfitTab'
import ResultPanel from './components/ResultPanel'

const TABS = [
  { id: 'outfit', label: 'Thay Đổi Trang Phục', icon: '👗' },
]

function App() {
  const [activeTab, setActiveTab] = useState('outfit')
  const [generatedImages, setGeneratedImages] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [batchProgress, setBatchProgress] = useState(null)
  const lastRequestRef = useRef(null)

  const handleGenerate = async (requestPayload) => {
    lastRequestRef.current = requestPayload
    setIsGenerating(true)
    setError(null)
    setGeneratedImages([])

    try {
      const totalOutfits = requestPayload?.outfitFiles?.length || 0
      if (!totalOutfits) {
        throw new Error('Vui lòng chọn ít nhất 1 ảnh trang phục')
      }

      setBatchProgress({ current: 0, total: totalOutfits })

      for (let index = 0; index < totalOutfits; index += 1) {
        const outfitFile = requestPayload.outfitFiles[index]
        const formData = new FormData()
        formData.append('outfit', outfitFile)

        if (requestPayload.modelFile) formData.append('model', requestPayload.modelFile)
        if (requestPayload.backgroundFile) formData.append('background', requestPayload.backgroundFile)
        formData.append('aspectRatio', requestPayload.aspectRatio || '9:16')
        formData.append('resolution', requestPayload.resolution || '2K')

        setBatchProgress({ current: index + 1, total: totalOutfits })

        const res = await fetch('/api/generate-image', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(
            data.error || `Tạo ảnh thất bại ở outfit ${index + 1}/${totalOutfits}`,
          )
        }

        if (data.success) {
          setGeneratedImages((prev) => [...prev, data.image])
        } else {
          throw new Error(data.error || 'Không có ảnh nào được tạo')
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
      setBatchProgress(null)
    }
  }

  const handleRetry = () => {
    if (!lastRequestRef.current) return
    handleGenerate(lastRequestRef.current)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left Panel — Input */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {activeTab === 'outfit' && (
              <OutfitTab onGenerate={handleGenerate} isGenerating={isGenerating} />
            )}
          </div>

          {/* Right Panel — Result */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <ResultPanel
              images={generatedImages}
              isGenerating={isGenerating}
              error={error}
              onRetry={handleRetry}
              batchProgress={batchProgress}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
