import { useDrag } from '../../hooks/useDrag'
import { useGameStore } from '../../store/gameStore'

export default function WindowFrame({ title, windowId, children, initialPos, disableClose = false }) {
  const { pos, onMouseDown } = useDrag(initialPos || { x: 200, y: 150 })
  const closeWindow = useGameStore((s) => s.closeWindow)
  const focusWindow = useGameStore((s) => s.focusWindow)
  const zIndex = useGameStore((s) => s.openWindows.indexOf(windowId))

  return (
    <div
      className="window-frame"
      style={{ left: pos.x, top: pos.y, zIndex }}
      onMouseDown={(e) => { focusWindow(windowId); onMouseDown(e) }}
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
