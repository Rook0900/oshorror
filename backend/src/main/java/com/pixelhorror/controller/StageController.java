package com.pixelhorror.controller;

import com.pixelhorror.dto.StageResponseDto;
import com.pixelhorror.service.StageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stages")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@RequiredArgsConstructor
public class StageController {

    private final StageService stageService;

    @GetMapping("/{stageId}")
    public ResponseEntity<StageResponseDto> getStage(@PathVariable Long stageId) {
        return ResponseEntity.ok(stageService.getStageData(stageId));
    }

    @GetMapping("/{stageId}/hint/{noteId}")
    public ResponseEntity<String> getHint(
            @PathVariable Long stageId,
            @PathVariable String noteId) {
        return ResponseEntity.ok(stageService.getHintText(stageId, noteId));
    }
}
