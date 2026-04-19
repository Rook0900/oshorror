-- 스테이지 1
INSERT INTO stage (id, stage_num, theme, bg_image) VALUES (1, 1, '빈 사무실', 'stage1_bg');
INSERT INTO stage (id, stage_num, theme, bg_image) VALUES (2, 2, '비정상 시스템', 'stage2_bg');

-- 스테이지 1 오브젝트
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (1, 1, 'NOTE_01', 'NOTE', 80, 80, 'note');
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (2, 1, 'PROG_01', 'PROGRAM', 80, 200, 'prog');
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (3, 1, 'FILE_01', 'FILE', 80, 320, 'file');
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (13, 1, 'PROG_02', 'PROGRAM', 220, 200, 'prog');

-- 스테이지 2 오브젝트
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (4, 2, 'NOTE_01', 'NOTE', 80, 80, 'note');
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (5, 2, 'NOTE_02', 'NOTE', 80, 200, 'note');
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (6, 2, 'FILE_01', 'FILE', 80, 320, 'file');
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (7, 2, 'FILE_02', 'FILE', 200, 320, 'file');
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (8, 2, 'PROG_01', 'PROGRAM', 200, 80, 'prog');

-- 힌트 텍스트
INSERT INTO hint_text (id, stage_id, note_id, content)
VALUES (1, 1, 'NOTE_01',
'본 기기를 통해 중앙관리장치에 접근이 가능합니다.
바탕화면에 위치한 interactive 파일은 접근 상태를 제어하는 역할을 합니다.

해당 파일을 실행하면 시스템의 중심 관리 기능이 자동으로 활성화되어
전체 흐름을 안정적으로 조율합니다.

사용자는 매달 중요 설비의 연결 상태를 검토해야 하며,
필요 시 제공된 주소값을 참고하여 관리 절차를 진행하시기 바랍니다.

중요 설비 주소값:
u_888nt.exe, Luna
bolt, belle');

INSERT INTO hint_text (id, stage_id, note_id, content)
VALUES (2, 2, 'NOTE_01',
'===========================================

중앙관리장치로 인해 패킷 소스가 전송 되었습니다.
monitoring으로 인해 직접 관측이 가능합니다.

===========================================');

INSERT INTO hint_text (id, stage_id, note_id, content)
VALUES (3, 2, 'NOTE_02',
'[파일2 힌트]

S _ A _ O W
공포의 _ _ _ _ _ _
빈 칸을 채워라.

힌트: 어둠이 드리운 것');

-- 스테이지 3
INSERT INTO stage (id, stage_num, theme, bg_image) VALUES (3, 3, 'centralkeeper', 'stage3_bg');

-- 스테이지 3 오브젝트
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (9, 3, 'NOTE_01', 'NOTE', 80, 80, 'note');
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (10, 3, 'FILE_01', 'FILE', 80, 200, 'file');
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (11, 3, 'PROG_01', 'PROGRAM', 80, 320, 'prog');
INSERT INTO stage_object (id, stage_id, obj_id, obj_type, pos_x, pos_y, sprite_key)
VALUES (12, 3, 'PROG_02', 'PROGRAM', 220, 320, 'prog');

-- 스테이지 3 힌트
INSERT INTO hint_text (id, stage_id, note_id, content)
VALUES (4, 3, 'NOTE_01',
'벽 속 깊은 곳에서 들리지 않는 흐름이 꿈틀거린다.
그 길을 따라가면, 어둠을 찢고 빛이 깨어날 것이다.');

-- 퍼즐 정답
INSERT INTO puzzle (id, stage_id, file_id, puzzle_type, correct_answer)
VALUES (1, 1, 'FILE_01', 'WIRE', '111111');

INSERT INTO puzzle (id, stage_id, file_id, puzzle_type, correct_answer)
VALUES (2, 2, 'FILE_01', 'PATTERN', '1213');

INSERT INTO puzzle (id, stage_id, file_id, puzzle_type, correct_answer)
VALUES (3, 2, 'FILE_02', 'WORD', 'SHADOW');

-- 스테이지 3 퍼즐 (전기선 — 모든 불 켜기)
INSERT INTO puzzle (id, stage_id, file_id, puzzle_type, correct_answer)
VALUES (4, 3, 'FILE_01', 'WIRE', '111111');
