package com.pixelhorror.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class GameSaveResponseDto {
    private String sessionId;
    private Long stageId;
    private String stateJson;
    private LocalDateTime savedAt;
}
