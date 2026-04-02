package tn.esprit.reviewservice.service.impl;

import org.springframework.stereotype.Service;
import tn.esprit.reviewservice.dto.request.TrustScoreRequest;
import tn.esprit.reviewservice.dto.response.TrustScoreResponse;
import tn.esprit.reviewservice.entity.Review;
import tn.esprit.reviewservice.entity.TrustScore;
import tn.esprit.reviewservice.entity.TrustScoreHistory;
import tn.esprit.reviewservice.entity.enums.CategorieConfiance;
import tn.esprit.reviewservice.entity.enums.Tendance;
import tn.esprit.reviewservice.exception.ResourceNotFoundException;
import tn.esprit.reviewservice.mapper.TrustScoreMapper;
import tn.esprit.reviewservice.repository.ReviewRepository;
import tn.esprit.reviewservice.repository.TrustScoreHistoryRepository;
import tn.esprit.reviewservice.repository.TrustScoreRepository;
import tn.esprit.reviewservice.service.interfaces.ITrustScoreService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrustScoreServiceImpl implements ITrustScoreService {

    private final TrustScoreRepository trustScoreRepository;
    private final TrustScoreMapper trustScoreMapper;

    private final ReviewRepository reviewRepository;

    private final TrustScoreHistoryRepository trustScoreHistoryRepository;

    public TrustScoreServiceImpl(
            TrustScoreRepository trustScoreRepository,
            TrustScoreMapper trustScoreMapper,
            TrustScoreHistoryRepository trustScoreHistoryRepository,
            ReviewRepository reviewRepository

    ) {
        this.trustScoreRepository = trustScoreRepository;
        this.trustScoreMapper = trustScoreMapper;
        this.trustScoreHistoryRepository = trustScoreHistoryRepository;
        this.reviewRepository = reviewRepository;

    }

    @Override
    public TrustScoreResponse createTrustScore(TrustScoreRequest request) {
        TrustScore trustScore = trustScoreRepository.findByUserId(request.getUserId())
                .orElse(new TrustScore());

        trustScore.setUserId(request.getUserId());
        trustScore.setScore(request.getScore());
        trustScore.setAverageRating(request.getAverageRating());
        trustScore.setTotalReviews(request.getTotalReviews());
        trustScore.setCategorie(calculateCategorie(request.getScore()));
        trustScore.setTendance(
                request.getTendance() != null ? request.getTendance() : Tendance.STABLE
        );
        trustScore.setPositiveReviews(request.getPositiveReviews());
        trustScore.setNegativeReviews(request.getNegativeReviews());

        TrustScore savedTrustScore = trustScoreRepository.save(trustScore);
        return trustScoreMapper.toResponse(savedTrustScore);
    }

    @Override
    public TrustScoreResponse updateTrustScore(Long id, TrustScoreRequest request) {
        TrustScore existingTrustScore = trustScoreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TrustScore introuvable avec id : " + id));

        existingTrustScore.setUserId(request.getUserId());
        existingTrustScore.setScore(request.getScore());
        existingTrustScore.setAverageRating(request.getAverageRating());
        existingTrustScore.setTotalReviews(request.getTotalReviews());

        existingTrustScore.setCategorie(calculateCategorie(request.getScore()));

        existingTrustScore.setTendance(
                request.getTendance() != null ? request.getTendance() : Tendance.STABLE
        );

        TrustScore updatedTrustScore = trustScoreRepository.save(existingTrustScore);
        return trustScoreMapper.toResponse(updatedTrustScore);
    }

    @Override
    public List<TrustScoreResponse> getAllTrustScores() {
        return trustScoreRepository.findAll()
                .stream()
                .map(trustScoreMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TrustScoreResponse getTrustScoreById(Long id) {
        TrustScore trustScore = trustScoreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TrustScore introuvable avec id : " + id));
        return trustScoreMapper.toResponse(trustScore);
    }

    @Override
    public TrustScoreResponse getTrustScoreByUserId(Long userId) {
        TrustScore trustScore = trustScoreRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("TrustScore introuvable pour userId : " + userId));
        return trustScoreMapper.toResponse(trustScore);
    }

    @Override
    public void deleteTrustScore(Long id) {
        TrustScore trustScore = trustScoreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TrustScore introuvable avec id : " + id));
        trustScoreRepository.delete(trustScore);
    }

    private CategorieConfiance calculateCategorie(Double score) {
        if (score == null) {
            return CategorieConfiance.FAIBLE;
        }

        if (score < 40) {
            return CategorieConfiance.FAIBLE;
        } else if (score < 70) {
            return CategorieConfiance.MOYENNE;
        } else {
            return CategorieConfiance.ELEVEE;
        }
    }


    @Override
    public void recalculateTrustScore(Long userId, Long reviewId) {

        List<Review> reviews = reviewRepository.findByReviewedUserIdAndIsDeletedFalse(userId);

        TrustScore trustScore = trustScoreRepository.findByUserId(userId)
                .orElse(new TrustScore());

        Double oldScore = trustScore.getScore() != null ? trustScore.getScore() : 0.0;

        int totalReviews = reviews.size();

        double averageRating = reviews.stream()
                .map(Review::getOverallRating)
                .filter(rating -> rating != null)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        int positiveReviews = (int) reviews.stream()
                .map(Review::getOverallRating)
                .filter(rating -> rating != null && rating >= 4)
                .count();

        int negativeReviews = (int) reviews.stream()
                .map(Review::getOverallRating)
                .filter(rating -> rating != null && rating <= 2)
                .count();

        double newScore = averageRating * 20.0;

        Tendance tendance;
        if (newScore > oldScore) {
            tendance = Tendance.EN_HAUSSE;
        } else if (newScore < oldScore) {
            tendance = Tendance.EN_BAISSE;
        } else {
            tendance = Tendance.STABLE;
        }

        trustScore.setUserId(userId);
        trustScore.setAverageRating(averageRating);
        trustScore.setTotalReviews(totalReviews);
        trustScore.setPositiveReviews(positiveReviews);
        trustScore.setNegativeReviews(negativeReviews);
        trustScore.setScore(newScore);
        trustScore.setCategorie(calculateCategorie(newScore));
        trustScore.setTendance(tendance);

        TrustScore savedTrustScore = trustScoreRepository.save(trustScore);

        TrustScoreHistory history = TrustScoreHistory.builder()
                .userId(userId)
                .oldScore(oldScore)
                .newScore(savedTrustScore.getScore())
                .reason("Trust score recalculated after review change")
                .reviewId(reviewId)
                .build();

        trustScoreHistoryRepository.save(history);
    }
}