package com.pixelhorror.repository;

import com.pixelhorror.entity.Puzzle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PuzzleRepository extends JpaRepository<Puzzle, Long> {
    Optional<Puzzle> findByStageIdAndFileId(Long stageId, String fileId);
}
