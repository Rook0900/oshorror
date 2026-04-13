import { useState, useCallback, useRef, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'

// 8 phases: index 0(left) → 7(right)
const PHASE_NAMES = [
  '삭',
  '초승달',
  '상현달',
  '상현망간의 달',
  '보름달',
  '하현망간의 달',
  '하현달',
  '그믐달',
]

// 연속적인 phaseT(0.0~8.0)를 받아 부드럽게 달 위상을 렌더링
function MoonSVG({ phaseT }) {
  const size = 100
  const r = 45
  const cx = size / 2
  const cy = size / 2
  const darkColor = '#140a0a'

  const moonDefs = (
    <defs>
      <clipPath id="moon-clip">
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
    </defs>
  )

  const moonBase = (
    <image
      href="/moon.jpg"
      xlinkHref="/moon.jpg"
      x="0" y="0" width={size} height={size}
      clipPath="url(#moon-clip)"
      preserveAspectRatio="xMidYMid slice"
    />
  )
  const darkOverlay = <circle cx={cx} cy={cy} r={r} fill="black" opacity="0.2" clipPath="url(#moon-clip)" />

  // t를 [0, 8) 범위로 정규화
  const t = ((phaseT % 8) + 8) % 8

  // 삭(new moon): 거의 완전히 어두움
  if (t < 0.08 || t > 7.92) {
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="#111118" stroke="#2a2a3a" strokeWidth="1" />
      </svg>
    )
  }

  // 보름달(full moon): 그림자 없음
  if (t > 3.95 && t < 4.05) {
    return (
      <svg width={size} height={size}>
        {moonDefs}
        {moonBase}
        {darkOverlay}
      </svg>
    )
  }

  // 터미네이터(명암 경계) 타원의 x반축
  // cos(t*π/4): t=0→r, t=2→0(반달), t=4→r, t=6→0(반달), t=8→r
  const terminatorRx = r * Math.abs(Math.cos(t * Math.PI / 4))

  let shadowPath
  if (t < 4) {
    // 상현(waxing): 그림자가 왼쪽에 있고, 오른쪽이 밝아짐
    // t<2: 초승달(작은 빛), t>2: 상현망간(큰 빛)
    const d = t < 2 ? 0 : 1
    shadowPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${terminatorRx} ${r} 0 0 ${d} ${cx} ${cy - r} Z`
  } else {
    // 하현(waning): 그림자가 오른쪽에 있고, 왼쪽이 밝음
    // t<6: 하현망간(큰 빛), t>6: 그믐달(작은 빛)
    const d = t < 6 ? 0 : 1
    shadowPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${terminatorRx} ${r} 0 0 ${d} ${cx} ${cy - r} Z`
  }

  return (
    <svg width={size} height={size}>
      {moonDefs}
      {moonBase}
      <path d={shadowPath} fill={darkColor} clipPath="url(#moon-clip)" />
      {darkOverlay}
    </svg>
  )
}

// 위치 → 연속 phaseT (float 0.0~8.0)
// 기존 이산 위상 경계를 그대로 사용해 선형 보간
function getMoonPhaseT(x) {
  const w = window.innerWidth
  const p = Math.max(0, Math.min(1, x / w))
  const thresholds = [0, 0.095, 0.220, 0.345, 0.470, 0.595, 0.720, 0.845, 1.0]
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (p <= thresholds[i + 1]) {
      return i + (p - thresholds[i]) / (thresholds[i + 1] - thresholds[i])
    }
  }
  return 8
}

// 게임 로직용 이산 위상 (언락 조건 등)
function getMoonPhase(x) {
  const w = window.innerWidth
  const p = x / w
  if (p < 0.095) return 0
  if (p < 0.220) return 1
  if (p < 0.345) return 2
  if (p < 0.470) return 3
  if (p < 0.595) return 4
  if (p < 0.720) return 5
  if (p < 0.845) return 6
  return 7
}

export default function MoonWindow({ obj }) {
  const INITIAL_POS = { x: Math.floor(window.innerWidth * 3 / 8), y: 150 }
  const [pos, setPos] = useState(INITIAL_POS)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  const closeWindow = useGameStore((s) => s.closeWindow)
  const focusWindow = useGameStore((s) => s.focusWindow)
  const zIndex = useGameStore((s) => s.openWindows.indexOf(obj.objId))
  const moonFileUnlocked = useGameStore((s) => s.moonFileUnlocked)
  const unlockMoonFile = useGameStore((s) => s.unlockMoonFile)
  const setMonitoringX = useGameStore((s) => s.setMonitoringX)

  const phase = getMoonPhase(pos.x)       // 게임 로직용 이산값
  const phaseT = getMoonPhaseT(pos.x)     // 렌더링용 연속값
  const timerRef = useRef(null)

  useEffect(() => {
    setMonitoringX(pos.x)
  }, [pos.x])

  useEffect(() => {
    if (phase === 5 && !moonFileUnlocked) {
      timerRef.current = setTimeout(() => unlockMoonFile(), 1500)
    } else {
      clearTimeout(timerRef.current)
    }
    return () => clearTimeout(timerRef.current)
  }, [phase, moonFileUnlocked])

  const onMouseDown = useCallback((e) => {
    if (!e.target.closest('.window-titlebar')) return
    offset.current.x = e.clientX - pos.x
    offset.current.y = e.clientY - pos.y
    dragging.current = true

    const onMove = (ev) => {
      if (!dragging.current) return
      setPos({ x: ev.clientX - offset.current.x, y: ev.clientY - offset.current.y })
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [pos])

  return (
    <div
      className="window-frame"
      style={{ left: pos.x, top: pos.y, zIndex, minWidth: 140 }}
      onMouseDown={(e) => { focusWindow(obj.objId); onMouseDown(e) }}
    >
      <div className="window-titlebar">
        <span className="title-text">Monitoring</span>
        <button className="window-close-btn" onClick={() => closeWindow(obj.objId)}>x</button>
      </div>
      <div className="window-content" style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '16px 20px', background: '#0a0202', gap: 8,
      }}>
        <MoonSVG phaseT={phaseT} />
      </div>
    </div>
  )
}
