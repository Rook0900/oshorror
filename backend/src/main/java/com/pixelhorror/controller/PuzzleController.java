package com.pixelhorror.controller;

import com.pixelhorror.dto.PuzzleVerifyRequestDto;
import com.pixelhorror.dto.PuzzleVerifyResponseDto;
import com.pixelhorror.service.PuzzleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stages")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@RequiredArgsConstructor
public class PuzzleController {

    private final PuzzleService puzzleService;

    @PostMapping("/{stageId}/puzzle/{fileId}/verify")
    public ResponseEntity<PuzzleVerifyResponseDto> verifyPuzzle(
            @PathVariable Long stageId,
            @PathVariable String fileId,
            @RequestBody PuzzleVerifyRequestDto request) {
        boolean correct = puzzleService.verify(stageId, fileId, request.getAnswer());
        String msg = correct ? "정답입니다. 파일 잠금이 해제되었습니다." : "오답입니다. 다시 시도하세요.";
        return ResponseEntity.ok(new PuzzleVerifyResponseDto(correct, msg));
    }
}
