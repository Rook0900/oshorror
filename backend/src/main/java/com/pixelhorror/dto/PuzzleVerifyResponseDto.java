package com.pixelhorror.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PuzzleVerifyResponseDto {
    private boolean correct;
    private String message;
}
