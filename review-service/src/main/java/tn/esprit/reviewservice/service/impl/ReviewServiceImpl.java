package tn.esprit.reviewservice.service.impl;

import org.springframework.stereotype.Service;
import tn.esprit.reviewservice.dto.request.ReviewRequest;
import tn.esprit.reviewservice.dto.response.ReviewResponse;
import tn.esprit.reviewservice.entity.Review;
import tn.esprit.reviewservice.exception.ResourceNotFoundException;
import tn.esprit.reviewservice.mapper.ReviewMapper;
import tn.esprit.reviewservice.repository.ReviewRepository;
import tn.esprit.reviewservice.service.interfaces.IReviewService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements IReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    public ReviewServiceImpl(ReviewRepository reviewRepository, ReviewMapper reviewMapper) {
        this.reviewRepository = reviewRepository;
        this.reviewMapper = reviewMapper;
    }

    @Override
    public ReviewResponse createReview(ReviewRequest request) {

        boolean exists = reviewRepository
                .existsByContractIdAndReviewerIdAndIsDeletedFalse(
                        request.getContractId(),
                        request.getReviewerId()
                );

        if (exists) {
            throw new RuntimeException("Review déjà existante pour ce contrat");
        }

        Review review = reviewMapper.toEntity(request);
        review.setIsDeleted(false);
        review.setIsVisible(true);

        Review savedReview = reviewRepository.save(review);
        return reviewMapper.toResponse(savedReview);
    }

    @Override
    public ReviewResponse updateReview(Long id, ReviewRequest request) {

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review introuvable"));

        review.setComment(request.getComment());
        review.setOverallRating(request.getOverallRating());
        review.setQualityRating(request.getQualityRating());
        review.setCommunicationRating(request.getCommunicationRating());
        review.setDeadlineRating(request.getDeadlineRating());
        review.setProfessionalismRating(request.getProfessionalismRating());

        Review updated = reviewRepository.save(review);
        return reviewMapper.toResponse(updated);
    }

    @Override
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewResponse getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review introuvable avec id : " + id));
        return reviewMapper.toResponse(review);
    }

    @Override
    public void deleteReview(Long id) {

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review introuvable"));

        review.setIsDeleted(true);

        reviewRepository.save(review);
    }
}