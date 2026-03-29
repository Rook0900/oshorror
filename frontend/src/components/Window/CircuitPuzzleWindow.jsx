import { useState, useEffect } from 'react'
import WindowFrame from './WindowFrame'
import { useGameStore } from '../../store/gameStore'

// SVG 원본 크기: 680 x 500
// 박스 위치 (SVG 원본 좌표 기준 퍼센트)
// rect x=245 y=220 w=45 h=45, rect x=300, rect x=355
const BOX_POSITIONS = [
  { left: '36.03%', top: '44.0%', width: '6.62%', height: '9.0%' },
  { left: '44.12%', top: '44.0%', width: '6.62%', height: '9.0%' },
  { left: '52.21%', top: '44.0%', width: '6.62%', height: '9.0%' },
]

// 정답: circuit2_new.svg 회로도에 맞게 수정
const ANSWER = [1, 1, 0]

export default function CircuitPuzzleWindow({ obj, stageId }) {
  const solvePuzzle     = useGameStore((s) => s.solvePuzzle)
  const stages          = useGameStore((s) => s.stages)
  const boxes           = useGameStore((s) => s.circuitBoxes)
  const setCircuitBoxes = useGameStore((s) => s.setCircuitBoxes)
  const alreadySolved   = stages[stageId]?.[obj.objId]?.solved
  const [imgSrc, setImgSrc] = useState(null)

  useEffect(() => {
    let url = null
    const load = () => {
      fetch('/circuit2_new.svg?' + Date.now())
        .then(r => r.blob())
        .then(blob => { url = URL.createObjectURL(blob); setImgSrc(url) })
        .catch(() => setTimeout(load, 500))
    }
    load()
    return () => { if (url) URL.revokeObjectURL(url) }
  }, [])

  const toggleBox = (j) => {
    if (alreadySolved) return
    const next = [...boxes]
    next[j] = next[j] === 1 ? 0 : 1
    setCircuitBoxes(next)
  }

  useEffect(() => {
    if (!alreadySolved && boxes.every((v, j) => v === ANSWER[j])) {
      solvePuzzle(stageId, obj.objId)
    }
  }, [boxes])

  return (
    <WindowFrame
      title={`전기 회로 — ${obj.label}`}
      windowId={obj.objId}
      initialPos={{ x: 280, y: 120 }}
    >
      <div className="puzzle-window" style={{ padding: '12px', background: '#dde4f0' }}>
        {(
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {imgSrc
              ? <img src={imgSrc} alt="circuit puzzle" draggable={false}
                  style={{ display: 'block', width: '500px', userSelect: 'none' }} />
              : <div style={{ width: 500, height: 368, background: '#dde4f0' }} />
            }
            {BOX_POSITIONS.map((pos, j) => (
              <div
                key={j}
                onClick={() => toggleBox(j)}
                style={{
                  position: 'absolute',
                  left: pos.left,
                  top: pos.top,
                  width: pos.width,
                  height: pos.height,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  color: '#111',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  fontFamily: 'Courier New, monospace',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                }}
              >
                {boxes[j]}
              </div>
            ))}
          </div>
        )}
      </div>
    </WindowFrame>
  )
}
