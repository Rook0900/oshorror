import { useState, useRef, useCallback, useEffect } from 'react'
import WindowFrame from './WindowFrame'
import { useGameStore } from '../../store/gameStore'

const CONSTELLATION_SVGS = [
  '/constellations/constellation_3_03.svg',
  '/constellations/constellation_3_06.svg',
  '/constellations/constellation_3_09.svg',
  '/constellations/constellation_3_12.svg',
  '/constellations/constellation_3_15.svg',
  '/constellations/constellation_3_18.svg',
  '/constellations/constellation_3_21.svg',
  '/constellations/constellation_3_24.svg',
  '/constellations/constellation_3_27.svg',
  '/constellations/constellation_3_30.svg',
]

// 시퀀스: 27 → 9 → 12 (파일명 기준 인덱스)
const SEQUENCE = [8, 2, 3] // _27=8, _09=2, _12=3

function getConstellationIndex(x) {
  if (x === null) return 0
  const ratio = Math.max(0, Math.min(1, x / window.innerWidth))
  return Math.min(9, Math.floor(ratio * 10))
}

const NoteSprite = () => (
  <img src="/document_icon.svg" width={40} height={40} style={{ imageRendering: 'pixelated' }} />
)

let subZCounter = 400

// 드래그 가능한 서브 창
function SubWindow({ title, onClose, initialPos, children }) {
  const [pos, setPos] = useState(initialPos)
  const [zIndex, setZIndex] = useState(() => ++subZCounter)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  const bringToFront = useCallback(() => {
    setZIndex(++subZCounter)
  }, [])

  const onMouseDown = useCallback((e) => {
    bringToFront()
    if (!e.target.closest('.sw-titlebar')) return
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
      style={{ left: pos.x, top: pos.y, zIndex, minWidth: 180 }}
      onMouseDown={onMouseDown}
    >
      <div className="window-titlebar sw-titlebar">
        <span className="title-text">{title}</span>
        <button className="window-close-btn" onClick={onClose}>x</button>
      </div>
      <div className="window-content">
        {children}
      </div>
    </div>
  )
}

// 폴더 내 아이콘
function FolderIcon({ sprite, label, onDoubleClick }) {
  const lastClick = useRef(0)
  const handleClick = () => {
    const now = Date.now()
    if (now - lastClick.current < 400) onDoubleClick()
    lastClick.current = now
  }
  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 72, cursor: 'pointer', padding: '8px 4px',
        border: '1px solid transparent', borderRadius: 3, userSelect: 'none',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
    >
      {sprite}
      <span style={{
        fontFamily: "'Consolas','Courier New',monospace",
        fontSize: '9px', color: '#aaaacc',
        marginTop: 4, textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.3,
      }}>
        {label}
      </span>
    </div>
  )
}

const ProgSprite = () => (
  <svg width="40" height="40" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
    <rect width="8" height="8" fill="#2a2a4a"/>
    <rect x="1" y="1" width="6" height="6" fill="#224422"/>
    <rect x="2" y="3" width="1" height="2" fill="#44ff44"/>
    <rect x="3" y="2" width="1" height="4" fill="#44ff44"/>
    <rect x="4" y="3" width="1" height="2" fill="#44ff44"/>
    <rect x="5" y="4" width="1" height="1" fill="#44ff44"/>
  </svg>
)

const PhotoSprite = () => (
  <img src="/image_icon.png" width={40} height={40} style={{ imageRendering: 'pixelated' }} />
)

export default function StarsWindow({ obj }) {
  const [openProg, setOpenProg] = useState(false)
  const [openNote, setOpenNote] = useState(false)
  const [openPhoto, setOpenPhoto] = useState(false)

  const monitoringX = useGameStore((s) => s.monitoringX)
  const noticeUnlocked = useGameStore((s) => s.noticeUnlocked)
  const unlockNotice = useGameStore((s) => s.unlockNotice)

  const constellationIdx = getConstellationIndex(monitoringX)
  const constellationSrc = CONSTELLATION_SVGS[constellationIdx]

  // 시퀀스 추적: 27 → 9 → 12 (800ms 머물러야 인식)
  const seqStep = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (noticeUnlocked) return

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (constellationIdx === SEQUENCE[seqStep.current]) {
        seqStep.current += 1
        if (seqStep.current === SEQUENCE.length) {
          unlockNotice()
          seqStep.current = 0
        }
      } else {
        seqStep.current = constellationIdx === SEQUENCE[0] ? 1 : 0
      }
    }, 800)

    return () => clearTimeout(timerRef.current)
  }, [constellationIdx])

  return (
    <>
      <WindowFrame
        title={`폴더 — ${obj.label}`}
        windowId={obj.objId}
        initialPos={{ x: 320, y: 160 }}
      >
        <div style={{
          display: 'flex', flexDirection: 'row', gap: 4,
          padding: '10px 8px', background: '#0a0202', minWidth: 240,
        }}>
          <FolderIcon
            sprite={<ProgSprite />}
            label="vega"
            onDoubleClick={() => setOpenProg(true)}
          />
          <FolderIcon
            sprite={<NoteSprite />}
            label="기록.txt"
            onDoubleClick={() => setOpenNote(true)}
          />
          <FolderIcon
            sprite={<PhotoSprite />}
            label="photo"
            onDoubleClick={() => setOpenPhoto(true)}
          />
        </div>
      </WindowFrame>

      {openProg && (
        <SubWindow title="vega" onClose={() => setOpenProg(false)} initialPos={{ x: 420, y: 200 }}>
          <div style={{
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 8, minWidth: 200,
          }}>
            <img
              src={constellationSrc}
              alt="constellation"
              style={{ width: 240, height: 240, display: 'block' }}
            />
          </div>
        </SubWindow>
      )}

      {openNote && (
        <SubWindow title="메모장 — 기록.txt" onClose={() => setOpenNote(false)} initialPos={{ x: 460, y: 230 }}>
          <div className="note-window">
            <div className="note-text" style={{ fontFamily: "'Malgun Gothic', '맑은 고딕', sans-serif", whiteSpace: 'pre-wrap' }}>
              {`하염없이 비춰지던 원을\n눈으로서 모든 빛깔을 차지한다.\n\n거대한 무쇳덩이가\n모든 것들을 삼키고\n\n작은 속삭임은 어둠 위에서야\n비로소 들려진다.`}
            </div>
          </div>
        </SubWindow>
      )}

{openPhoto && (
        <SubWindow title="사진 — photo" onClose={() => setOpenPhoto(false)} initialPos={{ x: 380, y: 260 }}>
          <div style={{
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 8,
          }}>
            <img
              src="/stars_photo.svg"
              alt="photo"
              style={{ width: '100%', maxWidth: 600, display: 'block' }}
            />
          </div>
        </SubWindow>
      )}
    </>
  )
}
