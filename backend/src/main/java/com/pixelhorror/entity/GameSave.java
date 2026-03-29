package com.pixelhorror.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_save")
@Getter @Setter
public class GameSave {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "stage_id")
    private Long stageId;

    @Column(name = "state_json", columnDefinition = "TEXT")
    private String stateJson;

    @Column(name = "saved_at")
    private LocalDateTime savedAt;
}
