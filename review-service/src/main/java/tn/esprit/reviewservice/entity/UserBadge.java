package tn.esprit.reviewservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_badges")
@Getter
@Setter
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(nullable = false, updatable = false)
    private LocalDateTime awardedAt;

    @PrePersist
    public void prePersist() {
        this.awardedAt = LocalDateTime.now();
    }
}