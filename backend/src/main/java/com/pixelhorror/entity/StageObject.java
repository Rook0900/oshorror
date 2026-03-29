package com.pixelhorror.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "stage_object")
@Getter @Setter
public class StageObject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id")
    private Stage stage;

    @Column(name = "obj_id")
    private String objId;

    @Column(name = "obj_type")
    private String objType;

    @Column(name = "pos_x")
    private Integer posX;

    @Column(name = "pos_y")
    private Integer posY;

    @Column(name = "sprite_key")
    private String spriteKey;
}
