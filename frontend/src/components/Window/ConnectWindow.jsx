import { useState, useEffect, useRef } from 'react'

export default function ConnectWindow({ onDownloadComplete }) {
  const [progress, setProgress] = useState(0)
  const [started, setStarted] = useState(false)
  const ivRef = useRef(null)

  useEffect(() => {
    if (!started) return
    ivRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(ivRef.current)
          setTimeout(onDownloadComplete, 500)
          return 100
        }
        return Math.min(100, prev + Math.random() * 4 + 1.5)
      })
    }, 80)
    return () => clearInterval(ivRef.current)
  }, [started])

  return (
    <div style={{
      position: 'fixed',
      left: '50%', top: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 220,
      width: 280,
      background: '#0a0a14',
      border: '2px solid #3a3a5a',
      boxShadow: '4px 4px 0 #000',
    }}>
      <div style={{
        background: '#14142a',
        padding: '5px 12px',
        borderBottom: '1px solid #2a2a3a',
        fontFamily: "'Segoe UI','Malgun Gothic',sans-serif",
        fontSize: '11px', color: '#888',
      }}>
        파일 수신 중
      </div>

      <div style={{ padding: '16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <img src="/folder_icon.svg" width="32" height="32" />
          <span style={{
            fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
            fontSize: '12px', color: '#aaaacc',
          }}>{started ? '파일 다운로드 중...' : '파일 수신 대기 중'}</span>
        </div>

        <div style={{ height: '6px', background: '#111', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: progress >= 100 ? '#2a7a2a' : '#2244aa',
            transition: 'width 0.08s, background 0.3s',
            borderRadius: '3px',
          }} />
        </div>

        <div style={{
          marginTop: '6px',
          display: 'flex', justifyContent: 'space-between',
          fontFamily: "monospace", fontSize: '10px', color: '#445566',
        }}>
          <span>{Math.floor(progress)}%</span>
          <span>{progress >= 100 ? '완료' : started ? '5개 파일 처리 중' : '대기'}</span>
        </div>

        {!started && (
          <button
            onClick={() => setStarted(true)}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '5px 0',
              background: '#1a1a3a',
              border: '1px solid #3a3a6a',
              color: '#aaaaff',
              fontFamily: 'monospace',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            다운로드
          </button>
        )}
      </div>
    </div>
  )
}
