import { useEffect, useRef } from 'react'
import { useGameStore } from './store/gameStore'
import Desktop from './components/Desktop/Desktop'
import HorrorOverlay from './components/HorrorEvent/HorrorOverlay'
import './styles/pixel.css'

const clickAudio = new Audio('/click.mp3')
const CLICK_THROTTLE = 80

function DevStageSelector() {
  const currentStage = useGameStore((s) => s.currentStage)
  const jumpToStage = useGameStore((s) => s.jumpToStage)
  if (!import.meta.env.DEV) return null
  return (
    <div style={{
      position: 'fixed', bottom: 36, right: 8, zIndex: 9999,
      display: 'flex', gap: 4, background: 'rgba(0,0,0,0.7)',
      padding: '4px 6px', borderRadius: 4,
    }}>
      {[1, 2].map((s) => (
        <button key={s} onClick={() => jumpToStage(s)} style={{
          fontFamily: 'monospace', fontSize: 11, cursor: 'pointer',
          padding: '2px 8px', border: '1px solid #555',
          background: currentStage === s ? '#446' : '#222',
          color: currentStage === s ? '#aaf' : '#888',
          borderRadius: 3,
        }}>S{s}</button>
      ))}
    </div>
  )
}

function App() {
  const currentStage = useGameStore((s) => s.currentStage)
  const centralSolved = useGameStore((s) => s.centralSolved)
  const lastClickTime = useRef(0)

  // 어두움 오버레이 활성 시 클릭 볼륨 감소
  useEffect(() => {
    clickAudio.volume = centralSolved ? 0.2 : 1.0
  }, [centralSolved])

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
      <DevStageSelector />
      {centralSolved && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
          pointerEvents: 'none',
          transition: 'opacity 0.5s',
        }} />
      )}
    </div>
  )
}

export default App
