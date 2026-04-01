package tn.esprit.reviewservice.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.ReviewType;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ReviewResponse {

    private Long id;
    private Long contractId;
    private Long reviewerId;
    private Long reviewedUserId;
    private ReviewType reviewType;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}