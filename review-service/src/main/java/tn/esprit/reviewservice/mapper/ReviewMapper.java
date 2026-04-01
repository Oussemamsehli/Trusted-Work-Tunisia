package tn.esprit.reviewservice.mapper;

import org.springframework.stereotype.Component;
import tn.esprit.reviewservice.dto.request.ReviewRequest;
import tn.esprit.reviewservice.dto.response.ReviewResponse;
import tn.esprit.reviewservice.entity.Review;

@Component
public class ReviewMapper {

    public Review toEntity(ReviewRequest request) {
        Review review = new Review();
        review.setContractId(request.getContractId());
        review.setReviewerId(request.getReviewerId());
        review.setReviewedUserId(request.getReviewedUserId());
        review.setReviewType(request.getReviewType());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return review;
    }

    public ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .contractId(review.getContractId())
                .reviewerId(review.getReviewerId())
                .reviewedUserId(review.getReviewedUserId())
                .reviewType(review.getReviewType())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}