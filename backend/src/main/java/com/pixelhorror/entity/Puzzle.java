package com.pixelhorror.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "puzzle")
@Getter @Setter
public class Puzzle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stage_id")
    private Long stageId;

    @Column(name = "file_id")
    private String fileId;

    @Column(name = "puzzle_type")
    private String puzzleType;

    @Column(name = "correct_answer", length = 500)
    private String correctAnswer;
}
