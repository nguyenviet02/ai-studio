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
  const [generatedImage, setGeneratedImage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const lastFormDataRef = useRef(null)

  const handleGenerate = async (formData) => {
    lastFormDataRef.current = formData
    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Tạo ảnh thất bại')
      }

      if (data.success) {
        setGeneratedImage(data.image)
      } else {
        throw new Error(data.error || 'Không có ảnh nào được tạo')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRetry = () => {
    if (!lastFormDataRef.current) return
    const prev = lastFormDataRef.current
    const formData = new FormData()
    for (const [key, value] of prev.entries()) {
      formData.append(key, value)
    }
    handleGenerate(formData)
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
              image={generatedImage}
              isGenerating={isGenerating}
              error={error}
              onRetry={handleRetry}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
