package tn.esprit.reviewservice.mapper;

import org.springframework.stereotype.Component;
import tn.esprit.reviewservice.dto.request.ReviewRequest;
import tn.esprit.reviewservice.dto.response.ReviewResponse;
import tn.esprit.reviewservice.entity.Review;

@Component
public class ReviewMapper {

    public Review toEntity(ReviewRequest request) {
        if (request == null) return null;

        Review review = new Review();

        review.setReviewerId(request.getReviewerId());
        review.setReviewedUserId(request.getReviewedUserId());
        review.setContractId(request.getContractId());
        review.setRecruitmentId(request.getRecruitmentId());
        review.setPhaseId(request.getPhaseId());

        review.setReviewType(request.getReviewType());
        review.setComment(request.getComment());

        review.setOverallRating(request.getOverallRating());
        review.setQualityRating(request.getQualityRating());
        review.setCommunicationRating(request.getCommunicationRating());
        review.setDeadlineRating(request.getDeadlineRating());
        review.setProfessionalismRating(request.getProfessionalismRating());

        return review;
    }

    public ReviewResponse toResponse(Review review) {
        if (review == null) return null;

        return ReviewResponse.builder()
                .id(review.getId())
                .reviewerId(review.getReviewerId())
                .reviewedUserId(review.getReviewedUserId())
                .contractId(review.getContractId())
                .recruitmentId(review.getRecruitmentId())
                .phaseId(review.getPhaseId())
                .reviewType(review.getReviewType())
                .comment(review.getComment())
                .overallRating(review.getOverallRating())
                .qualityRating(review.getQualityRating())
                .communicationRating(review.getCommunicationRating())
                .deadlineRating(review.getDeadlineRating())
                .professionalismRating(review.getProfessionalismRating())
                .isVisible(review.getIsVisible())
                .isDeleted(review.getIsDeleted())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}