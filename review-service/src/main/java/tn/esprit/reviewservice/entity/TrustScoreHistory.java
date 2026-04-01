package tn.esprit.reviewservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "trust_score_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrustScoreHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Double oldScore;

    @Column(nullable = false)
    private Double newScore;

    @Column(nullable = false, length = 500)
    private String reason;

    private Long reviewId;

    private LocalDateTime changedAt;

    @PrePersist
    public void prePersist() {
        this.changedAt = LocalDateTime.now();

        if (this.oldScore == null) {
            this.oldScore = 0.0;
        }

        if (this.newScore == null) {
            this.newScore = 0.0;
        }
    }
}