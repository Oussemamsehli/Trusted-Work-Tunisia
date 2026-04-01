package tn.esprit.reviewservice.entity;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.reviewservice.entity.enums.ReviewType;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long reviewerId;

    @Column(nullable = false)
    private Long reviewedUserId;

    @Column(nullable = false)
    private Long contractId;

    @Column(nullable = false)
    private Long recruitmentId;

    private Long phaseId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewType reviewType;

    @Column(length = 2000)
    private String comment;

    @Column(nullable = false)
    private Integer overallRating;

    @Column(nullable = false)
    private Integer qualityRating;

    @Column(nullable = false)
    private Integer communicationRating;

    @Column(nullable = false)
    private Integer deadlineRating;

    @Column(nullable = false)
    private Integer professionalismRating;

    @Column(nullable = false)
    private Boolean isVisible;

    @Column(nullable = false)
    private Boolean isDeleted;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.isVisible == null) {
            this.isVisible = true;
        }

        if (this.isDeleted == null) {
            this.isDeleted = false;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}