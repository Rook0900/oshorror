import { useState, useCallback, useRef, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'

// 8 phases: index 0(left) → 7(right)
// 0: 삭, 1: 초승달, 2: 상현달, 3: 상현망간의 달,
// 4: 보름달, 5: 하현망간의 달, 6: 하현달, 7: 그믐달
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

// SVG moon for each phase index
// lit side: right for waxing (0-2), full for 3, left for waning (4-6), dark for 7
function MoonSVG({ phase }) {
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

  // 달 이미지를 베이스로 깔고, 어두운 그림자를 위에 올리는 방식
  const moonBase = (
    <image
      href="/moon.jpg"
      x="0" y="0" width={size} height={size}
      clipPath="url(#moon-clip)"
      preserveAspectRatio="xMidYMid slice"
    />
  )
  const darkOverlay = <circle cx={cx} cy={cy} r={r} fill="black" opacity="0.2" clipPath="url(#moon-clip)" />

  if (phase === 0) {
    // 삭: 거의 안보이는 원
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="#111118" stroke="#2a2a3a" strokeWidth="1" />
      </svg>
    )
  }

  if (phase === 4) {
    // 보름달: 전체 이미지
    return (
      <svg width={size} height={size}>
        {moonDefs}
        {moonBase}
        {darkOverlay}
      </svg>
    )
  }

  if (phase === 1) {
    // 초승달: 오른쪽 초승달 — 왼쪽을 그림자로 덮음
    return (
      <svg width={size} height={size}>
        {moonDefs}
        {moonBase}
        <circle cx={cx - 20} cy={cy} r={r} fill={darkColor} clipPath="url(#moon-clip)" />
        {darkOverlay}
      </svg>
    )
  }

  if (phase === 2) {
    // 상현달: 오른쪽 반 — 왼쪽 절반 그림자
    return (
      <svg width={size} height={size}>
        {moonDefs}
        {moonBase}
        <rect x={cx - r} y={cy - r} width={r} height={r * 2} fill={darkColor} clipPath="url(#moon-clip)" />
        {darkOverlay}
      </svg>
    )
  }

  if (phase === 3) {
    // 상현망간의 달: 오른쪽 밝음, 왼쪽에 그림자 초승달
    // 왼쪽 moon 호 → 타원 terminator 호로 닫는 경로
    const a3 = 18 // 타원 가로 반축 (작을수록 그림자 넓어짐)
    return (
      <svg width={size} height={size}>
        {moonDefs}
        {moonBase}
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${a3} ${r} 0 0 1 ${cx} ${cy - r} Z`}
          fill={darkColor}
        />
        {darkOverlay}
      </svg>
    )
  }

  if (phase === 5) {
    // 하현망간의 달: 왼쪽 밝음, 오른쪽에 그림자 초승달
    const a5 = 18
    return (
      <svg width={size} height={size}>
        {moonDefs}
        {moonBase}
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${a5} ${r} 0 0 0 ${cx} ${cy - r} Z`}
          fill={darkColor}
        />
        {darkOverlay}
      </svg>
    )
  }

  if (phase === 6) {
    // 하현달: 왼쪽 반 — 오른쪽 절반 그림자
    return (
      <svg width={size} height={size}>
        {moonDefs}
        {moonBase}
        <rect x={cx} y={cy - r} width={r} height={r * 2} fill={darkColor} clipPath="url(#moon-clip)" />
        {darkOverlay}
      </svg>
    )
  }

  if (phase === 7) {
    // 그믐달: 왼쪽 초승달 — 오른쪽을 그림자로 덮음
    return (
      <svg width={size} height={size}>
        {moonDefs}
        {moonBase}
        <circle cx={cx + 20} cy={cy} r={r} fill={darkColor} clipPath="url(#moon-clip)" />
        {darkOverlay}
      </svg>
    )
  }

  return null
}

function getMoonPhase(x) {
  const w = window.innerWidth
  const p = x / w
  if (p < 0.095) return 0  // 삭:     9.5%
  if (p < 0.220) return 1  // 초승달: 12.5%
  if (p < 0.345) return 2  // 상현달: 12.5%
  if (p < 0.470) return 3  // 상현망간: 12.5%
  if (p < 0.595) return 4  // 보름달: 12.5%
  if (p < 0.720) return 5  // 하현망간: 12.5%
  if (p < 0.845) return 6  // 하현달: 12.5%
  return 7                  // 그믐달: 15.5%
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

  const phase = getMoonPhase(pos.x)
  const timerRef = useRef(null)

  useEffect(() => {
    if (phase === 5 && !moonFileUnlocked) {
      timerRef.current = setTimeout(() => unlockMoonFile(), 2000)
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
        <MoonSVG phase={phase} />
      </div>
    </div>
  )
}
