import { useEffect, useState, useRef } from 'react'
import WindowFrame from './WindowFrame'
import { getHint } from '../../api/stageApi'

const GLITCH_CHARS = '▓▒░█▄▀■□▪▫◆◇○●※§¶†‡#@%&*!?/\\|~^`<>{}[]░▒▓'

// 남길 글자: { line, char } — char 음수면 끝에서부터
const KEEP_POSITIONS = [
  { line: 0,  char: 0  },  // 본
  { line: 0,  char: -2 },  // 다
  { line: 1,  char: 3  },  // 면
  { line: 1,  char: 10 },  // i
  { line: 10, char: 0  },  // u
  { line: 10, char: 8  },  // 8
  { line: 11, char: 3  },  // t
]

function corruptText(text) {
  const lines = text.split('\n')
  return lines.map((line, li) => {
    const keeps = KEEP_POSITIONS
      .filter(k => k.line === li)
      .map(k => k.char < 0 ? line.length + k.char : k.char)
    return line.split('').map((ch, ci) => {
      if (keeps.includes(ci)) return ch
      return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
    }).join('')
  }).join('\n')
}

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
    NOTE_01: `[파일1 힌트]

△ ○ □ △
○ □ △ ○
□ △ ○ □

패턴을 찾아라.
첫 번째 줄의 순서가 답이다.
1=△, 2=○, 3=□`,
    NOTE_02: `[파일2 힌트]

S _ A _ O W
공포의 _ _ _ _ _ _
빈 칸을 채워라.

힌트: 어둠이 드리운 것`,
  },
}

export default function NoteWindow({ obj, stageId }) {
  const [text, setText] = useState('로딩 중...')
  const [displayText, setDisplayText] = useState('로딩 중...')
  const isCorrupted = stageId === 1 && obj.objId === 'NOTE_01'
  const ivRef = useRef(null)

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

  useEffect(() => {
    if (!isCorrupted) { setDisplayText(text); return }
    setDisplayText(corruptText(text))
    ivRef.current = setInterval(() => {
      setDisplayText(corruptText(text))
    }, 120)
    return () => clearInterval(ivRef.current)
  }, [text, isCorrupted])

  return (
    <WindowFrame
      title={`메모장 — ${obj.label}`}
      windowId={obj.objId}
      initialPos={{ x: 250, y: 120 }}
    >
      <div className="note-window">
        <div className="note-text" style={{
          fontFamily: isCorrupted ? "'Courier New',monospace" : "'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif",
          letterSpacing: isCorrupted ? '0.05em' : undefined,
        }}>
          {displayText}
        </div>
      </div>
    </WindowFrame>
  )
}
