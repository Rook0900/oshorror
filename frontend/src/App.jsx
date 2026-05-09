import { useEffect, useRef, useState } from 'react'
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
      {[1, 2, 3].map((s) => (
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

function EndingScreen() {
  const jumpToStage = useGameStore((s) => s.jumpToStage)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2000)
    const t2 = setTimeout(() => setPhase(2), 5000)
    const t3 = setTimeout(() => setPhase(3), 8500)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000', zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 28, fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
    }}>
      <div style={{
        color: '#aaaacc', fontSize: 13, letterSpacing: 2,
        opacity: phase >= 1 ? 1 : 0, transition: 'opacity 1.5s',
        textAlign: 'center', lineHeight: 2,
      }}>
        시스템 복원 완료.<br />모든 회로 활성화.
      </div>

      <div style={{
        color: '#ff4444', fontSize: 11, letterSpacing: 1,
        opacity: phase >= 2 ? 1 : 0, transition: 'opacity 1.5s',
        textAlign: 'center', lineHeight: 2.2,
      }}>
        .<br />.<br />.<br />
        당신은 이 건물을 떠날 수 없습니다.<br />
        처음부터, 그것이 목적이었습니다.
      </div>

      <div style={{
        opacity: phase >= 3 ? 1 : 0, transition: 'opacity 1.2s', marginTop: 20,
      }}>
        <button
          onClick={() => jumpToStage(1)}
          style={{
            fontFamily: 'monospace', fontSize: 10, cursor: 'pointer',
            padding: '6px 18px', border: '1px solid #444',
            background: '#0a0a18', color: '#666',
            borderRadius: 2, letterSpacing: 1,
          }}
        >
          다시 시작
        </button>
      </div>
    </div>
  )
}

function App() {
  const currentStage = useGameStore((s) => s.currentStage)
  const centralSolved = useGameStore((s) => s.centralSolved)
  const gameEnded = useGameStore((s) => s.gameEnded)
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
      {gameEnded && <EndingScreen />}
    </div>
  )
}

export default App
