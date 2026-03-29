package com.pixelhorror.service;

import com.pixelhorror.dto.StageObjectDto;
import com.pixelhorror.dto.StageResponseDto;
import com.pixelhorror.entity.Stage;
import com.pixelhorror.entity.StageObject;
import com.pixelhorror.repository.HintTextRepository;
import com.pixelhorror.repository.StageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StageService {

    private final StageRepository stageRepository;
    private final HintTextRepository hintTextRepository;

    private static final Map<Integer, String> BG_COLORS = Map.of(
        1, "#0d0d1a",
        2, "#1a0d0d"
    );

    private static final Map<String, String> OBJ_LABELS = Map.of(
        "NOTE_01", "메모.txt",
        "NOTE_02", "기록2.txt",
        "FILE_01", "???파일",
        "FILE_02", "암호2",
        "PROG_01", "실행파일.exe"
    );

    public StageResponseDto getStageData(Long stageId) {
        Stage stage = stageRepository.findById(stageId)
            .orElseThrow(() -> new RuntimeException("스테이지 없음: " + stageId));

        List<StageObjectDto> objects = stage.getObjects().stream()
            .map(o -> new StageObjectDto(
                o.getObjId(),
                o.getObjType(),
                o.getPosX(),
                o.getPosY(),
                o.getSpriteKey(),
                OBJ_LABELS.getOrDefault(o.getObjId(), o.getObjId())
            ))
            .toList();

        return new StageResponseDto(
            stage.getId(),
            stage.getStageNum(),
            stage.getTheme(),
            stage.getBgImage(),
            BG_COLORS.getOrDefault(stage.getStageNum(), "#0d0d1a"),
            objects
        );
    }

    public String getHintText(Long stageId, String noteId) {
        return hintTextRepository.findByStageIdAndNoteId(stageId, noteId)
            .map(h -> h.getContent())
            .orElse("힌트를 찾을 수 없습니다.");
    }
}
