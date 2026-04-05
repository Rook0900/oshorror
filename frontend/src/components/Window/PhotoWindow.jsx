import WindowFrame from './WindowFrame'

export default function PhotoWindow({ obj }) {
  return (
    <WindowFrame
      title={`사진 — ${obj.label}`}
      windowId={obj.objId}
      initialPos={{ x: 300, y: 150 }}
    >
      <div style={{
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
      }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src="/하현망간문제.png"
            alt="하현망간의 달"
            style={{ maxWidth: 170, maxHeight: 200, display: 'block' }}
          />
          {/* 제미나이 워터마크 가리기 */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 28,
            height: 28,
            background: '#000',
          }} />
        </div>
      </div>
    </WindowFrame>
  )
}
