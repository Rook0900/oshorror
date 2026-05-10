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
  const size = 72
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

// 초승달→상현→상현망간→보름→하현망간→하현→그믐→삭
// 초승달(얇은 초승), 상현(반달), 상현망간(볼록), 보름, 하현망간(볼록), 하현(반달), 그믐(얇은 초승), 삭
const FINAL_PHASE_SEQUENCE = [0.5, 2, 3.5, 4, 4.5, 6, 7.5, 0.01]

export default function MoonWindow({ obj }) {
  const INITIAL_POS = { x: Math.floor(window.innerWidth * 3 / 8), y: 150 }
  const [pos, setPos] = useState(INITIAL_POS)
  const [autoPhaseT, setAutoPhaseT] = useState(null)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  const closeWindow = useGameStore((s) => s.closeWindow)
  const focusWindow = useGameStore((s) => s.focusWindow)
  const setWindowRect = useGameStore((s) => s.setWindowRect)
  const zIndex = useGameStore((s) => 200 + s.openWindows.indexOf(obj.objId))
  const moonFileUnlocked = useGameStore((s) => s.moonFileUnlocked)
  const unlockMoonFile = useGameStore((s) => s.unlockMoonFile)
  const setMonitoringX = useGameStore((s) => s.setMonitoringX)
  const finalSequenceActive = useGameStore((s) => s.finalSequenceActive)
  const finalDisplayActive = useGameStore((s) => s.finalDisplayActive)
  const activateFinalDisplay = useGameStore((s) => s.activateFinalDisplay)
  const nextStage = useGameStore((s) => s.nextStage)
  const divRef = useRef(null)

  const phase = getMoonPhase(pos.x)       // 게임 로직용 이산값
  const phaseT = getMoonPhaseT(pos.x)     // 렌더링용 연속값
  const timerRef = useRef(null)

  useEffect(() => {
    setMonitoringX(pos.x)
  }, [pos.x])

  useEffect(() => {
    if (!divRef.current) return
    const { width, height } = divRef.current.getBoundingClientRect()
    setWindowRect('MOON_WINDOW', { x: pos.x, y: pos.y, w: width, h: height })
  }, [pos])

  useEffect(() => {
    return () => setWindowRect('MOON_WINDOW', null)
  }, [])

  useEffect(() => {
    if (phase === 5 && !moonFileUnlocked) {
      timerRef.current = setTimeout(() => unlockMoonFile(), 1500)
    } else {
      clearTimeout(timerRef.current)
    }
    return () => clearTimeout(timerRef.current)
  }, [phase, moonFileUnlocked])

  useEffect(() => {
    if (!finalSequenceActive) return

    const timeouts = []
    const t5 = setTimeout(() => {  // 5초(커서 고정) + 5초 = 10초 후 검은 화면
      activateFinalDisplay()
      let step = 0
      const runStep = () => {
        if (step >= FINAL_PHASE_SEQUENCE.length) {
          const t = setTimeout(() => {
            document.body.style.cursor = ''
            document.body.style.pointerEvents = ''
            nextStage()
          }, 800)
          timeouts.push(t)
          return
        }
        setAutoPhaseT(FINAL_PHASE_SEQUENCE[step])
        step++
        const delay = 1000 + Math.random() * 700
        const t = setTimeout(runStep, delay)
        timeouts.push(t)
      }
      runStep()
    }, 10000)
    timeouts.push(t5)

    return () => timeouts.forEach(clearTimeout)
  }, [finalSequenceActive])

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
      ref={divRef}
      className="window-frame"
      style={{ left: pos.x, top: pos.y, zIndex: finalDisplayActive ? 960 : zIndex, minWidth: 140 }}
      onMouseDownCapture={() => focusWindow(obj.objId)}
      onMouseDown={onMouseDown}
    >
      <div className="window-titlebar">
        <span className="title-text">Monitoring</span>
        <button className="window-close-btn" onClick={() => closeWindow(obj.objId)}>x</button>
      </div>
      <div className="window-content" style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '10px 14px', background: '#0a0202', gap: 6,
      }}>
        <MoonSVG phaseT={autoPhaseT !== null ? autoPhaseT : phaseT} />
      </div>
    </div>
  )
}
