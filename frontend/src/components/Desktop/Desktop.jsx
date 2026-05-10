import { useState, useEffect, useRef } from 'react'
import DesktopIcon from './DesktopIcon'
import WindowFrame from '../Window/WindowFrame'
import NoteWindow from '../Window/NoteWindow'
import PuzzleWindow from '../Window/PuzzleWindow'
import WirePuzzleWindow from '../Window/WirePuzzleWindow'
import CircuitPuzzleWindow from '../Window/CircuitPuzzleWindow'
import ProgramWindow from '../Window/ProgramWindow'
import MoonWindow from '../Window/MoonWindow'
import PhotoWindow from '../Window/PhotoWindow'
import StarsWindow from '../Window/StarsWindow'
import NoticeWindow from '../Window/NoticeWindow'
import Le5grWindow from '../Window/Le5grWindow'
import BinaryConverterWindow from '../Window/BinaryConverterWindow'
import Stage3IntroDialog from '../Window/Stage3IntroDialog'
import ClockCanvas from './ClockCanvas'
import { useGameStore } from '../../store/gameStore'
import { useStage } from '../../hooks/useStage'

function StaticOverlay() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf

    const w = canvas.width
    const h = canvas.height
    const total = w * h
    const SPREAD_MS = 1800  // 전체 화면 덮는 데 걸리는 시간

    // 여러 감염 시작점 — 랜덤 위치에서 동시에 퍼짐
    const seeds = Array.from({ length: 7 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
    }))

    // 각 픽셀의 "감염 시작 시간" 사전 계산 (0~1)
    const revealAt = new Float32Array(total)
    let maxVal = 0
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let minDist = Infinity
        for (const s of seeds) {
          // 가로 방향을 조금 더 빠르게 → 스캔라인 해킹 느낌
          const dx = (x - s.x) / w * 0.65
          const dy = (y - s.y) / h
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < minDist) minDist = d
        }
        // 노이즈를 섞어 경계선을 불규칙하게
        const val = minDist + Math.random() * 0.18
        revealAt[y * w + x] = val
        if (val > maxVal) maxVal = val
      }
    }
    for (let i = 0; i < total; i++) revealAt[i] /= maxVal

    const startTime = performance.now()

    function draw() {
      const progress = Math.min(1, (performance.now() - startTime) / SPREAD_MS)
      const imageData = ctx.createImageData(w, h)
      const buf = imageData.data

      for (let i = 0; i < total; i++) {
        if (revealAt[i] <= progress) {
          const v = (Math.random() * 255) | 0
          const idx = i << 2
          buf[idx] = v; buf[idx + 1] = v; buf[idx + 2] = v
          buf[idx + 3] = ((Math.random() * 180) + 60) | 0
        }
      }

      ctx.putImageData(imageData, 0, 0)
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={Math.ceil(window.innerWidth / 3)}
      height={Math.ceil(window.innerHeight / 3)}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        width: '100%', height: '100%',
        pointerEvents: 'all',
        imageRendering: 'pixelated',
        animation: 'staticGlitch 0.07s steps(1) infinite',
      }}
    />
  )
}

// 스테이지별 오브젝트 배치 (서버 데이터 대체용 fallback)
const STAGE_FALLBACK = {
  1: {
    objects: [
      { objId: 'NOTE_01', objType: 'NOTE', posX: 80, posY: 80, label: '안내문.txt', spriteKey: 'note' },
      { objId: 'PROG_01', objType: 'PROGRAM', posX: 80, posY: 200, label: 'centralkeeper', spriteKey: 'folder' },
      { objId: 'FILE_01', objType: 'FILE', posX: 80, posY: 320, label: 'interactive', spriteKey: 'folder' },
      { objId: 'PROG_02', objType: 'PROGRAM', posX: 220, posY: 200, label: '중앙관리장치.exe', spriteKey: 'prog' },
    ],
    bgColor: '#05050f',
  },
  2: {
    objects: [
      { objId: 'NOTE_01', objType: 'NOTE', posX: 80, posY: 80, label: '기록.txt', spriteKey: 'note' },
      { objId: 'FILE_01', objType: 'FILE', posX: 80, posY: 200, label: '사진', spriteKey: 'image_icon' },
      { objId: 'PROG_01', objType: 'PROGRAM', posX: 80, posY: 320, label: 'Monitoring', spriteKey: 'observe' },
    ],
    bgColor: '#0f0505',
  },
  3: {
    objects: [
      { objId: 'NOTE_01', objType: 'NOTE', posX: 80, posY: 80, label: '노트.txt', spriteKey: 'note' },
      { objId: 'FILE_01', objType: 'FILE', posX: 80, posY: 200, label: 'binary_hint', spriteKey: 'image_icon' },
      { objId: 'BINARY_01', objType: 'FILE', posX: 220, posY: 80, label: '이진수 변환기', spriteKey: 'prog' },
      { objId: 'PROG_01', objType: 'PROGRAM', posX: 80, posY: 320, label: 'switch', spriteKey: 'prog' },
      { objId: 'PROG_02', objType: 'PROGRAM', posX: 220, posY: 320, label: 'toggle', spriteKey: 'prog' },
    ],
    bgColor: '#02020a',
  },
}

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="taskbar-clock">
      {time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
    </div>
  )
}

export default function Desktop({ stageId }) {
  const { stageData, loading } = useStage(stageId)
  const openWindows = useGameStore((s) => s.openWindows)
  const openWindow = useGameStore((s) => s.openWindow)
  const prog02Activated = useGameStore((s) => s.prog02Activated)
  const moonFileUnlocked = useGameStore((s) => s.moonFileUnlocked)
  const noticeUnlocked = useGameStore((s) => s.noticeUnlocked)
  const le5grUnlocked = useGameStore((s) => s.le5grUnlocked)
  const centralSolved = useGameStore((s) => s.centralSolved)
  const finalSequenceActive = useGameStore((s) => s.finalSequenceActive)
  const finalDisplayActive = useGameStore((s) => s.finalDisplayActive)
  const triggerFinalSequence = useGameStore((s) => s.triggerFinalSequence)
  const stage3IntroDismissed = useGameStore((s) => s.stage3IntroDismissed)
  const switchOn = useGameStore((s) => s.switchOn)
  const setSwitchOn = useGameStore((s) => s.setSwitchOn)
  const switchUnlocked = useGameStore((s) => s.switchUnlocked)
  const unlockSwitch = useGameStore((s) => s.unlockSwitch)
  const endGame = useGameStore((s) => s.endGame)
  const [clockStopped, setClockStopped] = useState(!switchOn)
  const [staticActive, setStaticActive] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'clock-toggle') {
        setSwitchOn(e.data.on)
        setClockStopped(!e.data.on)
      }
      if (e.data?.type === 'switch-unlock') {
        unlockSwitch()
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])
  useEffect(() => {
    if (stageId !== 3 || !switchUnlocked || switchOn) return
    setStaticActive(true)
    const t = setTimeout(() => {
      setStaticActive(false)
      endGame()
    }, 2500)
    return () => clearTimeout(t)
  }, [switchOn, switchUnlocked, stageId])

  const [selectedIcon, setSelectedIcon] = useState(null)

  const stage = stageData || STAGE_FALLBACK[stageId]
  let rawObjects = STAGE_FALLBACK[stageId]?.objects || stage?.objects || []
  if (stageId === 2 && moonFileUnlocked) {
    rawObjects = [...rawObjects, { objId: 'FILE_02', objType: 'FILE', posX: 200, posY: 80, label: 'stars', spriteKey: 'file' }]
  }
  if (stageId === 2 && noticeUnlocked) {
    rawObjects = [...rawObjects, { objId: 'NOTICE_01', objType: 'FILE', posX: 200, posY: 200, label: 'notice', spriteKey: 'file' }]
  }
  if (stageId === 2 && le5grUnlocked) {
    rawObjects = [...rawObjects, { objId: 'LE5GR_01', objType: 'FILE', posX: 320, posY: 80, label: 'Le5gr', spriteKey: 'file' }]
  }
  const objects = rawObjects.map(obj => {
    if (obj.objId === 'NOTE_01' && prog02Activated) {
      return { ...obj, label: stageId === 2 ? '안내문' : 'execution' }
    }
    if (obj.objId === 'PROG_02' && stageId === 1 && centralSolved) {
      return { ...obj, label: 'immediately' }
    }
    return obj
  })
  const bgColor = stage?.bgColor || '#0d0d1a'

  // 스테이지 1 진입 시 PROG_01 창 자동 오픈
  useEffect(() => {
    if (stageId === 1) openWindow('PROG_01')
  }, [stageId])

  useEffect(() => {
    if (stageId !== 2 || finalSequenceActive) return
    if (openWindows.includes('LE5GR_PHOTO') && openWindows.includes('PROG_01')) {
      triggerFinalSequence()
    }
  }, [openWindows, stageId, finalSequenceActive])

  // 두 창 동시 열릴 때(finalSequenceActive) 5초 뒤 커서 고정
  const mousePos = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e) => { mousePos.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    if (!finalSequenceActive) return
    const timer = setTimeout(() => {
      document.documentElement.style.cursor = 'none'
      document.body.style.pointerEvents = 'none'
    }, 5000)
    return () => clearTimeout(timer)
  }, [finalSequenceActive])

  // 다음 스테이지 전환 시 커서 복원
  useEffect(() => {
    return () => {
      document.documentElement.style.cursor = ''
      document.body.style.pointerEvents = ''
    }
  }, [stageId])

  const handleIconSingleClick = (objId) => setSelectedIcon(objId)
  const handleIconDoubleClick = (objId) => {
    setSelectedIcon(objId)
    if (stageId === 3 && objId === 'PROG_01' && !switchUnlocked) return
    openWindow(objId)
  }

  if (loading) {
    return (
      <div className="desktop" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="pixel-font" style={{ color: '#444' }}>LOADING...</span>
      </div>
    )
  }

  return (
    <>
      {staticActive && <StaticOverlay />}

{/* 검은 오버레이 (달 변환 시작 후) */}
      {finalDisplayActive && (
        <div style={{
          position: 'fixed', inset: 0, background: '#000', zIndex: 950, pointerEvents: 'none',
          animation: 'fadeBlackout 2s forwards',
        }} />
      )}

      {stageId === 3 && <ClockCanvas running={!clockStopped} />}

      <div className="desktop" style={{ background: stageId === 3 ? 'transparent' : bgColor }}>
        {objects.map((obj) => (
          <DesktopIcon
            key={obj.objId}
            obj={obj}
            stageId={stageId}
            selected={selectedIcon === obj.objId}
            onSingleClick={handleIconSingleClick}
            onDoubleClick={handleIconDoubleClick}
          />
        ))}
      </div>

      {/* 열린 창들 렌더링 */}
      {openWindows.map((winId) => {
        const obj = objects.find((o) => o.objId === winId)
        if (!obj) return null
        if (obj.objType === 'NOTE')
          return <NoteWindow key={winId} obj={obj} stageId={stageId} />
        if (obj.objType === 'FILE') {
          if (stageId === 1 && obj.objId === 'FILE_01')
            return <CircuitPuzzleWindow key={winId} obj={obj} stageId={stageId} />
          if (stageId === 2 && obj.objId === 'FILE_01')
            return <PhotoWindow key={winId} obj={obj} />
          if (stageId === 2 && obj.objId === 'FILE_02')
            return <StarsWindow key={winId} obj={obj} />
          if (stageId === 2 && obj.objId === 'NOTICE_01')
            return <NoticeWindow key={winId} obj={obj} />
          if (stageId === 2 && obj.objId === 'LE5GR_01')
            return <Le5grWindow key={winId} obj={obj} />
          if (stageId === 3 && obj.objId === 'FILE_01')
            return (
              <WindowFrame key={winId} title={`— ${obj.label}`} windowId={obj.objId} initialPos={{ x: 280, y: 140 }}>
                <div style={{ padding: 8, background: '#06060f', width: 180 }}>
                  <img src="/hint_clock.svg" alt="binary hint" style={{ display: 'block', width: '100%' }} />
                </div>
              </WindowFrame>
            )
          if (stageId === 3 && obj.objId === 'BINARY_01')
            return <BinaryConverterWindow key={winId} obj={obj} />
          return <PuzzleWindow key={winId} obj={obj} stageId={stageId} />
        }
        if (obj.objType === 'PROGRAM') {
          if (stageId === 2 && obj.objId === 'PROG_01')
            return <MoonWindow key={winId} obj={obj} />
          if (stageId === 3 && obj.objId === 'PROG_01')
            return (
              <WindowFrame key={winId} title="switch" windowId={obj.objId} initialPos={{ x: 300, y: 180 }}>
                {switchUnlocked ? (
                  <iframe
                    src="/toggle_interactive.html"
                    style={{ display: 'block', width: 200, height: 140, border: 'none' }}
                    onLoad={(e) => {
                      e.target.contentWindow.postMessage({ type: 'init-switch', on: switchOn }, '*')
                    }}
                  />
                ) : (
                  <div style={{
                    width: 200, height: 140, background: '#06060f',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
                    fontSize: 11, color: '#334455', textAlign: 'center', lineHeight: 2,
                  }}>
                    접근 잠금<br />
                    <span style={{ fontSize: 9, color: '#223' }}>올바른 시간을 입력하시오</span>
                  </div>
                )}
              </WindowFrame>
            )
          if (stageId === 3 && obj.objId === 'PROG_02')
            return (
              <WindowFrame key={winId} title="toggle" windowId={obj.objId} initialPos={{ x: 460, y: 180 }}>
                <iframe
                  src="/time_updown.html"
                  style={{ display: 'block', width: 260, height: 180, border: 'none' }}
                  onLoad={(e) => {
                    if (switchUnlocked)
                      e.target.contentWindow.postMessage({ type: 'lock-time', h: 5, mt: 0, mo: 0 }, '*')
                  }}
                />
              </WindowFrame>
            )
          return <ProgramWindow key={winId} obj={obj} stageId={stageId} />
        }
        return null
      })}

      {stageId === 3 && <Stage3IntroDialog />}

    </>
  )
}
