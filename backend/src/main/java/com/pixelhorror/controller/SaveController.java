package com.pixelhorror.controller;

import com.pixelhorror.dto.GameSaveRequestDto;
import com.pixelhorror.dto.GameSaveResponseDto;
import com.pixelhorror.service.SaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/save")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@RequiredArgsConstructor
public class SaveController {

    private final SaveService saveService;

    @PostMapping
    public ResponseEntity<GameSaveResponseDto> save(@RequestBody GameSaveRequestDto request) {
        return ResponseEntity.ok(saveService.save(request));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<GameSaveResponseDto> load(@PathVariable String sessionId) {
        return ResponseEntity.ok(saveService.load(sessionId));
    }
}
