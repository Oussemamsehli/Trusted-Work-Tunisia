package tn.esprit.reviewservice.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.Niveau;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class GrowthProfileResponse {

    private Long id;
    private Long userId;
    private Integer xp;
    private Integer level;
    private Niveau niveau;
    private Integer streakDays;
    private Integer longestStreak;
    private LocalDate lastActivityDate;
    private Integer badgesCount;
    private Boolean profileCompleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}