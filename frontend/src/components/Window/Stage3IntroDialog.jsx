import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'

const BTN = {
  fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
  fontSize: 11, cursor: 'pointer',
  padding: '4px 16px', border: '1px solid #2a2a4a',
  background: '#1a1a2e', color: '#8888cc', borderRadius: 2,
}

const TITLEBAR = {
  background: '#141428', padding: '5px 10px',
  borderBottom: '1px solid #2a2a4a',
  fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
  fontSize: 11, color: '#556677',
}

function StageSelectScreen() {
  const jumpToStage = useGameStore((s) => s.jumpToStage)
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1200,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 32,
    }}>
      <div style={{
        fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
        fontSize: 11, color: '#445566', letterSpacing: 3,
      }}>
        스테이지 선택
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {[1, 2, 3].map((s) => (
          <button key={s} onClick={() => jumpToStage(s)} style={{
            ...BTN, fontSize: 12, padding: '10px 28px',
          }}>
            STAGE {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Stage3UI() {
  const stage3IntroDismissed = useGameStore((s) => s.stage3IntroDismissed)
  const dismissStage3Intro = useGameStore((s) => s.dismissStage3Intro)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showStageSelect, setShowStageSelect] = useState(false)

  if (showStageSelect) return <StageSelectScreen />

  return (
    <>
      {/* 인트로 다이얼로그 */}
      {!stage3IntroDismissed && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 300, background: '#0a0a16',
            border: '2px solid #2a2a4a', boxShadow: '4px 4px 0 #000',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={TITLEBAR}>시스템 알림</div>

            <div style={{
              padding: '24px 20px',
              fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
              fontSize: 12, color: '#9999bb', lineHeight: 2, textAlign: 'center',
            }}>
              시뮬레이션 결과 이상 없음.<br />
              모든 업무가 끝났습니다.<br />
              업무를 종료해주세요.
            </div>

            <div style={{
              padding: '8px 12px', borderTop: '1px solid #141428',
              display: 'flex', justifyContent: 'flex-end',
            }}>
              <button onClick={dismissStage3Intro} style={BTN}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 좌측 하단 고정 종료 버튼 (이미지) */}
      <div
        onClick={() => setShowConfirm(true)}
        style={{
          position: 'fixed', left: 8, bottom: 8, zIndex: 1001,
          cursor: 'pointer',
        }}
      >
        <img
          src="/exit_btn.png"
          alt="종료"
          style={{
            display: 'block', width: 36, height: 36,
            filter: 'invert(1) opacity(0.5)',
          }}
        />
      </div>

      {/* 종료 확인 다이얼로그 */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 220, background: '#0a0a16',
            border: '2px solid #2a2a4a', boxShadow: '4px 4px 0 #000',
          }}>
            <div style={TITLEBAR}>종료 확인</div>
            <div style={{
              padding: '18px 16px',
              fontFamily: "'Malgun Gothic','맑은 고딕',sans-serif",
              fontSize: 11, color: '#9999bb', textAlign: 'center',
            }}>
              정말 종료하시겠습니까?
            </div>
            <div style={{
              padding: '8px 14px', borderTop: '1px solid #141428',
              display: 'flex', justifyContent: 'flex-end', gap: 8,
            }}>
              <button onClick={() => setShowStageSelect(true)} style={BTN}>예</button>
              <button onClick={() => setShowConfirm(false)} style={BTN}>아니요</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
