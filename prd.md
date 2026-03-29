PRD v1.1 — Pixel OS Horror (개발 계획서)
프로젝트명: 도트 퍼즐 공포게임 (Pixel OS Horror)
문서 유형: Product Requirements Document — 실제 개발 계획서
버전: v1.1
작성자: 원당고등학교 2학년
기술 스택: React (Frontend) + Spring Boot (Backend)

1. 프로젝트 개요
1.1 프로젝트 정의
Pixel OS Horror는 실제 OS 바탕화면을 도트(픽셀아트) 그래픽으로 재현하고, 그 안에 배치된 파일·메모장·프로그램 오브젝트 간의 상호작용으로 퍼즐을 해결하는 웹 기반 공포 어드벤처 게임이다. 브라우저에서 바로 실행되며 별도 설치 없이 플레이 가능하다.
1.2 핵심 UX 콘셉트
'소프트웨어와 생활' 수업에서 친숙한 인터페이스가 사용자 행동을 무의식적으로 유도한다는 UI/UX 원리를 학습하던 중, 이를 역이용하면 오히려 강한 공포감을 유발할 수 있다는 역발상 탐구에서 출발했다. OS UI의 친숙함으로 경계심을 낮추고, 예상 밖의 비정상적 반응으로 공포를 극대화한다.
1.3 목표

파일·메모장·프로그램 오브젝트 간 상태 기반 상호작용 시스템 완성
스테이지별 독립 퍼즐 로직 구현 (최소 3스테이지)
마우스 단독 조작 시스템 (키보드 이벤트 완전 차단)
React + Spring Boot 풀스택 구조로 스테이지 데이터 서버 관리


2. 기술 스택 및 아키텍처
2.1 기술 스택
구분기술버전선택 이유FrontendReact18.x컴포넌트 기반 UI, 상태 관리 용이Frontend 상태관리Zustand 또는 Redux Toolkit최신전역 게임 상태(오브젝트 플래그) 관리스타일링CSS Modules + Tailwind-픽셀아트 렌더링 커스텀 CSSBackendSpring Boot3.xREST API, 스테이지 데이터 서버 관리언어 (Backend)Java17 LTSSpring Boot 3 기본 지원데이터베이스H2 (개발) / MySQL (배포)-스테이지·퍼즐·힌트 데이터 저장빌드 도구Vite (FE) / Gradle (BE)-빠른 개발 서버, 표준 빌드API 통신REST API + Axios-스테이지 데이터·정답 검증 요청
2.2 전체 아키텍처
[Browser]
    |
    └── React App (Vite)
         ├── 게임 UI 렌더링 (Canvas + DOM)
         ├── 마우스 이벤트 처리
         ├── 전역 상태 관리 (Zustand)
         └── API 요청 (Axios)
                |
                ↓  REST API (HTTP)
    ┌── Spring Boot Server
    ├── StageController     → 스테이지 데이터 제공
    ├── PuzzleController    → 퍼즐 정답 검증
    ├── SaveController      → 진행 상황 저장/로드
    └── DB (H2 / MySQL)     → 스테이지·힌트·퍼즐 데이터
2.3 API 설계
MethodEndpoint설명GET/api/stages/{stageId}스테이지 오브젝트·배치 데이터 조회GET/api/stages/{stageId}/hint/{noteId}메모장 힌트 텍스트 조회POST/api/stages/{stageId}/puzzle/{fileId}/verify퍼즐 정답 검증GET/api/save/{sessionId}저장된 게임 상태 불러오기POST/api/save현재 게임 상태 저장

3. 프론트엔드 구현 명세
3.1 프로젝트 파일 구조
src/
  components/
    Desktop/
      Desktop.jsx          # 바탕화면 전체 컴포넌트
      DesktopIcon.jsx       # 오브젝트 아이콘 (파일/메모장/프로그램)
    Window/
      WindowFrame.jsx       # 드래그 가능한 창 컴포넌트
      NoteWindow.jsx        # 메모장 창
      PuzzleWindow.jsx      # 파일 퍼즐 창
      ProgramWindow.jsx     # 프로그램 실행 창
    HorrorEvent/
      HorrorOverlay.jsx     # 공포 연출 오버레이
  store/
    gameStore.js            # Zustand 전역 상태 (오브젝트 플래그)
  hooks/
    useDoubleClick.js       # 더블클릭 감지 커스텀 훅
    useDrag.js              # 창 드래그 커스텀 훅
    useStage.js             # 스테이지 데이터 fetch 훅
  api/
    stageApi.js             # Spring Boot API 호출
  styles/
    pixel.css               # 픽셀아트 렌더링 공통 스타일
  App.jsx
  main.jsx
3.2 핵심 구현 로직
더블클릭 감지 커스텀 훅
javascript// hooks/useDoubleClick.js
import { useRef } from 'react';

export function useDoubleClick(onSingleClick, onDoubleClick, delay = 300) {
  const timer = useRef(null);

  return (e) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      onDoubleClick(e);         // 더블클릭 처리
    } else {
      timer.current = setTimeout(() => {
        timer.current = null;
        onSingleClick(e);       // 단일 클릭 처리
      }, delay);
    }
  };
}
창 드래그 커스텀 훅
javascript// hooks/useDrag.js
import { useState, useCallback } from 'react';

export function useDrag(initialPos = { x: 100, y: 100 }) {
  const [pos, setPos] = useState(initialPos);
  const [dragging, setDragging] = useState(false);
  const offset = { x: 0, y: 0 };

  const onMouseDown = useCallback((e) => {
    // 타이틀바 영역에서만 드래그 허용
    if (!e.target.closest('.window-titlebar')) return;
    offset.x = e.clientX - pos.x;
    offset.y = e.clientY - pos.y;
    setDragging(true);
  }, [pos]);

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }, [dragging]);

  const onMouseUp = () => setDragging(false);

  return { pos, onMouseDown, onMouseMove, onMouseUp };
}
키보드 완전 비활성화
javascript// App.jsx - 최상위에서 전역 차단
useEffect(() => {
  const block = (e) => e.preventDefault();
  window.addEventListener('keydown', block);
  window.addEventListener('keyup', block);
  return () => {
    window.removeEventListener('keydown', block);
    window.removeEventListener('keyup', block);
  };
}, []);
Zustand 전역 게임 상태
javascript// store/gameStore.js
import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  currentStage: 1,
  stages: {
    1: {
      NOTE_01: { opened: false },
      FILE_01: { opened: false, solved: false },
      PROG_01: { unlocked: false, executed: false },
    }
  },

  // 파일 퍼즐 해결 시 권한 플래그 ON
  solvePuzzle: (stageId, fileId) => set((state) => ({
    stages: {
      ...state.stages,
      [stageId]: {
        ...state.stages[stageId],
        [fileId]: { ...state.stages[stageId][fileId], solved: true },
        PROG_01: { ...state.stages[stageId].PROG_01, unlocked: true },
      }
    }
  })),

  // 프로그램 실행 권한 확인
  isUnlocked: (stageId, progId) =>
    get().stages[stageId]?.[progId]?.unlocked ?? false,
}));
3.3 픽셀아트 렌더링 CSS 규칙
css/* styles/pixel.css */

/* 픽셀아트 이미지 확대 시 안티앨리어싱 완전 차단 */
.pixel-art {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

/* 픽셀 폰트 적용 */
.pixel-font {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  line-height: 1.8;
}

/* 커서도 도트 커스텀 커서로 교체 */
.desktop {
  cursor: url('/assets/cursor.cur'), auto;
  user-select: none;         /* 텍스트 드래그 방지 */
}
```

---

## 4. 백엔드 구현 명세

### 4.1 프로젝트 패키지 구조
```
src/main/java/com/pixelhorror/
  controller/
    StageController.java      # 스테이지 데이터 API
    PuzzleController.java     # 퍼즐 정답 검증 API
    SaveController.java       # 게임 저장/로드 API
  service/
    StageService.java
    PuzzleService.java
    SaveService.java
  entity/
    Stage.java
    StageObject.java
    Puzzle.java
    HintText.java
    GameSave.java
  repository/
    StageRepository.java
    PuzzleRepository.java
    GameSaveRepository.java
  dto/
    StageResponseDto.java
    PuzzleVerifyRequestDto.java
    PuzzleVerifyResponseDto.java
4.2 핵심 API 구현
스테이지 데이터 조회
java// StageController.java
@RestController
@RequestMapping("/api/stages")
@CrossOrigin(origins = "http://localhost:5173")
public class StageController {

    @GetMapping("/{stageId}")
    public ResponseEntity<StageResponseDto> getStage(@PathVariable Long stageId) {
        StageResponseDto stage = stageService.getStageData(stageId);
        return ResponseEntity.ok(stage);
    }

    @GetMapping("/{stageId}/hint/{noteId}")
    public ResponseEntity<String> getHint(
            @PathVariable Long stageId,
            @PathVariable String noteId) {
        String hint = stageService.getHintText(stageId, noteId);
        return ResponseEntity.ok(hint);
    }
}
퍼즐 정답 검증
java// PuzzleController.java
@PostMapping("/{stageId}/puzzle/{fileId}/verify")
public ResponseEntity<PuzzleVerifyResponseDto> verifyPuzzle(
        @PathVariable Long stageId,
        @PathVariable String fileId,
        @RequestBody PuzzleVerifyRequestDto request) {

    boolean correct = puzzleService.verify(stageId, fileId, request.getAnswer());
    return ResponseEntity.ok(new PuzzleVerifyResponseDto(correct));
}
java// PuzzleService.java
public boolean verify(Long stageId, String fileId, String answer) {
    Puzzle puzzle = puzzleRepository
        .findByStageIdAndFileId(stageId, fileId)
        .orElseThrow(() -> new RuntimeException("퍼즐 없음"));
    return puzzle.getCorrectAnswer().equals(answer.trim());
}
4.3 DB 테이블 설계
sql-- 스테이지 기본 정보
CREATE TABLE stage (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    stage_num   INT NOT NULL,
    theme       VARCHAR(100),
    bg_image    VARCHAR(200)
);

-- 스테이지 내 오브젝트 배치
CREATE TABLE stage_object (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    stage_id    BIGINT REFERENCES stage(id),
    obj_id      VARCHAR(50),   -- 'NOTE_01', 'FILE_01', 'PROG_01'
    obj_type    VARCHAR(20),   -- 'NOTE' | 'FILE' | 'PROGRAM'
    pos_x       INT,
    pos_y       INT,
    sprite_key  VARCHAR(100)
);

-- 힌트 텍스트 (메모장)
CREATE TABLE hint_text (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    stage_id    BIGINT REFERENCES stage(id),
    note_id     VARCHAR(50),
    content     TEXT
);

-- 퍼즐 정답
CREATE TABLE puzzle (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    stage_id       BIGINT REFERENCES stage(id),
    file_id        VARCHAR(50),
    puzzle_type    VARCHAR(50),  -- 'NUMBER_CODE' | 'PATTERN' | 'WORD'
    correct_answer VARCHAR(500)
);

-- 게임 저장
CREATE TABLE game_save (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id   VARCHAR(100),
    stage_id     BIGINT,
    state_json   TEXT,           -- 오브젝트 플래그 JSON 직렬화
    saved_at     DATETIME
);

5. 기능 요구사항 명세
5.1 기능 목록
ID기능명설명우선순위F-01가짜 OS 바탕화면도트 그래픽 바탕화면 렌더링, 오브젝트 아이콘 배치필수F-02마우스 단독 조작키보드 이벤트 전체 차단, 클릭/더블클릭/드래그필수F-03더블클릭 오브젝트 실행더블클릭 시 유형별 창 오픈필수F-04커스텀 창 시스템드래그 이동, 닫기 버튼, Z-order 관리필수F-05메모장 힌트 시스템Spring Boot API에서 힌트 텍스트 fetch필수F-06파일 퍼즐 시스템정답 입력 → Spring Boot 검증 → 권한 플래그 ON필수F-07권한 제어 시스템Zustand 플래그 확인 후 프로그램 실행 허용/거부필수F-08공포 연출 이벤트프로그램 실행 후 스테이지별 공포 오버레이필수F-09스테이지 전환클리어 조건 달성 시 다음 스테이지 로드중요F-10도트 스프라이트 렌더링image-rendering: pixelated CSS로 선명한 픽셀 유지중요F-11게임 저장/로드Spring Boot API로 진행 상황 서버 저장보통F-12효과음Web Audio API로 클릭음·공포음 재생보통

6. 스테이지 설계
스테이지 1 — 빈 사무실
오브젝트: 메모장(NOTE_01) × 1, 파일(FILE_01) × 1, 프로그램(PROG_01) × 1
힌트 흐름: 메모장을 열면 날짜와 숫자가 불규칙하게 나열된 텍스트가 표시된다. 규칙을 찾아 4자리 암호를 도출한다.
퍼즐 유형: 숫자 암호 입력 → /api/stages/1/puzzle/FILE_01/verify 로 서버 검증
권한 조건: FILE_01.solved === true
공포 이벤트: 프로그램 실행 시 화면 전체 암전 + 바탕화면에 이상한 텍스트 렌더링
스테이지 2 — 비정상 시스템
오브젝트: 메모장 × 2, 파일 × 2, 프로그램 × 1
퍼즐 유형: 파일1 기호 패턴 순서 맞추기, 파일2 단어 조합
권한 조건: FILE_01.solved AND FILE_02.solved (두 파일 모두 해결 필요)
공포 이벤트: 오브젝트 아이콘이 이상한 이미지로 교체되고 창 닫기 버튼 비활성화
스테이지 3 — ???
숨겨진 오브젝트 포함, 다단계 복합 퍼즐, 최고 강도 공포 연출. 세부 내용은 스테이지 1·2 완성 후 확정.

7. 테스트 계획
ID테스트 항목입력기대 결과T-01더블클릭 감지300ms 이내 2회 클릭창 정상 오픈T-02키보드 비활성화아무 키 입력아무 반응 없음T-03창 드래그타이틀바 드래그창 위치 이동T-04퍼즐 정답 검증올바른 답 POSTcorrect: true 응답, 플래그 ONT-05퍼즐 오답틀린 답 POSTcorrect: false, 오류 메시지T-06권한 없이 프로그램 실행파일 미해결 상태실행 거부 메시지T-07권한 후 프로그램 실행파일 해결 후 실행공포 이벤트 발동T-08API 연동스테이지 진입Spring Boot에서 오브젝트 데이터 정상 수신

8. 개발 일정 (8주)
주차단계주요 작업산출물1주기획·설계PRD 확정, DB 설계, API 명세 확정PRD v1.1, ERD2주환경 구축React + Vite 세팅, Spring Boot 프로젝트 초기화, CORS 설정개발 환경 완성3주백엔드 기반Stage·Puzzle·HintText Entity, Repository, 기본 API 구현REST API 동작 확인4주프론트 기반바탕화면 UI, 오브젝트 아이콘, 더블클릭·드래그 훅, 키보드 차단기본 인터랙션 동작5주퍼즐 시스템PuzzleWindow, API 연동, Zustand 권한 플래그 흐름 완성스테이지 1 퍼즐 클리어 가능6주공포 연출HorrorOverlay 컴포넌트, 스테이지별 이벤트, 효과음공포 이벤트 정상 동작7주스테이지 완성스테이지 2·3 구현, 저장/로드 API 연동전체 스테이지 클리어 가능8주테스트·마무리전체 플레이 테스트, 버그 수정, 배포 (Vercel + Railway 등)완성 빌드

9. 리스크

React 커스텀 창 시스템 구현 난이도 → 1주차 내 프로토타입으로 검증
Spring Boot CORS 설정 문제 → 개발 초기 환경 구축 단계에서 해결
픽셀아트 그래픽 제작 시간 초과 → 임시 색상 사각형으로 대체 후 기능 우선 완성
스테이지 3 공포 연출 미확정 → 스테이지 1·2 완성 후 아이디어 확정