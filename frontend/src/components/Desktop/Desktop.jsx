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
import { useGameStore } from '../../store/gameStore'
import { useStage } from '../../hooks/useStage'

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
      { objId: 'FILE_01', objType: 'FILE', posX: 80, posY: 200, label: '전기 회로', spriteKey: 'file' },
      { objId: 'PROG_01', objType: 'PROGRAM', posX: 80, posY: 320, label: 'centralkeeper', spriteKey: 'prog' },
      { objId: 'PROG_02', objType: 'PROGRAM', posX: 220, posY: 320, label: '중앙관리장치.exe', spriteKey: 'prog' },
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

  // 스테이지 1·3 진입 시 PROG_01 창 자동 오픈 (2는 자동 오픈 안함)
  useEffect(() => {
    if (stageId === 1 || stageId === 3) openWindow('PROG_01')
  }, [stageId])

  useEffect(() => {
    if (stageId !== 2 || finalSequenceActive) return
    if (openWindows.includes('LE5GR_PHOTO') && openWindows.includes('PROG_01')) {
      triggerFinalSequence()
    }
  }, [openWindows, stageId, finalSequenceActive])

  // 두 창 동시 열릴 때(finalSequenceActive) 3초 뒤 커서 고정
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
    }, 3000)
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
{/* 검은 오버레이 (달 변환 시작 후) */}
      {finalDisplayActive && (
        <div style={{
          position: 'fixed', inset: 0, background: '#000', zIndex: 950, pointerEvents: 'none',
        }} />
      )}

      <div className="desktop" style={{ backgroundColor: bgColor }}>
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
            return <WirePuzzleWindow key={winId} obj={obj} stageId={stageId} />
          return <PuzzleWindow key={winId} obj={obj} stageId={stageId} />
        }
        if (obj.objType === 'PROGRAM') {
          if (stageId === 2 && obj.objId === 'PROG_01')
            return <MoonWindow key={winId} obj={obj} />
          return <ProgramWindow key={winId} obj={obj} stageId={stageId} />
        }
        return null
      })}

      <div className="taskbar">
        <span className="pixel-font" style={{ color: '#666', fontSize: '6px' }}>
          STAGE {stageId}
        </span>
        <Clock />
      </div>
    </>
  )
}
