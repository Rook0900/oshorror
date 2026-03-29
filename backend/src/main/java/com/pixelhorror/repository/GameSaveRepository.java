package com.pixelhorror.repository;

import com.pixelhorror.entity.GameSave;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GameSaveRepository extends JpaRepository<GameSave, Long> {
    Optional<GameSave> findTopBySessionIdOrderBySavedAtDesc(String sessionId);
}
