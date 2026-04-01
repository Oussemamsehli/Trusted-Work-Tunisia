package tn.esprit.reviewservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.CategorieBadge;
import tn.esprit.reviewservice.entity.enums.Rarete;

@Entity
@Table(name = "badges")
@Getter
@Setter
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategorieBadge categorie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rarete rarete;

    private Integer points;
}