import { useEffect, useState } from 'react'
import WindowFrame from './WindowFrame'
import { getHint } from '../../api/stageApi'
import { useGameStore } from '../../store/gameStore'

// 서버 오류 시 사용할 fallback 힌트
const FALLBACK_HINTS = {
  1: {
    NOTE_01: `본 기기를 통해 중앙관리장치에 접근이 가능합니다.
바탕화면에 위치한 interactive 파일은 접근 상태를 제어하는 역할을 합니다.

해당 파일을 실행하면 시스템의 중심 관리 기능이 자동으로 활성화되어
전체 흐름을 안정적으로 조율합니다.

사용자는 매달 중요 설비의 연결 상태를 검토해야 하며,
필요 시 제공된 주소값을 참고하여 관리 절차를 진행하시기 바랍니다.

중요 설비 주소값:
unknown_888.exe, Luna
bolt, belle`,
  },
  2: {
    NOTE_01: `===========================================

중앙관리장치로 인해 패킷 소스가 전송 되었습니다.
monitoring으로 인해 직접 관측이 가능합니다.

===========================================`,
    NOTE_02: `[파일2 힌트]

S _ A _ O W
공포의 _ _ _ _ _ _
빈 칸을 채워라.

힌트: 어둠이 드리운 것`,
    NOTICE_01: `(내용 미정)`,
  },
}

function getVisiblePositions(line, lineIdx, lastIdx, secondLastIdx, isExecution) {
  const visible = new Set()
  const chars = [...line]

  if (!isExecution) {
    // 일반 redact: 첫줄 '본','다' / 둘째줄 '면','i' / 마지막전줄 u·8(1)·n / 마지막 t
    if (lineIdx === 0) {
      chars.forEach((ch, j) => { if (ch === '본' || ch === '다') visible.add(j) })
    } else if (lineIdx === 1) {
      chars.forEach((ch, j) => { if (ch === '면' || ch === 'i') visible.add(j) })
    } else if (lineIdx === secondLastIdx) {
      let eightsShown = 0
      chars.forEach((ch, j) => {
        if (ch === 'u' || ch === 'n') visible.add(j)
        else if (ch === '8' && eightsShown === 0) { visible.add(j); eightsShown++ }
      })
    } else if (lineIdx === lastIdx) {
      chars.forEach((ch, j) => { if (ch === 't') visible.add(j) })
    }
  } else {
    // execution 상태: 둘째줄 i 하나 / 마지막전줄 u·n·8 각 하나 / 마지막 t 하나
    if (lineIdx === 1) {
      let shown = false
      chars.forEach((ch, j) => { if (ch === 'i' && !shown) { visible.add(j); shown = true } })
    } else if (lineIdx === secondLastIdx) {
      let uShown = false, nShown = false, eightShown = false
      chars.forEach((ch, j) => {
        if (ch === 'u' && !uShown) { visible.add(j); uShown = true }
        else if (ch === 'n' && !nShown) { visible.add(j); nShown = true }
        else if (ch === '8' && !eightShown) { visible.add(j); eightShown = true }
      })
    } else if (lineIdx === lastIdx) {
      let shown = false
      chars.forEach((ch, j) => { if (ch === 't' && !shown) { visible.add(j); shown = true } })
    }
  }
  return visible
}

function RedactedText({ text, isExecution }) {
  const lines = text.split('\n')
  const lastIdx = lines.length - 1
  const secondLastIdx = lines.length - 2
  return (
    <div style={{ fontFamily: "'Noto Sans KR', 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif", fontSize: '13px', lineHeight: '1.9' }}>
      {lines.map((line, lineIdx) => {
        const visible = getVisiblePositions(line, lineIdx, lastIdx, secondLastIdx, isExecution)
        return (
          <div key={lineIdx} style={{ minHeight: '1.8em', whiteSpace: 'pre-wrap' }}>
            {line === '' ? '\u00A0' : [...line].map((ch, j) => {
              if (/\s/.test(ch)) return <span key={j}>{ch}</span>
              if (visible.has(j)) {
                return <span key={j} style={{ color: '#ccccff', fontWeight: 'bold' }}>{ch}</span>
              }
              return (
                <span key={j} style={{
                  display: 'inline-block',
                  width: '0.9em', height: '0.85em',
                  background: '#222233',
                  border: '1px solid #333355',
                  borderRadius: '1px',
                  verticalAlign: 'middle',
                  margin: '0 0.5px',
                }} />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default function NoteWindow({ obj, stageId }) {
  const centralSolved = useGameStore(s => s.centralSolved)
  const prog02Activated = useGameStore(s => s.prog02Activated)
  const [text, setText] = useState('로딩 중...')
  const isRedacted = stageId === 1 && obj.objId === 'NOTE_01' && centralSolved
  const isExecution = isRedacted && prog02Activated

  useEffect(() => {
    getHint(stageId, obj.objId)
      .then((data) => {
        const t = typeof data === 'string' ? data : data.content ?? JSON.stringify(data)
        if (typeof t === 'string' && t.trimStart().startsWith('<')) throw new Error('html')
        setText(t)
      })
      .catch(() => {
        const fallback = FALLBACK_HINTS[stageId]?.[obj.objId]
        setText(fallback || '힌트를 불러올 수 없습니다.')
      })
  }, [stageId, obj.objId])

  return (
    <WindowFrame
      title={`메모장 — ${obj.label}`}
      windowId={obj.objId}
      initialPos={{ x: 250, y: 120 }}
    >
      <div className="note-window">
        {isRedacted
          ? <RedactedText text={text} isExecution={isExecution} />
          : (
            <div className="note-text" style={{ fontFamily: "'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif" }}>
              {text}
            </div>
          )
        }
      </div>
    </WindowFrame>
  )
}
