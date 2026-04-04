import { useState, useCallback, useRef, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'

// 8 phases: index 0(left) → 7(right)
// 0: 초승달, 1: 상현달, 2: 상현망간의 달, 3: 보름달,
// 4: 하현망간의 달, 5: 하현달, 6: 그믐달, 7: 삭
const PHASE_NAMES = [
  '초승달',
  '상현달',
  '상현망간의 달',
  '보름달',
  '하현망간의 달',
  '하현달',
  '그믐달',
  '삭',
]

// SVG moon for each phase index
// lit side: right for waxing (0-2), full for 3, left for waning (4-6), dark for 7
function MoonSVG({ phase }) {
  const size = 80
  const r = 36
  const cx = size / 2
  const cy = size / 2

  // phase 3 = full moon, phase 7 = new moon
  // 0=초승달(waxing crescent), 1=상현달(first quarter), 2=상현망간(waxing gibbous)
  // 4=하현망간(waning gibbous), 5=하현달(last quarter), 6=그믐달(waning crescent)

  const moonColor = '#e8e0c0'
  const darkColor = '#0a0a14'

  if (phase === 7) {
    // 삭: 거의 안보이는 원
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="#111118" stroke="#2a2a3a" strokeWidth="1" />
      </svg>
    )
  }

  if (phase === 3) {
    // 보름달
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill={moonColor} />
        <circle cx={cx - 10} cy={cy - 8} r={5} fill="#d0c8a8" opacity="0.4" />
        <circle cx={cx + 8} cy={cy + 10} r={4} fill="#d0c8a8" opacity="0.3" />
        <circle cx={cx + 14} cy={cy - 14} r={3} fill="#d0c8a8" opacity="0.35" />
      </svg>
    )
  }

  // For other phases, use clipPath with two circles technique
  // The lit portion is determined by phase
  const getPath = () => {
    if (phase === 1) {
      // 상현달: right half lit
      return (
        <svg width={size} height={size}>
          <defs>
            <clipPath id="moon-clip">
              <circle cx={cx} cy={cy} r={r} />
            </clipPath>
          </defs>
          <circle cx={cx} cy={cy} r={r} fill={darkColor} />
          <rect x={cx} y={cy - r} width={r} height={r * 2} fill={moonColor} clipPath="url(#moon-clip)" />
        </svg>
      )
    }
    if (phase === 5) {
      // 하현달: left half lit
      return (
        <svg width={size} height={size}>
          <defs>
            <clipPath id="moon-clip">
              <circle cx={cx} cy={cy} r={r} />
            </clipPath>
          </defs>
          <circle cx={cx} cy={cy} r={r} fill={darkColor} />
          <rect x={cx - r} y={cy - r} width={r} height={r * 2} fill={moonColor} clipPath="url(#moon-clip)" />
        </svg>
      )
    }
    if (phase === 0) {
      // 초승달: thin right crescent
      return (
        <svg width={size} height={size}>
          <defs>
            <clipPath id="moon-clip">
              <circle cx={cx} cy={cy} r={r} />
            </clipPath>
          </defs>
          <circle cx={cx} cy={cy} r={r} fill={darkColor} />
          <circle cx={cx + 20} cy={cy} r={r} fill={moonColor} clipPath="url(#moon-clip)" />
        </svg>
      )
    }
    if (phase === 6) {
      // 그믐달: thin left crescent
      return (
        <svg width={size} height={size}>
          <defs>
            <clipPath id="moon-clip">
              <circle cx={cx} cy={cy} r={r} />
            </clipPath>
          </defs>
          <circle cx={cx} cy={cy} r={r} fill={darkColor} />
          <circle cx={cx - 20} cy={cy} r={r} fill={moonColor} clipPath="url(#moon-clip)" />
        </svg>
      )
    }
    if (phase === 2) {
      // 상현망간의 달: mostly right lit, small dark on right
      return (
        <svg width={size} height={size}>
          <defs>
            <clipPath id="moon-clip">
              <circle cx={cx} cy={cy} r={r} />
            </clipPath>
          </defs>
          <circle cx={cx} cy={cy} r={r} fill={moonColor} />
          <circle cx={cx - 20} cy={cy} r={r} fill={darkColor} clipPath="url(#moon-clip)" />
        </svg>
      )
    }
    if (phase === 4) {
      // 하현망간의 달: mostly left lit, small dark on left
      return (
        <svg width={size} height={size}>
          <defs>
            <clipPath id="moon-clip">
              <circle cx={cx} cy={cy} r={r} />
            </clipPath>
          </defs>
          <circle cx={cx} cy={cy} r={r} fill={moonColor} />
          <circle cx={cx + 20} cy={cy} r={r} fill={darkColor} clipPath="url(#moon-clip)" />
        </svg>
      )
    }
    return null
  }

  return getPath()
}

function getMoonPhase(x) {
  const w = window.innerWidth
  const zone = Math.floor((x / w) * 8)
  return Math.max(0, Math.min(7, zone))
}

export default function MoonWindow({ obj }) {
  const INITIAL_POS = { x: Math.floor(window.innerWidth * 3 / 8), y: 150 }
  const [pos, setPos] = useState(INITIAL_POS)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  const closeWindow = useGameStore((s) => s.closeWindow)
  const focusWindow = useGameStore((s) => s.focusWindow)
  const zIndex = useGameStore((s) => s.openWindows.indexOf(obj.objId))

  const phase = getMoonPhase(pos.x)

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
        padding: '16px 20px', background: '#020210', gap: 8,
      }}>
        <MoonSVG phase={phase} />
        <span style={{
          fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
          fontSize: '9px', color: '#6666aa', marginTop: 4,
          letterSpacing: '0.05em',
        }}>
          {PHASE_NAMES[phase]}
        </span>
      </div>
    </div>
  )
}
