import { useEffect, useRef } from 'react'
import { useGameStore } from './store/gameStore'
import Desktop from './components/Desktop/Desktop'
import HorrorOverlay from './components/HorrorEvent/HorrorOverlay'
import './styles/pixel.css'

const clickAudio = new Audio('/click.mp3')
const CLICK_THROTTLE = 80

function App() {
  const currentStage = useGameStore((s) => s.currentStage)
  const lastClickTime = useRef(0)

  // 클릭 사운드
  useEffect(() => {
    const handleClick = () => {
      const now = Date.now()
      if (now - lastClickTime.current < CLICK_THROTTLE) return
      lastClickTime.current = now
      clickAudio.currentTime = 0
      clickAudio.play().catch(() => {})
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [])

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
