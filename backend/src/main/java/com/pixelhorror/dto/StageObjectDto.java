package com.pixelhorror.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StageObjectDto {
    private String objId;
    private String objType;
    private Integer posX;
    private Integer posY;
    private String spriteKey;
    private String label;
}
