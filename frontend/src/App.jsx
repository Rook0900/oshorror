import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import Desktop from './components/Desktop/Desktop'
import HorrorOverlay from './components/HorrorEvent/HorrorOverlay'
import './styles/pixel.css'

function App() {
  const currentStage = useGameStore((s) => s.currentStage)

  // 키보드 완전 비활성화
  useEffect(() => {
    const block = (e) => e.preventDefault()
    window.addEventListener('keydown', block)
    window.addEventListener('keyup', block)
    return () => {
      window.removeEventListener('keydown', block)
      window.removeEventListener('keyup', block)
    }
  }, [])

  return (
    <div className="app-root">
      <Desktop stageId={currentStage} />
      <HorrorOverlay />
    </div>
  )
}

export default App
