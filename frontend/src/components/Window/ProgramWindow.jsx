import { useEffect, useState, useRef } from 'react'
import WindowFrame from './WindowFrame'
import ConnectWindow from './ConnectWindow'
import SplitCircuitPuzzle from './SplitCircuitPuzzle'
import { useGameStore } from '../../store/gameStore'

function RetryImg({ src, width, height, style }) {
  const [retry, setRetry] = useState(0)
  return (
    <img
      key={retry}
      src={src}
      width={width} height={height} style={style}
      onError={() => setTimeout(() => setRetry(k => k + 1), 500)}
    />
  )
}

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
      <div style={{
        width: 32, height: 32,
        WebkitMaskImage: 'url(/download_sky.png)',
        WebkitMaskSize: '100% 100%',
        maskImage: 'url(/download_sky.png)',
        maskSize: '100% 100%',
        background: '#4a90a3',
      }} />
      <span style={{ fontFamily:"'Segoe UI','Malgun Gothic',sans-serif", fontSize:'9px', color:'#aaaacc', marginTop:'4px' }}>
        connect
      </span>
    </div>
  )
}

// 설치된 파일 아이콘
function InstalledFileIcon({ name, index, solved, onDoubleClick }) {
  const lastClick = useRef(0)
  const handleClick = () => {
    if (solved) return
    const now = Date.now()
    if (now - lastClick.current < 400) onDoubleClick()
    lastClick.current = now
  }
  return (
    <div onClick={handleClick}
      style={{ display:'flex', flexDirection:'column', alignItems:'center',
        cursor: solved ? 'default' : 'pointer', padding:'6px', width:'72px',
        border:'1px solid transparent', borderRadius:'3px', opacity: solved ? 0.5 : 1 }}
      onMouseEnter={e => { if (!solved) e.currentTarget.style.borderColor='rgba(255,255,255,0.2)' }}
      onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}
    >
      <RetryImg src="/document_icon.svg" width={48} height={48} style={{ imageRendering:'pixelated' }} />
      <span style={{
        fontFamily:"'Consolas','Courier New',monospace",
        fontSize:'9px', color: solved ? '#aaaacc' : '#ccccff',
        fontWeight: 'bold',
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

  const closeWindow      = useGameStore(s => s.closeWindow)
  const setCentralSolved = useGameStore(s => s.setCentralSolved)
  const prog02Activated = useGameStore(s => s.prog02Activated)
  const activateProg02  = useGameStore(s => s.activateProg02)
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
    setCentralSolved()
    setBoxes([0, 0, 0, 0, 0, 0])
    activateProg02()
  }

  // ── 오류 프로그램 ──
  if (isErrorProg && !prog02Activated) {
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

  // ── 중앙관리장치 활성화 ──
  const [iu8ntPhase, setIu8ntPhase] = useState(null) // null | 'transmitting' | 'complete'
  const [iu8ntProgress, setIu8ntProgress] = useState(0)
  const audioRef = useRef(null)
  const iu8ntLastClick = useRef(0)
  const iu8ntIvRef = useRef(null)

  useEffect(() => {
    if (iu8ntPhase !== 'transmitting') return
    let hitTwenty = false

    iu8ntIvRef.current = setInterval(() => {
      setIu8ntProgress(prev => {
        if (prev < 20) return Math.min(20, prev + Math.random() * 4 + 1.5)
        // 20% 도달 시 3초 대기 후 100%로 점프
        if (!hitTwenty) {
          hitTwenty = true
          clearInterval(iu8ntIvRef.current)
          setTimeout(() => {
            setIu8ntProgress(100)
            setTimeout(() => {
              if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
              setIu8ntPhase('complete')
            }, 400)
          }, 3000)
        }
        return 20
      })
    }, 80)

    return () => clearInterval(iu8ntIvRef.current)
  }, [iu8ntPhase])

  const handleIu8ntDoubleClick = () => {
    if (iu8ntPhase) return
    setIu8ntProgress(0)
    setIu8ntPhase('transmitting')

    const audio = new Audio('/static_noise.flac')
    audioRef.current = audio
    audio.play().catch(() => {})

    setTimeout(() => {
      if (stageId < 3) nextStage()
    }, 8000)
  }

  if (isErrorProg && prog02Activated) {
    const folders = ['sys_core', 'null_trace', 'iu8nt', 'dead_loop']
    return (
      <>
        <WindowFrame title="중앙관리장치" windowId={obj.objId} initialPos={{ x: 280, y: 220 }}>
          <div className="program-window" style={{ padding: '10px 8px', minWidth: 240 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {folders.map((name) => {
                const isTarget = name === 'iu8nt'
                return (
                  <div key={name}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      width: 64, cursor: 'pointer', padding: '6px 4px',
                      border: '1px solid transparent', borderRadius: 3,
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                    onClick={() => {
                      if (!isTarget) return
                      const now = Date.now()
                      if (now - iu8ntLastClick.current < 400) handleIu8ntDoubleClick()
                      iu8ntLastClick.current = now
                    }}
                  >
                    <RetryImg src="/folder_icon.svg" width={40} height={40} style={{ imageRendering: 'pixelated' }} />
                    <span style={{
                      fontFamily: "'Consolas','Courier New',monospace",
                      fontSize: '7px', color: isTarget ? '#aaaacc' : '#8888cc',
                      marginTop: 4, textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.3,
                    }}>{name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </WindowFrame>

        {iu8ntPhase && (
          <div style={{
            position: 'fixed',
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 220,
            width: 280,
            background: '#2a2a3e',
            border: '2px solid #3a3a5a',
            boxShadow: '4px 4px 0 #000',
          }}>
            <div style={{
              background: '#4a4a6a',
              padding: '5px 12px',
              borderBottom: '1px solid #2a2a3a',
              fontFamily: "'Segoe UI','Malgun Gothic',sans-serif",
              fontSize: '11px', color: '#888',
            }} />

            <div style={{ padding: '16px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                  width: 32, height: 32,
                  WebkitMaskImage: 'url(/download_sky.png)',
                  WebkitMaskSize: '100% 100%',
                  maskImage: 'url(/download_sky.png)',
                  maskSize: '100% 100%',
                  background: '#4a90a3',
                }} />
                <span style={{
                  fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
                  fontSize: '12px', color: '#aaaacc',
                }}>
                  {iu8ntPhase === 'transmitting' ? '패킷 전송 중...' : '설치가 완료되었습니다. 곧 재부팅 됩니다.'}
                </span>
              </div>

              <div style={{ height: '6px', background: '#111', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${iu8ntProgress}%`,
                  background: iu8ntProgress >= 100 ? '#2a7a2a' : '#2244aa',
                  transition: 'width 0.08s, background 0.3s',
                  borderRadius: '3px',
                }} />
              </div>

              <div style={{
                marginTop: '6px',
                display: 'flex', justifyContent: 'space-between',
                fontFamily: 'monospace', fontSize: '10px', color: '#445566',
              }}>
                <span>{Math.floor(iu8ntProgress)}%</span>
                <span>{iu8ntProgress >= 100 ? '완료' : '전송 중'}</span>
              </div>
            </div>
          </div>
        )}
      </>
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
          <div className="program-window" style={{ padding:'0', background:'#03030e' }}>
            <div style={{
              padding:'8px 12px', borderBottom:'1px solid #1a1a2a',
              fontFamily:"'Malgun Gothic','맑은 고딕',sans-serif",
              fontSize:'11px', color:'#556677',
              display:'flex', justifyContent:'space-between',
            }}>
              <span>설치된 파일</span>
              <span style={{ color: solved ? '#aaaacc' : '#445' }}>
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
                  onDoubleClick={() => openFile(i)}
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
