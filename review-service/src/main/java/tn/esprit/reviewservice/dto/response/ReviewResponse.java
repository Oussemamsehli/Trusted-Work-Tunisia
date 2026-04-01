package tn.esprit.reviewservice.dto.response;

import lombok.*;
import tn.esprit.reviewservice.entity.enums.ReviewType;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;

    private Long reviewerId;
    private Long reviewedUserId;
    private Long contractId;
    private Long recruitmentId;
    private Long phaseId;

    private ReviewType reviewType;

    private String comment;

    private Integer overallRating;
    private Integer qualityRating;
    private Integer communicationRating;
    private Integer deadlineRating;
    private Integer professionalismRating;

    private Boolean isVisible;
    private Boolean isDeleted;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}