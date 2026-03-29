import { useState } from 'react'
import WindowFrame from './WindowFrame'
import { verifyPuzzle } from '../../api/stageApi'
import { useGameStore } from '../../store/gameStore'

// 서버 오류 시 사용할 fallback 정답
const FALLBACK_ANSWERS = {
  2: { FILE_01: '1213', FILE_02: 'SHADOW' },
}

export default function PuzzleWindow({ obj, stageId }) {
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const solvePuzzle = useGameStore((s) => s.solvePuzzle)
  const stages = useGameStore((s) => s.stages)
  const alreadySolved = stages[stageId]?.[obj.objId]?.solved

  const handleVerify = async () => {
    if (!answer.trim()) return
    try {
      const data = await verifyPuzzle(stageId, obj.objId, answer)
      if (data.correct) {
        setResult('correct')
        solvePuzzle(stageId, obj.objId)
      } else {
        setResult('wrong')
      }
    } catch {
      // fallback: 클라이언트 측 검증
      const expected = FALLBACK_ANSWERS[stageId]?.[obj.objId]
      if (expected && answer.trim().toUpperCase() === expected) {
        setResult('correct')
        solvePuzzle(stageId, obj.objId)
      } else {
        setResult('wrong')
      }
    }
  }

  const PUZZLE_DESC = {
    1: { FILE_01: '메모장의 숫자를 조합하여\n4자리 암호를 입력하시오.' },
    2: {
      FILE_01: '기호 패턴의 순서를 입력하시오.\n(예: 1213)',
      FILE_02: '빈 칸을 채워 단어를 완성하시오.',
    },
  }
  const desc = PUZZLE_DESC[stageId]?.[obj.objId] || '암호를 입력하시오.'

  return (
    <WindowFrame
      title={`파일 — ${obj.label}`}
      windowId={obj.objId}
      initialPos={{ x: 320, y: 180 }}
    >
      <div className="puzzle-window">
        <pre className="puzzle-desc">{desc}</pre>
        {alreadySolved ? (
          <div className="puzzle-result correct">✓ 해독 완료 — 권한 부여됨</div>
        ) : (
          <>
            <div className="puzzle-input-area">
              <input
                className="puzzle-input"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                maxLength={10}
                placeholder="____"
                onMouseDown={(e) => e.stopPropagation()}
              />
              <button className="puzzle-submit-btn" onClick={handleVerify}>
                확인
              </button>
            </div>
            {result === 'correct' && (
              <div className="puzzle-result correct">정답! 파일 잠금 해제됨</div>
            )}
            {result === 'wrong' && (
              <div className="puzzle-result wrong">오답. 다시 시도하시오.</div>
            )}
          </>
        )}
      </div>
    </WindowFrame>
  )
}
