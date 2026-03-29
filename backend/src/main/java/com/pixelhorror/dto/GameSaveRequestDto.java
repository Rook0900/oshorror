package com.pixelhorror.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GameSaveRequestDto {
    private String sessionId;
    private Long stageId;
    private String stateJson;
}
