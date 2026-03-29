import { useState, useEffect } from 'react'
import WindowFrame from './WindowFrame'
import { useGameStore } from '../../store/gameStore'

function randomLights() {
  let state
  do {
    state = Array.from({ length: 6 }, () => (Math.random() > 0.5 ? 1 : 0))
  } while (state.every((l) => l === 1))
  return state
}

// SVG 내 전구 위치 (viewBox 0 0 300 220)
const BULB_POS = [
  { x: 60,  y: 65  }, // 0 좌상
  { x: 150, y: 65  }, // 1 중상
  { x: 240, y: 65  }, // 2 우상
  { x: 60,  y: 155 }, // 3 좌하
  { x: 150, y: 155 }, // 4 중하
  { x: 240, y: 155 }, // 5 우하
]

// 전선 연결 쌍 [bulbA, bulbB]
const WIRES = [
  [0, 1], [1, 2],   // 상단 가로
  [3, 4], [4, 5],   // 하단 가로
  [0, 3],           // 좌측 세로
  [2, 5],           // 우측 세로
]

export default function WirePuzzleWindow({ obj, stageId }) {
  const solvePuzzle = useGameStore((s) => s.solvePuzzle)
  const stages = useGameStore((s) => s.stages)
  const alreadySolved = stages[stageId]?.[obj.objId]?.solved

  const [lights, setLights] = useState(randomLights)

  useEffect(() => {
    if (!alreadySolved && lights.every((l) => l === 1)) {
      solvePuzzle(stageId, obj.objId)
    }
  }, [lights])

  const toggle = (i) => {
    if (alreadySolved) return
    setLights((prev) => {
      const next = [...prev]
      next[i] = next[i] === 1 ? 0 : 1
      return next
    })
  }

  const isLit = (a, b) => lights[a] === 1 && lights[b] === 1

  return (
    <WindowFrame
      title={`전기 회로 — ${obj.label}`}
      windowId={obj.objId}
      initialPos={{ x: 300, y: 130 }}
    >
      <div className="puzzle-window" style={{ padding: '12px' }}>
        <pre className="puzzle-desc">{'전기 회로를 완성하시오.\n조명을 클릭하여 ON(1) / OFF(0) 전환.'}</pre>

        {alreadySolved ? (
          <div className="puzzle-result correct" style={{ marginTop: '16px' }}>
            ✓ 회로 연결 완료 — centralkeeper 활성화됨
          </div>
        ) : (
          <svg
            viewBox="0 0 300 220"
            width="300"
            height="220"
            style={{ display: 'block', margin: '8px auto 0' }}
          >
            <rect width="300" height="220" fill="#070710" />

            {/* 전선 — 글로우 레이어 */}
            {WIRES.map(([a, b], wi) =>
              isLit(a, b) ? (
                <line
                  key={`glow-${wi}`}
                  x1={BULB_POS[a].x} y1={BULB_POS[a].y}
                  x2={BULB_POS[b].x} y2={BULB_POS[b].y}
                  stroke="#ffee4433"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
              ) : null
            )}

            {/* 전선 — 본체 */}
            {WIRES.map(([a, b], wi) => (
              <line
                key={`wire-${wi}`}
                x1={BULB_POS[a].x} y1={BULB_POS[a].y}
                x2={BULB_POS[b].x} y2={BULB_POS[b].y}
                stroke={isLit(a, b) ? '#ffcc00' : '#2a2a3a'}
                strokeWidth="4"
                strokeLinecap="round"
              />
            ))}

            {/* 전구 */}
            {BULB_POS.map((pos, i) => (
              <g key={i} onClick={() => toggle(i)} style={{ cursor: 'pointer' }}>
                {/* 글로우 */}
                {lights[i] === 1 && (
                  <circle cx={pos.x} cy={pos.y} r="28" fill="#ffee4420" />
                )}
                {/* 전구 몸체 */}
                <circle
                  cx={pos.x} cy={pos.y} r="20"
                  fill={lights[i] === 1 ? '#ffee44' : '#111122'}
                  stroke={lights[i] === 1 ? '#ffcc00' : '#3a3a5a'}
                  strokeWidth="3"
                />
                {/* 숫자 */}
                <text
                  x={pos.x} y={pos.y + 6}
                  textAnchor="middle"
                  fill={lights[i] === 1 ? '#332200' : '#555577'}
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily="monospace"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {lights[i]}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
    </WindowFrame>
  )
}
