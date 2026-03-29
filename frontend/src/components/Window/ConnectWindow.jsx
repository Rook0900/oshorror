import { useState, useEffect } from 'react'

export default function ConnectWindow({ onDownloadComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(iv)
          setTimeout(onDownloadComplete, 500)
          return 100
        }
        return Math.min(100, prev + Math.random() * 4 + 1.5)
      })
    }, 80)
    return () => clearInterval(iv)
  }, [])

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
        <div style={{
          fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
          fontSize: '12px', color: '#aaaacc',
          marginBottom: '10px',
        }}>
          파일 다운로드 중...
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
          <span>{progress >= 100 ? '완료' : '5개 파일 처리 중'}</span>
        </div>
      </div>
    </div>
  )
}
