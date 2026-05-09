import { useEffect, useRef } from 'react'

const CX = 130, CY = 130

const TICKS = [
  [130,10,130,26],[194,26,186,40],[240,74,228,82],
  [252,130,236,130],[240,186,228,178],[194,234,186,220],
  [130,250,130,234],[66,234,74,220],[20,186,32,178],
  [8,130,24,130],[20,74,32,82],[66,26,74,40],
]

function drawClock(ctx, hA, mA, sA) {
  ctx.clearRect(0, 0, 260, 260)

  // 시계판
  ctx.beginPath(); ctx.arc(CX, CY, 128, 0, Math.PI*2)
  ctx.fillStyle = '#0f0f0f'; ctx.fill()
  ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 2; ctx.stroke()

  ctx.beginPath(); ctx.arc(CX, CY, 122, 0, Math.PI*2)
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1; ctx.stroke()

  // 눈금
  ctx.strokeStyle = '#555'; ctx.lineWidth = 3
  TICKS.forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  })

  // 중심 점 (하단)
  ctx.beginPath(); ctx.arc(CX, CY, 5, 0, Math.PI*2)
  ctx.fillStyle = '#444'; ctx.fill()

  // 시침·분침·초침
  const hand = (angle, len, width, color) => {
    ctx.save(); ctx.translate(CX, CY); ctx.rotate(angle)
    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -len)
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.stroke()
    ctx.restore()
  }
  hand(hA, 70, 4, '#aaaaaa')
  hand(mA, 95, 2.5, '#cccccc')
  hand(sA, 105, 1, '#777777')

  // 중심 점 (상단)
  ctx.beginPath(); ctx.arc(CX, CY, 4, 0, Math.PI*2)
  ctx.fillStyle = '#888'; ctx.fill()
}

function getNow() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - 1)
  const ms  = now.getMilliseconds()
  const s   = ((now.getSeconds() * 1000 + ms - 500) / 1000 + 60) % 60
  const m   = now.getMinutes()
  const h   = now.getHours() % 12
  return {
    h: ((h + m / 60) / 12) * Math.PI * 2,
    m: ((m + s / 60) / 60) * Math.PI * 2,
    s: (s / 60) * Math.PI * 2,
  }
}

function angleDiff(a, b) {
  const d = Math.abs(a - b) % (Math.PI * 2)
  return d > Math.PI ? Math.PI * 2 - d : d
}

export default function ClockCanvas({ running }) {
  const canvasRef   = useRef(null)
  const animIdRef   = useRef(null)
  const runningRef  = useRef(running)
  const frozenRef   = useRef({ h: 0, m: 0, s: 0 })
  const dragging    = useRef(null)

  // 애니메이션 루프
  const tick = useRef(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const f = getNow()
    frozenRef.current = f
    drawClock(canvas.getContext('2d'), f.h, f.m, f.s)
    if (runningRef.current) animIdRef.current = requestAnimationFrame(tick.current)
  })

  useEffect(() => {
    runningRef.current = running
    if (running) {
      animIdRef.current = requestAnimationFrame(tick.current)
    } else {
      cancelAnimationFrame(animIdRef.current)
      const canvas = canvasRef.current
      if (canvas) {
        const { h, m, s } = frozenRef.current
        drawClock(canvas.getContext('2d'), h, m, s)
      }
    }
    return () => cancelAnimationFrame(animIdRef.current)
  }, [running])

  // 마우스 이벤트
  function getAngle(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (260 / rect.width) - CX
    const y = (e.clientY - rect.top)  * (260 / rect.height) - CY
    return Math.atan2(x, -y)
  }

  function onMouseDown(e) {
    if (running) return
    const angle = getAngle(e)
    const { h, m } = frozenRef.current
    dragging.current = angleDiff(angle, h) < angleDiff(angle, m) ? 'hour' : 'minute'
  }

  function onMouseMove(e) {
    if (running || !dragging.current) return
    const angle = (getAngle(e) + Math.PI * 2) % (Math.PI * 2)
    const f = frozenRef.current
    frozenRef.current = dragging.current === 'hour'
      ? { ...f, h: angle }
      : { ...f, m: angle }
    const { h, m, s } = frozenRef.current
    drawClock(canvasRef.current.getContext('2d'), h, m, s)
  }

  function onMouseUp() { dragging.current = null }

  return (
    <canvas
      ref={canvasRef}
      width={260}
      height={260}
      style={{
        position: 'fixed',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
        pointerEvents: running ? 'none' : 'auto',
        cursor: running ? 'default' : 'grab',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  )
}
