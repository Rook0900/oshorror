package com.pixelhorror.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class StageResponseDto {
    private Long id;
    private Integer stageNum;
    private String theme;
    private String bgImage;
    private String bgColor;
    private List<StageObjectDto> objects;
}
