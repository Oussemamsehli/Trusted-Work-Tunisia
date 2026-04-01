package tn.esprit.reviewservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.MotifReclamation;
import tn.esprit.reviewservice.entity.enums.StatusReclamation;

import java.time.LocalDateTime;

@Entity
@Table(name = "reclamations")
@Getter
@Setter
public class Reclamation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @Column(nullable = false)
    private Long reportedByUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MotifReclamation motif;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusReclamation status;

    @Column(length = 1000)
    private String adminComment;

    private Long processedByAdminId;

    private LocalDateTime processedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = StatusReclamation.PENDING;
        }
    }
}