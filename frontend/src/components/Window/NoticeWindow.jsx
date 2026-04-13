import { useState, useRef, useCallback } from 'react'
import WindowFrame from './WindowFrame'

let subZCounter = 500

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

export default function NoticeWindow({ obj }) {
  const [openNote, setOpenNote] = useState(false)
  const [openPhoto, setOpenPhoto] = useState(false)

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
        <SubWindow title="안내문 — double" onClose={() => setOpenNote(false)} initialPos={{ x: 440, y: 230 }}>
          <div className="note-window">
            <div className="note-text" style={{ fontFamily: "'Malgun Gothic', '맑은 고딕', sans-serif", whiteSpace: 'pre-wrap' }}>
              {`(내용 미정)`}
            </div>
          </div>
        </SubWindow>
      )}

      {openPhoto && (
        <SubWindow title="사진 — cancer" onClose={() => setOpenPhoto(false)} initialPos={{ x: 400, y: 260 }}>
          <div style={{
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 8,
          }}>
            <img
              src="/cancer.svg"
              alt="cancer"
              style={{ maxWidth: 240, maxHeight: 240, display: 'block' }}
            />
          </div>
        </SubWindow>
      )}
    </>
  )
}
