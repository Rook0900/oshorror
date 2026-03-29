package com.pixelhorror.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "hint_text")
@Getter @Setter
public class HintText {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stage_id")
    private Long stageId;

    @Column(name = "note_id")
    private String noteId;

    @Column(columnDefinition = "TEXT")
    private String content;
}
