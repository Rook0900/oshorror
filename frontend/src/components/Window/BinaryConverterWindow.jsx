import { useState } from 'react'
import WindowFrame from './WindowFrame'

export default function BinaryConverterWindow({ obj }) {
  const [bits, setBits] = useState([0, 0, 0, 0])

  const decimal = bits.reduce((acc, b, i) => acc + b * Math.pow(2, 3 - i), 0)

  const toggle = (i) => setBits(prev => prev.map((b, k) => k === i ? (b === 1 ? 0 : 1) : b))

  const reset = () => setBits([0, 0, 0, 0])

  return (
    <WindowFrame title="이진수 변환기" windowId={obj.objId} initialPos={{ x: 320, y: 100 }}>
      <div style={{ padding: '20px 18px 14px', background: '#06060f' }}>

        {/* 비트 버튼 */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {bits.map((bit, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{
                width: 36, height: 36,
                background: bit === 1 ? '#1a3a5a' : '#0a0a16',
                border: `1px solid ${bit === 1 ? '#3a6a9a' : '#2a2a4a'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', borderRadius: 2,
                color: bit === 1 ? '#7ab8e8' : '#334455',
                fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold',
                userSelect: 'none',
              }}
            >
              {bit}
            </div>
          ))}
        </div>

        {/* 결과 */}
        <div style={{
          marginTop: 14, textAlign: 'center',
          fontFamily: 'monospace', fontSize: 22, color: '#8899aa', letterSpacing: 2,
        }}>
          = {decimal}
        </div>

        {/* 초기화 */}
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              fontFamily: 'monospace', fontSize: 9, cursor: 'pointer',
              padding: '3px 12px', border: '1px solid #2a2a4a',
              background: '#0a0a18', color: '#556677', borderRadius: 2,
            }}
          >
            초기화
          </button>
        </div>
      </div>
    </WindowFrame>
  )
}
