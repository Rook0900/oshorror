import { useGameStore } from '../../store/gameStore'
import { useDoubleClick } from '../../hooks/useDoubleClick'

// 간단한 픽셀아트 SVG 스프라이트
const SPRITES = {
  note: (
    <svg width="32" height="32" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect width="8" height="8" fill="#2a2a4a"/>
      <rect x="1" y="1" width="6" height="6" fill="#3a3a6a"/>
      <rect x="2" y="2" width="4" height="1" fill="#aaaaff"/>
      <rect x="2" y="4" width="4" height="1" fill="#aaaaff"/>
      <rect x="2" y="6" width="3" height="1" fill="#6666aa"/>
    </svg>
  ),
  file: (
    <svg width="32" height="32" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect width="8" height="8" fill="#2a2a4a"/>
      <rect x="1" y="2" width="5" height="5" fill="#aa6622"/>
      <rect x="1" y="1" width="3" height="2" fill="#cc8833"/>
      <rect x="4" y="1" width="2" height="1" fill="#cc8833"/>
      <rect x="2" y="4" width="3" height="1" fill="#ffcc88"/>
    </svg>
  ),
  prog: (
    <svg width="32" height="32" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect width="8" height="8" fill="#2a2a4a"/>
      <rect x="1" y="1" width="6" height="6" fill="#224422"/>
      <rect x="2" y="3" width="1" height="2" fill="#44ff44"/>
      <rect x="3" y="2" width="1" height="4" fill="#44ff44"/>
      <rect x="4" y="3" width="1" height="2" fill="#44ff44"/>
      <rect x="5" y="4" width="1" height="1" fill="#44ff44"/>
    </svg>
  ),
  prog_locked: (
    <svg width="32" height="32" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect width="8" height="8" fill="#2a2a4a"/>
      <rect x="1" y="1" width="6" height="6" fill="#1a1a1a"/>
      <rect x="3" y="2" width="2" height="2" fill="#555"/>
      <rect x="2" y="4" width="4" height="3" fill="#555"/>
      <rect x="3" y="5" width="2" height="1" fill="#333"/>
    </svg>
  ),
}

export default function DesktopIcon({ obj, stageId, selected, onSingleClick, onDoubleClick }) {
  const isUnlocked = useGameStore((s) => s.isUnlocked)
  const stages = useGameStore((s) => s.stages)

  const isProgram = obj.objType === 'PROGRAM'
  // 스테이지 1·3의 centralkeeper·중앙관리장치.exe는 항상 클릭 가능
  const stage3SpecialProg = (stageId === 1 || stageId === 3) && (obj.objId === 'PROG_01' || obj.objId === 'PROG_02')
  const locked = isProgram && !isUnlocked(stageId, obj.objId) && !stage3SpecialProg
  const solved = obj.objType === 'FILE' && stages[stageId]?.[obj.objId]?.solved

  const handleClick = useDoubleClick(
    () => onSingleClick(obj.objId),
    () => {
      if (isProgram && locked) return // 잠긴 프로그램 실행 불가
      onDoubleClick(obj.objId)
    }
  )

  const spriteKey = isProgram && locked ? 'prog_locked' : obj.spriteKey

  return (
    <div
      className={`desktop-icon ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`}
      style={{ left: obj.posX, top: obj.posY }}
      onClick={handleClick}
    >
      <div className="icon-sprite pixel-art">{SPRITES[spriteKey] || SPRITES.file}</div>
      <div className="icon-label">
        {locked && <span className="lock-icon">🔒</span>}
        {obj.label}
      </div>
    </div>
  )
}
