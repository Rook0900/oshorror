import { useState, useEffect } from 'react'
import WindowFrame from './WindowFrame'
import { useGameStore } from '../../store/gameStore'

function randomBulbs() {
  let state
  do {
    state = Array.from({ length: 4 }, () => (Math.random() > 0.5 ? 1 : 0))
  } while (state.every((v) => v === 1) || state.every((v) => v === 0))
  return state
}

// bulb[i] → box[WIRE_MAP[i]]
// [2,3,0,1]: 0→2, 1→3, 2→0, 3→1  (자기 역원, BULB_FOR_BOX도 동일)
const WIRE_MAP = [2, 3, 0, 1]

const BULB_X = [55, 135, 215, 295]
const BOX_X  = [55, 135, 215, 295]
const BULB_Y = 58
const BOX_Y  = 172
const BOX_HALF = 17

// 전선 경로 (polyline points)
// 충돌 칼럼에서 ±3px 오프셋 → 병렬 겹침 방지
// Wire 0: bulb[0]=55 → box[2]=215  (ㄷ, 오른쪽)  horiz y=90
// Wire 1: bulb[1]=135 → box[3]=295 (ㄷ, 오른쪽)  horiz y=110
// Wire 2: bulb[2]=215 → box[0]=55  (역ㄷ, 왼쪽)  horiz y=130
// Wire 3: bulb[3]=295 → box[1]=135 (역ㄷ, 왼쪽)  horiz y=150
const WIRE_PATHS = [
  [[55,79],[55,90],[212,90],[212,155]],   // Wire 0 (x=212 ← 215에서 -3)
  [[135,79],[135,110],[298,110],[298,155]], // Wire 1 (x=298 ← 295에서 +3)
  [[218,79],[218,130],[55,130],[55,155]],  // Wire 2 (x=218 ← 215에서 +3)
  [[292,79],[292,150],[135,150],[135,155]], // Wire 3 (x=292 ← 295에서 -3)
]

// 렌더 순서: 3→2→1→0 (0이 맨 위 레이어, 교차점에서 위로 보임)
const DRAW_ORDER = [3, 2, 1, 0]

function ptsStr(pts) {
  return pts.map(([x, y]) => `${x},${y}`).join(' ')
}

export default function CircuitPuzzleWindow({ obj, stageId }) {
  const solvePuzzle = useGameStore((s) => s.solvePuzzle)
  const stages = useGameStore((s) => s.stages)
  const alreadySolved = stages[stageId]?.[obj.objId]?.solved

  const [bulbs] = useState(randomBulbs)
  const [boxes, setBoxes] = useState([0, 0, 0, 0])

  const toggleBox = (j) => {
    if (alreadySolved) return
    setBoxes((prev) => {
      const next = [...prev]
      next[j] = next[j] === 1 ? 0 : 1
      return next
    })
  }

  // 정답: box[j] === bulbs[WIRE_MAP[j]] (WIRE_MAP이 자기 역원이므로 그대로 사용)
  useEffect(() => {
    if (!alreadySolved && boxes.every((v, j) => v === bulbs[WIRE_MAP[j]])) {
      solvePuzzle(stageId, obj.objId)
    }
  }, [boxes])

  return (
    <WindowFrame
      title={`전기 회로 — ${obj.label}`}
      windowId={obj.objId}
      initialPos={{ x: 280, y: 120 }}
    >
      <div className="puzzle-window" style={{ padding: '12px' }}>
        <pre className="puzzle-desc">
          {'전구 상태를 읽고 연결된 박스 값을 맞추시오.\nON(켜짐) → 1 / OFF(꺼짐) → 0'}
        </pre>

        {alreadySolved ? (
          <div className="puzzle-result correct" style={{ marginTop: '16px' }}>
            ✓ 회로 연결 완료 — centralkeeper 활성화됨
          </div>
        ) : (
          <svg
            viewBox="0 0 360 220"
            width="360"
            height="220"
            style={{ display: 'block', margin: '8px auto 0' }}
          >
            <rect width="360" height="220" fill="#070710" />

            {/* 전선 — 아래 레이어부터 순서대로 */}
            {DRAW_ORDER.map((wi) => (
              <polyline
                key={`wire-${wi}`}
                points={ptsStr(WIRE_PATHS[wi])}
                fill="none"
                stroke="#3a3a5a"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            ))}

            {/* 전구 */}
            {BULB_X.map((bx, i) => (
              <g key={`bulb-${i}`}>
                {bulbs[i] === 1 && (
                  <circle cx={bx} cy={BULB_Y} r="25" fill="#ffee4418" />
                )}
                <circle
                  cx={bx} cy={BULB_Y} r="19"
                  fill={bulbs[i] === 1 ? '#ffee44' : '#111122'}
                  stroke={bulbs[i] === 1 ? '#ffcc00' : '#3a3a5a'}
                  strokeWidth="3"
                />
                <text
                  x={bx} y={BULB_Y + 6}
                  textAnchor="middle"
                  fill={bulbs[i] === 1 ? '#332200' : '#555577'}
                  fontSize="14" fontWeight="bold" fontFamily="monospace"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {bulbs[i]}
                </text>
              </g>
            ))}

            {/* 박스 */}
            {BOX_X.map((bx, j) => (
              <g key={`box-${j}`} onClick={() => toggleBox(j)} style={{ cursor: 'pointer' }}>
                <rect
                  x={bx - BOX_HALF} y={BOX_Y - BOX_HALF}
                  width={BOX_HALF * 2} height={BOX_HALF * 2}
                  rx="4"
                  fill={boxes[j] === 1 ? '#1a3a1a' : '#0d0d1a'}
                  stroke={boxes[j] === 1 ? '#44ff88' : '#3a3a5a'}
                  strokeWidth="2"
                />
                <text
                  x={bx} y={BOX_Y + 6}
                  textAnchor="middle"
                  fill={boxes[j] === 1 ? '#44ff88' : '#555577'}
                  fontSize="14" fontWeight="bold" fontFamily="monospace"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {boxes[j]}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
    </WindowFrame>
  )
}
