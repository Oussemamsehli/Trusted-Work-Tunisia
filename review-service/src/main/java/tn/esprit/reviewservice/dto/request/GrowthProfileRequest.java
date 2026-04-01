package tn.esprit.reviewservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.Niveau;

import java.time.LocalDate;

@Getter
@Setter
public class GrowthProfileRequest {

    @NotNull(message = "userId est obligatoire")
    private Long userId;

    @NotNull(message = "xp est obligatoire")
    @Min(value = 0, message = "xp doit être >= 0")
    private Integer xp;

    @NotNull(message = "level est obligatoire")
    @Min(value = 1, message = "level doit être >= 1")
    private Integer level;

    @NotNull(message = "niveau est obligatoire")
    private Niveau niveau;

    @NotNull(message = "streakDays est obligatoire")
    @Min(value = 0, message = "streakDays doit être >= 0")
    private Integer streakDays;

    @NotNull(message = "longestStreak est obligatoire")
    @Min(value = 0, message = "longestStreak doit être >= 0")
    private Integer longestStreak;

    private LocalDate lastActivityDate;

    @NotNull(message = "badgesCount est obligatoire")
    @Min(value = 0, message = "badgesCount doit être >= 0")
    private Integer badgesCount;

    @NotNull(message = "profileCompleted est obligatoire")
    private Boolean profileCompleted;
}