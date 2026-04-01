package tn.esprit.reviewservice.entity;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.reviewservice.entity.enums.CategorieConfiance;
import tn.esprit.reviewservice.entity.enums.Tendance;

import java.time.LocalDateTime;

@Entity
@Table(name = "trust_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrustScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private Double score;

    @Column(nullable = false)
    private Double averageRating;

    @Column(nullable = false)
    private Integer totalReviews;

    @Column(nullable = false)
    private Integer positiveReviews;

    @Column(nullable = false)
    private Integer negativeReviews;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategorieConfiance categorie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Tendance tendance;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.score == null) {
            this.score = 0.0;
        }

        if (this.averageRating == null) {
            this.averageRating = 0.0;
        }

        if (this.totalReviews == null) {
            this.totalReviews = 0;
        }

        if (this.positiveReviews == null) {
            this.positiveReviews = 0;
        }

        if (this.negativeReviews == null) {
            this.negativeReviews = 0;
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