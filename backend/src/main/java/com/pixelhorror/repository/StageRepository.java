package com.pixelhorror.repository;

import com.pixelhorror.entity.Stage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StageRepository extends JpaRepository<Stage, Long> {
    Optional<Stage> findByStageNum(Integer stageNum);
}
