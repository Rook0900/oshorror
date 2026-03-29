import { useEffect, useState } from 'react'
import WindowFrame from './WindowFrame'
import ConnectWindow from './ConnectWindow'
import SplitCircuitPuzzle from './SplitCircuitPuzzle'
import { useGameStore } from '../../store/gameStore'

const HORROR_EVENTS = { 1: 'blackout', 2: 'distort', 3: 'glitch' }

// centralkeeper에 설치되는 파일 목록
const INSTALLED_FILES = [
  'sys_patch_01.dat',
  'keeper_v2.bin',
  'circuit_A.run',
  'circuit_B.run',
  'unknown_888.exe',
]

// connect 파일 아이콘
function ConnectFileIcon({ onDoubleClick }) {
  const [last, setLast] = useState(0)
  const handleClick = () => {
    const now = Date.now()
    if (now - last < 350) onDoubleClick()
    setLast(now)
  }
  return (
    <div onClick={handleClick}
      style={{ display:'inline-flex', flexDirection:'column', alignItems:'center',
        cursor:'pointer', padding:'8px', border:'2px solid transparent', borderRadius:'4px', userSelect:'none' }}
      onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}
    >
      <svg width="32" height="32" viewBox="0 0 8 8" style={{ imageRendering:'pixelated' }}>
        <rect width="8" height="8" fill="#0d0d1a" />
        <rect x="1" y="2" width="5" height="5" fill="#225522" />
        <rect x="1" y="1" width="3" height="2" fill="#33aa33" />
        <rect x="4" y="1" width="2" height="1" fill="#33aa33" />
        <rect x="2" y="4" width="3" height="1" fill="#88ff88" />
      </svg>
      <span style={{ fontFamily:"'Segoe UI','Malgun Gothic',sans-serif", fontSize:'9px', color:'#aaffaa', marginTop:'4px' }}>
        connect
      </span>
    </div>
  )
}

// 설치된 파일 아이콘
function InstalledFileIcon({ name, index, solved, onClick }) {
  return (
    <div onClick={onClick}
      style={{ display:'flex', flexDirection:'column', alignItems:'center',
        cursor: solved ? 'default' : 'pointer', padding:'6px', width:'72px',
        border:'1px solid transparent', borderRadius:'3px', opacity: solved ? 0.5 : 1 }}
      onMouseEnter={e => { if (!solved) e.currentTarget.style.borderColor='rgba(255,255,255,0.2)' }}
      onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}
    >
      <img src={`/piece_${index + 1}.svg`} width="48" height="48" style={{ imageRendering:'pixelated' }} />
      <span style={{
        fontFamily:"'Consolas','Courier New',monospace",
        fontSize:'7px', color: solved ? '#448844' : '#8888cc',
        marginTop:'3px', textAlign:'center', wordBreak:'break-all', lineHeight:'1.3',
      }}>
        {solved ? '✓' : ''}{name}
      </span>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function ProgramWindow({ obj, stageId }) {
  const isUnlocked          = useGameStore(s => s.isUnlocked)
  const triggerHorror       = useGameStore(s => s.triggerHorror)
  const nextStage           = useGameStore(s => s.nextStage)
  const centralDownloaded   = useGameStore(s => s.centralDownloaded)
  const setCentralDownloaded = useGameStore(s => s.setCentralDownloaded)

  const closeWindow     = useGameStore(s => s.closeWindow)
  const unlocked        = isUnlocked(stageId, obj.objId)
  const isCentralkeeper = (stageId === 1 || stageId === 3) && obj.objId === 'PROG_01'
  const isErrorProg     = (stageId === 1 || stageId === 3) && obj.objId === 'PROG_02'

  useEffect(() => {
    if (isCentralkeeper && !unlocked) closeWindow(obj.objId)
  }, [isCentralkeeper, unlocked])

  const [connectOpen, setConnectOpen] = useState(false)
  // 파일별 개별 열림 상태 (5개)
  const [openFiles, setOpenFiles] = useState([false, false, false, false, false])
  const downloadDone = centralDownloaded

  const openFile  = (i) => setOpenFiles(prev => prev.map((v, k) => k === i ? true  : v))
  const closeFile = (i) => setOpenFiles(prev => prev.map((v, k) => k === i ? false : v))
  const anyOpen   = openFiles.some(Boolean)

  const [boxes, setBoxes] = useState([0, 0, 0, 0, 0, 0])
  const [solved, setSolved] = useState(false)

  // 공포 트리거 (centralkeeper·스테이지 전환 아닌 경우)
  useEffect(() => {
    if (!unlocked || isErrorProg || isCentralkeeper) return
    triggerHorror(HORROR_EVENTS[stageId] || 'glitch')
    const t = setTimeout(() => { if (stageId < 3) nextStage() }, 4000)
    return () => clearTimeout(t)
  }, [unlocked])

  const handleToggle = (j) => {
    setBoxes(prev => prev.map((v, k) => k === j ? (v === 1 ? 0 : 1) : v))
  }

  const handleSolved = () => {
    setSolved(true)
    setOpenFiles([false, false, false, false, false])
    triggerHorror(HORROR_EVENTS[stageId] || 'blackout')
    setTimeout(() => { if (stageId < 3) nextStage() }, 4000)
  }

  // ── 오류 프로그램 ──
  if (isErrorProg) {
    return (
      <WindowFrame title="오류" windowId={obj.objId} initialPos={{ x: 280, y: 220 }}>
        <div className="program-window">
          <div className="program-content" style={{ color:'#ffcc44' }}>
            지정된 파일을<br />찾을 수 없습니다.
          </div>
        </div>
      </WindowFrame>
    )
  }

  // ── centralkeeper: 잠금 중 → 열지 않음 ──
  if (isCentralkeeper && !unlocked) return null

  // ── centralkeeper: 잠금 해제, 파일 설치 전 ──
  if (isCentralkeeper && unlocked && !downloadDone) {
    return (
      <>
        <WindowFrame title="centralkeeper" windowId={obj.objId} initialPos={{ x: 300, y: 180 }}>
          <div className="program-window">
            <div style={{ borderTop:'1px solid #333', padding:'8px', marginTop:'4px' }}>
              <ConnectFileIcon onDoubleClick={() => setConnectOpen(true)} />
            </div>
          </div>
        </WindowFrame>

        {connectOpen && (
          <ConnectWindow onDownloadComplete={() => {
            setConnectOpen(false)
            setCentralDownloaded()
          }} />
        )}
      </>
    )
  }

  // ── centralkeeper: 파일 설치 완료 ──
  if (isCentralkeeper && unlocked && downloadDone) {
    return (
      <>
        <WindowFrame title="centralkeeper" windowId={obj.objId} initialPos={{ x: 300, y: 160 }}>
          <div className="program-window" style={{ padding:'0' }}>
            <div style={{
              padding:'8px 12px', borderBottom:'1px solid #1a1a2a',
              fontFamily:"'Malgun Gothic','맑은 고딕',sans-serif",
              fontSize:'11px', color:'#556677',
              display:'flex', justifyContent:'space-between',
            }}>
              <span>설치된 파일</span>
              <span style={{ color: solved ? '#44ff88' : '#445' }}>
                {solved ? '5 / 5' : '0 / 5'}
              </span>
            </div>
            <div style={{
              display:'flex', flexWrap:'wrap', gap:'4px',
              padding:'10px 8px', minWidth:'280px',
            }}>
              {INSTALLED_FILES.map((name, i) => (
                <InstalledFileIcon
                  key={i}
                  name={name}
                  index={i}
                  solved={solved}
                  onClick={() => { if (!solved) openFile(i) }}
                />
              ))}
            </div>
          </div>
        </WindowFrame>

        {/* 파일별 개별 창 — 클릭한 파일만 열림 */}
        {anyOpen && (
          <SplitCircuitPuzzle
            boxes={boxes}
            onToggle={handleToggle}
            openFiles={openFiles}
            onCloseFile={closeFile}
            filenames={INSTALLED_FILES}
            onSolved={handleSolved}
          />
        )}
      </>
    )
  }

  // ── 기본 잠금 화면 ──
  if (!unlocked) {
    return (
      <WindowFrame title={`실행 거부 — ${obj.label}`} windowId={obj.objId} initialPos={{ x: 300, y: 200 }}>
        <div className="program-window">
          <div className="program-content" style={{ color:'#ff6666' }}>
            ⚠ 접근 권한 없음<br /><br />
            모든 파일을 먼저<br />해독하시오.
          </div>
        </div>
      </WindowFrame>
    )
  }

  return (
    <WindowFrame title={obj.label} windowId={obj.objId} disableClose={stageId === 2} initialPos={{ x: 300, y: 200 }}>
      <div className="program-window">
        <div className="program-content">
          실행 중...<br /><br />
          {stageId === 2 && (
            <span style={{ color:'#ff0000', animation:'flicker 0.2s infinite' }}>
              이 창은 닫을 수 없습니다<br />
            </span>
          )}
          시스템이 불안정합니다
        </div>
      </div>
    </WindowFrame>
  )
}
