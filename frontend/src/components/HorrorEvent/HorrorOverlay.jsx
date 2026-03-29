import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/gameStore'

const HORROR_TEXTS = [
  { text: '나가지 마세요', top: '20%', left: '30%' },
  { text: '도망칠 수 없다', top: '50%', left: '10%' },
  { text: '이미 늦었어', top: '70%', left: '60%' },
  { text: '보고 있다', top: '35%', left: '70%' },
  { text: '꺼지지 않아', top: '80%', left: '25%' },
]

export default function HorrorOverlay() {
  const horrorActive = useGameStore((s) => s.horrorActive)
  const horrorType = useGameStore((s) => s.horrorType)
  const clearHorror = useGameStore((s) => s.clearHorror)
  const [showTexts, setShowTexts] = useState(false)
  const [flickerOn, setFlickerOn] = useState(true)

  useEffect(() => {
    if (!horrorActive) return

    if (horrorType === 'powerdown') {
      // 두꺼비집 효과: 빠른 깜빡임 후 완전 암전
      const flickerTimes = [0, 80, 160, 260, 340, 420, 500, 560]
      const timers = flickerTimes.map((delay, i) =>
        setTimeout(() => setFlickerOn(i % 2 === 0 ? false : true), delay)
      )
      // 560ms 후 완전 암전 고정
      const darkTimer = setTimeout(() => setFlickerOn(false), 620)
      return () => {
        timers.forEach(clearTimeout)
        clearTimeout(darkTimer)
      }
    }

    if (horrorType === 'blackout') {
      setShowTexts(true)
      const t = setTimeout(() => {
        clearHorror()
        setShowTexts(false)
      }, 3500)
      return () => clearTimeout(t)
    }

    if (horrorType === 'distort') {
      const t = setTimeout(() => {
        clearHorror()
      }, 3000)
      return () => clearTimeout(t)
    }

    if (horrorType === 'glitch') {
      const t = setTimeout(() => {
        clearHorror()
      }, 2000)
      return () => clearTimeout(t)
    }
  }, [horrorActive, horrorType])

  if (!horrorActive) return null

  return (
    <div className={`horror-overlay ${horrorType}`}>
      {horrorType === 'powerdown' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: flickerOn ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.7)',
          transition: flickerOn ? 'none' : 'background 0.15s',
          pointerEvents: 'all',
        }} />
      )}
      {horrorType === 'blackout' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}>
          {showTexts && HORROR_TEXTS.map((t, i) => (
            <div
              key={i}
              className="horror-text"
              style={{
                top: t.top,
                left: t.left,
                position: 'absolute',
                animationDelay: `${i * 0.2}s`,
              }}
            >
              {t.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
