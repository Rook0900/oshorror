package com.pixelhorror.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Entity
@Table(name = "stage")
@Getter @Setter
public class Stage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stage_num")
    private Integer stageNum;

    private String theme;

    @Column(name = "bg_image")
    private String bgImage;

    @OneToMany(mappedBy = "stage", fetch = FetchType.LAZY)
    private List<StageObject> objects;
}
