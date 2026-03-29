package com.pixelhorror.service;

import com.pixelhorror.entity.Puzzle;
import com.pixelhorror.repository.PuzzleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PuzzleService {

    private final PuzzleRepository puzzleRepository;

    public boolean verify(Long stageId, String fileId, String answer) {
        Puzzle puzzle = puzzleRepository.findByStageIdAndFileId(stageId, fileId)
            .orElseThrow(() -> new RuntimeException("퍼즐 없음: stage=" + stageId + " file=" + fileId));
        return puzzle.getCorrectAnswer().equalsIgnoreCase(answer.trim());
    }
}
