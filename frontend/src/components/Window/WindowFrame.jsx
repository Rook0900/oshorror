import { useRef, useEffect } from 'react'
import { useDrag } from '../../hooks/useDrag'
import { useGameStore } from '../../store/gameStore'

export default function WindowFrame({ title, windowId, children, initialPos, disableClose = false, trackRect = false }) {
  const { pos, onMouseDown } = useDrag(initialPos || { x: 200, y: 150 })
  const closeWindow = useGameStore((s) => s.closeWindow)
  const focusWindow = useGameStore((s) => s.focusWindow)
  const zIndex = useGameStore((s) => 200 + s.openWindows.indexOf(windowId))
  const setWindowRect = useGameStore((s) => s.setWindowRect)
  const divRef = useRef(null)

  useEffect(() => {
    if (!trackRect || !divRef.current) return
    const { width, height } = divRef.current.getBoundingClientRect()
    setWindowRect(windowId, { x: pos.x, y: pos.y, w: width, h: height })
  }, [pos, trackRect, windowId])

  useEffect(() => {
    if (!trackRect) return
    return () => setWindowRect(windowId, null)
  }, [trackRect, windowId])

  return (
    <div
      ref={divRef}
      className="window-frame"
      style={{ left: pos.x, top: pos.y, zIndex }}
      onMouseDownCapture={() => focusWindow(windowId)}
      onMouseDown={onMouseDown}
    >
      <div className="window-titlebar">
        <span className="title-text">{title}</span>
        <button
          className={`window-close-btn ${disableClose ? 'disabled' : ''}`}
          onClick={() => !disableClose && closeWindow(windowId)}
        >
          x
        </button>
      </div>
      <div className="window-content">
        {children}
      </div>
    </div>
  )
}
