package tn.esprit.reviewservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.CategorieConfiance;
import tn.esprit.reviewservice.entity.enums.Tendance;

import java.time.LocalDateTime;

@Entity
@Table(name = "trust_scores")
@Getter
@Setter
public class TrustScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    private Double score;

    private Double averageRating;

    private Integer totalReviews;

    @Enumerated(EnumType.STRING)
    private CategorieConfiance categorie;

    @Enumerated(EnumType.STRING)
    private Tendance tendance;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.updatedAt = LocalDateTime.now();

        if (this.score == null) {
            this.score = 0.0;
        }

        if (this.averageRating == null) {
            this.averageRating = 0.0;
        }

        if (this.totalReviews == null) {
            this.totalReviews = 0;
        }

        if (this.tendance == null) {
            this.tendance = Tendance.STABLE;
        }

        if (this.categorie == null) {
            this.categorie = CategorieConfiance.FAIBLE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}