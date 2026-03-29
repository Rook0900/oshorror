package com.pixelhorror.service;

import com.pixelhorror.dto.GameSaveRequestDto;
import com.pixelhorror.dto.GameSaveResponseDto;
import com.pixelhorror.entity.GameSave;
import com.pixelhorror.repository.GameSaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SaveService {

    private final GameSaveRepository gameSaveRepository;

    public GameSaveResponseDto save(GameSaveRequestDto request) {
        GameSave save = new GameSave();
        save.setSessionId(request.getSessionId());
        save.setStageId(request.getStageId());
        save.setStateJson(request.getStateJson());
        save.setSavedAt(LocalDateTime.now());
        GameSave saved = gameSaveRepository.save(save);
        return new GameSaveResponseDto(saved.getSessionId(), saved.getStageId(), saved.getStateJson(), saved.getSavedAt());
    }

    public GameSaveResponseDto load(String sessionId) {
        GameSave save = gameSaveRepository.findTopBySessionIdOrderBySavedAtDesc(sessionId)
            .orElseThrow(() -> new RuntimeException("저장 데이터 없음: " + sessionId));
        return new GameSaveResponseDto(save.getSessionId(), save.getStageId(), save.getStateJson(), save.getSavedAt());
    }
}
