import { useEffect, useState } from 'react'
import WindowFrame from './WindowFrame'
import { getHint } from '../../api/stageApi'

// 서버 오류 시 사용할 fallback 힌트
const FALLBACK_HINTS = {
  1: {
    NOTE_01: `벽 속 깊은 곳에서 들리지 않는 흐름이 꿈틀거린다.
그 길을 따라가면, 어둠을 찢고 빛이 깨어날 것이다.`,
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

  useEffect(() => {
    getHint(stageId, obj.objId)
      .then((data) => {
        const text = typeof data === 'string' ? data : data.content ?? JSON.stringify(data)
        // HTML 응답(서버 미실행 시 Vite fallback)이면 에러 처리
        if (typeof text === 'string' && text.trimStart().startsWith('<')) throw new Error('html')
        setText(text)
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
        <div className="note-text">
          {text}
        </div>
      </div>
    </WindowFrame>
  )
}
