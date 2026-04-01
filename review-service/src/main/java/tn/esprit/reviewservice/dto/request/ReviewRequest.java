package tn.esprit.reviewservice.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import tn.esprit.reviewservice.entity.enums.ReviewType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRequest {

    @NotNull(message = "reviewerId est obligatoire")
    private Long reviewerId;

    @NotNull(message = "reviewedUserId est obligatoire")
    private Long reviewedUserId;

    @NotNull(message = "contractId est obligatoire")
    private Long contractId;

    @NotNull(message = "recruitmentId est obligatoire")
    private Long recruitmentId;

    private Long phaseId;

    @NotNull(message = "reviewType est obligatoire")
    private ReviewType reviewType;

    @Size(max = 2000, message = "Le commentaire ne doit pas dépasser 2000 caractères")
    private String comment;

    @NotNull(message = "overallRating est obligatoire")
    @Min(value = 1, message = "overallRating doit être >= 1")
    @Max(value = 5, message = "overallRating doit être <= 5")
    private Integer overallRating;

    @NotNull(message = "qualityRating est obligatoire")
    @Min(value = 1, message = "qualityRating doit être >= 1")
    @Max(value = 5, message = "qualityRating doit être <= 5")
    private Integer qualityRating;

    @NotNull(message = "communicationRating est obligatoire")
    @Min(value = 1, message = "communicationRating doit être >= 1")
    @Max(value = 5, message = "communicationRating doit être <= 5")
    private Integer communicationRating;

    @NotNull(message = "deadlineRating est obligatoire")
    @Min(value = 1, message = "deadlineRating doit être >= 1")
    @Max(value = 5, message = "deadlineRating doit être <= 5")
    private Integer deadlineRating;

    @NotNull(message = "professionalismRating est obligatoire")
    @Min(value = 1, message = "professionalismRating doit être >= 1")
    @Max(value = 5, message = "professionalismRating doit être <= 5")
    private Integer professionalismRating;
}