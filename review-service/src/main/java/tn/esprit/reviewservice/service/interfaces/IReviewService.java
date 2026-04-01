package tn.esprit.reviewservice.service.interfaces;

import tn.esprit.reviewservice.dto.request.ReviewRequest;
import tn.esprit.reviewservice.dto.response.ReviewResponse;

import java.util.List;

public interface IReviewService {

    ReviewResponse createReview(ReviewRequest request);

    ReviewResponse updateReview(Long id, ReviewRequest request);

    List<ReviewResponse> getAllReviews();

    ReviewResponse getReviewById(Long id);

    void deleteReview(Long id);
}