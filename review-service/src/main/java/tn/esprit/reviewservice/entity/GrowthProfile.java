package tn.esprit.reviewservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.Niveau;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "growth_profiles")
@Getter
@Setter
public class GrowthProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private Integer xp;

    @Column(nullable = false)
    private Integer level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Niveau niveau;

    @Column(nullable = false)
    private Integer streakDays;

    @Column(nullable = false)
    private Integer longestStreak;

    private LocalDate lastActivityDate;

    @Column(nullable = false)
    private Integer badgesCount;

    @Column(nullable = false)
    private Boolean profileCompleted;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        if (this.xp == null) this.xp = 0;
        if (this.level == null) this.level = 1;
        if (this.niveau == null) this.niveau = Niveau.DEBUTANT;
        if (this.streakDays == null) this.streakDays = 0;
        if (this.longestStreak == null) this.longestStreak = 0;
        if (this.badgesCount == null) this.badgesCount = 0;
        if (this.profileCompleted == null) this.profileCompleted = false;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}