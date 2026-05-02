import { useState, useRef, useCallback, useEffect } from 'react'
import WindowFrame from './WindowFrame'
import { useGameStore } from '../../store/gameStore'

function SubWindow({ title, windowId, onClose, initialPos, dimmed, children }) {
  const [pos, setPos] = useState(initialPos)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })
  const divRef = useRef(null)

  const focusWindow = useGameStore((s) => s.focusWindow)
  const openWindow = useGameStore((s) => s.openWindow)
  const closeWindow = useGameStore((s) => s.closeWindow)
  const setWindowRect = useGameStore((s) => s.setWindowRect)
  const zIndex = useGameStore((s) => 200 + s.openWindows.indexOf(windowId))

  useEffect(() => {
    openWindow(windowId)
    return () => { closeWindow(windowId); setWindowRect(windowId, null) }
  }, [windowId])

  useEffect(() => {
    if (!divRef.current) return
    const { width, height } = divRef.current.getBoundingClientRect()
    setWindowRect(windowId, { x: pos.x, y: pos.y, w: width, h: height })
  }, [pos, windowId])

  const onMouseDown = useCallback((e) => {
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

  const handleClose = () => {
    closeWindow(windowId)
    onClose()
  }

  return (
    <div
      ref={divRef}
      className="window-frame"
      style={{ left: pos.x, top: pos.y, zIndex, minWidth: 180, opacity: dimmed ? 0.45 : 1, transition: 'opacity 0.3s' }}
      onMouseDownCapture={() => focusWindow(windowId)}
      onMouseDown={onMouseDown}
    >
      <div className="window-titlebar sw-titlebar">
        <span className="title-text">{title}</span>
        <button className="window-close-btn" onClick={handleClose}>x</button>
      </div>
      <div className="window-content">
        {children}
      </div>
    </div>
  )
}

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

const NoteSprite = () => (
  <img src="/document_icon.svg" width={40} height={40} style={{ imageRendering: 'pixelated' }} />
)

const PhotoSprite = () => (
  <img src="/image_icon.png" width={40} height={40} style={{ imageRendering: 'pixelated' }} />
)

function rectsOverlap(a, b) {
  if (!a || !b) return false
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export default function NoticeWindow({ obj }) {
  const [openNote, setOpenNote] = useState(false)
  const [openPhoto, setOpenPhoto] = useState(false)
  const moonRect = useGameStore((s) => s.windowRects['MOON_WINDOW'])
  const cancerRect = useGameStore((s) => s.windowRects['NOTICE_PHOTO'])
  const vegaRect = useGameStore((s) => s.windowRects['STARS_VEGA'])
  const openWindows = useGameStore((s) => s.openWindows)
  const isMoonOverlap = rectsOverlap(moonRect, cancerRect)
  const isVegaOverlap = rectsOverlap(vegaRect, cancerRect)
  const isOverlapping = isMoonOverlap
  const cancerIsFront = openWindows.indexOf('NOTICE_PHOTO') > openWindows.indexOf('STARS_VEGA')

  return (
    <>
      <WindowFrame
        title={`폴더 — ${obj.label}`}
        windowId={obj.objId}
        initialPos={{ x: 340, y: 180 }}
      >
        <div style={{
          display: 'flex', flexDirection: 'row', gap: 4,
          padding: '10px 8px', background: '#0a0202', minWidth: 200,
        }}>
          <FolderIcon
            sprite={<NoteSprite />}
            label="double"
            onDoubleClick={() => setOpenNote(true)}
          />
          <FolderIcon
            sprite={<PhotoSprite />}
            label="cancer"
            onDoubleClick={() => setOpenPhoto(true)}
          />
        </div>
      </WindowFrame>

      {openNote && (
        <SubWindow title="안내문 — double" windowId="NOTICE_NOTE" onClose={() => setOpenNote(false)} initialPos={{ x: 440, y: 230 }}>
          <div className="note-window">
            <div className="note-text" style={{ fontFamily: "'Malgun Gothic', '맑은 고딕', sans-serif", whiteSpace: 'pre-wrap' }}>
              {`(내용 미정)`}
            </div>
          </div>
        </SubWindow>
      )}

      {openPhoto && (
        <SubWindow title="사진 — cancer" windowId="NOTICE_PHOTO" onClose={() => setOpenPhoto(false)} initialPos={{ x: 400, y: 260 }} dimmed={isVegaOverlap && cancerIsFront}>
          <div style={{
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 6, minWidth: 160,
          }}>
            <img
              src={isOverlapping ? '/constellation_numbered.svg' : '/constellation_no_number.svg'}
              alt="cancer"
              style={{ width: 180, height: 180, display: 'block' }}
            />
          </div>
        </SubWindow>
      )}
    </>
  )
}
