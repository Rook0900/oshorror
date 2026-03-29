package com.pixelhorror.repository;

import com.pixelhorror.entity.HintText;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HintTextRepository extends JpaRepository<HintText, Long> {
    Optional<HintText> findByStageIdAndNoteId(Long stageId, String noteId);
}
