// SplitCircuitPuzzle
// - 창이 겹치면 타이틀바(이름·닫기) 숨김, 이미지만 표시
// - 정답: boxes = [1, 0,0,1,1,1]  → 다음 스테이지

import { useEffect, useRef, useState } from 'react'

const TH = 26   // 타이틀바 높이
const SC = 0.5  // 이미지 스케일

const PIECES = [
  { src: '/pieces/piece_1.svg', nw: 200, nh: 260 },
  { src: '/pieces/piece_2.svg', nw: 280, nh: 260 },
  { src: '/pieces/piece_3.svg', nw: 200, nh: 260 },
  { src: '/pieces/piece_4.svg', nw: 400, nh: 260 },
  { src: '/pieces/piece_5.svg', nw: 280, nh: 260 },
]

const INIT_POS = [
  { x: 20,  y: 60  },
  { x: 135, y: 40  },
  { x: 290, y: 60  },
  { x: 405, y: 40  },
  { x: 150, y: 240 },
]

// piece_1: boxes[0] / piece_2: boxes[1..5]
const OVERLAYS = [
  [{ dx: 75,    dy: 71.5,  boxIdx: 0 }],
  [{ dx: 25.5,  dy: 106.5, boxIdx: 1 },
   { dx: 53,    dy: 106.5, boxIdx: 2 },
   { dx: 80.5,  dy: 106.5, boxIdx: 3 },
   { dx: 108,   dy: 106.5, boxIdx: 4 },
   { dx: 135.5, dy: 106.5, boxIdx: 5 }],
  [], [], [],
]

// 정답
const CORRECT = [1, 0, 0, 1, 1, 1]

const TOGGLE_SIZE = 22

// 창 크기 계산
function winSize(i) {
  const { nw, nh } = PIECES[i]
  return { w: Math.round(nw * SC), h: Math.round(nh * SC) + TH }
}

// 두 창이 겹치는지 확인
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

function ToggleBox({ dx, dy, value, onToggle }) {
  return (
    <div
      onMouseDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); onToggle() }}
      style={{
        position: 'absolute',
        left: Math.round(dx - TOGGLE_SIZE / 2),
        top:  Math.round(dy - TOGGLE_SIZE / 2),
        width: TOGGLE_SIZE, height: TOGGLE_SIZE,
        background: value ? '#1a3a1a' : '#0d0d1a',
        border: `2px solid ${value ? '#44ff88' : '#3a3a5a'}`,
        borderRadius: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold',
        color: value ? '#44ff88' : '#555577',
        userSelect: 'none',
        zIndex: 1,
      }}>
      {value}
    </div>
  )
}

function FileWindow({ pos, showTitle, filename, piece, zIndex,
                      onMouseDown, onClose, overlays, boxes, onToggle }) {
  const dw = Math.round(piece.nw * SC)
  const dh = Math.round(piece.nh * SC)

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'fixed',
        left: pos.x, top: pos.y,
        width: dw,
        background: '#0a0a14',
        border: '2px solid #555',
        boxShadow: '4px 4px 0 #000',
        zIndex,
        userSelect: 'none',
        cursor: 'move',
      }}>
      {/* 타이틀바 — 겹치지 않을 때만 표시 */}
      {showTitle && (
        <div className="window-titlebar" style={{
          background: '#2a2a4a',
          padding: '4px 8px',
          borderBottom: '2px solid #333',
          height: TH,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'move',
        }}>
          <span style={{
            fontFamily: "'Segoe UI','Malgun Gothic',sans-serif",
            fontSize: '9px', color: '#aaa',
            overflow: 'hidden', whiteSpace: 'nowrap', flex: 1,
          }}>
            {filename}
          </span>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onClose() }}
            style={{
              background: '#444', border: '1px solid #666', color: '#aaa',
              fontSize: '10px', cursor: 'pointer', padding: '0 5px',
              fontFamily: 'monospace', marginLeft: 4,
            }}>✕</button>
        </div>
      )}

      {/* 이미지 + 토글 오버레이 */}
      <div style={{ position: 'relative' }}>
        <img src={piece.src} width={dw} height={dh}
          style={{ display: 'block', pointerEvents: 'none' }} />
        {overlays?.map((ov, k) => (
          <ToggleBox
            key={k}
            dx={ov.dx} dy={ov.dy}
            value={boxes[ov.boxIdx]}
            onToggle={() => onToggle(ov.boxIdx)}
          />
        ))}
      </div>
    </div>
  )
}

export default function SplitCircuitPuzzle({ boxes, onToggle, openFiles, onCloseFile, filenames, onSolved }) {
  useEffect(() => {
    if (boxes.length >= 6 && boxes.every((v, i) => v === CORRECT[i])) onSolved()
  }, [boxes])

  const [positions, setPositions] = useState(() => INIT_POS.map(p => ({ ...p })))
  const [topFile,   setTopFile]   = useState(null)

  // 드래그 핸들러 (창별)
  const offsetRef = useRef({ x: 0, y: 0 })
  const makeDragHandler = (i) => (e) => {
    // 이미 다른 드래그 중이면 무시
    if (e.button !== 0) return
    setTopFile(i)
    offsetRef.current = { x: e.clientX - positions[i].x, y: e.clientY - positions[i].y }
    const onMove = (ev) => {
      setPositions(prev => prev.map((p, k) =>
        k === i ? { x: ev.clientX - offsetRef.current.x, y: ev.clientY - offsetRef.current.y } : p
      ))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // 겹침 판단
  const isOverlapping = (i) => {
    const si = winSize(i)
    const pi = positions[i]
    return openFiles.some((open, j) => {
      if (j === i || !open) return false
      const sj = winSize(j)
      const pj = positions[j]
      return rectsOverlap(pi.x, pi.y, si.w, si.h, pj.x, pj.y, sj.w, sj.h)
    })
  }

  return (
    <>
      {[0, 1, 2, 3, 4].map(i => {
        if (!openFiles[i]) return null
        const overlapping = isOverlapping(i)
        return (
          <FileWindow
            key={i}
            pos={positions[i]}
            showTitle={!overlapping}
            filename={filenames[i]}
            piece={PIECES[i]}
            zIndex={topFile === i ? 291 : 290}
            onMouseDown={makeDragHandler(i)}
            onClose={() => onCloseFile(i)}
            overlays={OVERLAYS[i]}
            boxes={boxes}
            onToggle={onToggle}
          />
        )
      })}
    </>
  )
}
