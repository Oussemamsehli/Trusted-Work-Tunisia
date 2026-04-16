package tn.esprit.freelancerprofileservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.freelancerprofileservice.dto.request.AddReviewRequest;
import tn.esprit.freelancerprofileservice.dto.request.ReplyToReviewRequest;
import tn.esprit.freelancerprofileservice.dto.response.ProfileReviewSummaryResponse;
import tn.esprit.freelancerprofileservice.dto.response.ReviewResponse;
import tn.esprit.freelancerprofileservice.entities.FreelancerProfile;
import tn.esprit.freelancerprofileservice.entities.ProfileReview;
import tn.esprit.freelancerprofileservice.enums.ReviewStatus;
import tn.esprit.freelancerprofileservice.exceptions.DuplicateResourceException;
import tn.esprit.freelancerprofileservice.exceptions.InvalidDataException;
import tn.esprit.freelancerprofileservice.exceptions.ResourceNotFoundException;
import tn.esprit.freelancerprofileservice.repositories.FreelancerProfileRepository;
import tn.esprit.freelancerprofileservice.repositories.ProfileReviewRepository;

import java.util.List;

/**
 * Implémentation du service des avis clients.
 *
 * Fonctionnalités :
 * - ajout d'avis
 * - blocage auto-review
 * - blocage doublon review
 * - récupération des reviews visibles
 * - calcul de la moyenne
 * - résumé statistique
 * - réponse du freelancer
 * - flag automatique des reviews incohérentes
 */
@Service
@RequiredArgsConstructor
public class ProfileReviewServiceImpl implements IProfileReviewService {

    private final ProfileReviewRepository reviewRepository;
    private final FreelancerProfileRepository profileRepository;
    private final ReviewAnalysisService reviewAnalysisService;

    @Override
    public ReviewResponse addReview(Long profileId, AddReviewRequest request) {
        FreelancerProfile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil", profileId));

        if (profile.getUserId() != null && profile.getUserId().equals(request.getClientId())) {
            throw new InvalidDataException("Vous ne pouvez pas laisser un avis sur votre propre profil");
        }

        if (reviewRepository.existsByClientIdAndProfileId(request.getClientId(), profileId)) {
            throw new DuplicateResourceException("Vous avez déjà laissé un avis sur ce profil");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new InvalidDataException("La note doit être entre 1 et 5");
        }

        ReviewAnalysisResult analysisResult =
                reviewAnalysisService.analyze(request.getRating(), request.getComment());

        ProfileReview review = ProfileReview.builder()
                .clientId(request.getClientId())
                .profile(profile)
                .rating(request.getRating())
                .comment(request.getComment())
                .status(ReviewStatus.VISIBLE)
                .flagged(analysisResult.isFlagged())
                .flagReason(analysisResult.getFlagReason())
                .build();

        ProfileReview savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview);
    }

    @Override
    public List<ReviewResponse> getVisibleReviews(Long profileId) {
        ensureProfileExists(profileId);

        return reviewRepository
                .findByProfileIdAndStatusOrderByReviewedAtDesc(profileId, ReviewStatus.VISIBLE)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public Double getAverageRating(Long profileId) {
        ensureProfileExists(profileId);

        Double avg = reviewRepository.findAverageRatingByProfileId(profileId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    @Override
    public ProfileReviewSummaryResponse getReviewSummary(Long profileId) {
        ensureProfileExists(profileId);

        long totalReviews = reviewRepository.countByProfileIdAndStatus(profileId, ReviewStatus.VISIBLE);
        double averageRating = getAverageRating(profileId);

        long fiveStarCount = reviewRepository.countByProfileIdAndRatingAndStatus(profileId, 5, ReviewStatus.VISIBLE);
        long fourStarCount = reviewRepository.countByProfileIdAndRatingAndStatus(profileId, 4, ReviewStatus.VISIBLE);
        long threeStarCount = reviewRepository.countByProfileIdAndRatingAndStatus(profileId, 3, ReviewStatus.VISIBLE);
        long twoStarCount = reviewRepository.countByProfileIdAndRatingAndStatus(profileId, 2, ReviewStatus.VISIBLE);
        long oneStarCount = reviewRepository.countByProfileIdAndRatingAndStatus(profileId, 1, ReviewStatus.VISIBLE);

        return ProfileReviewSummaryResponse.builder()
                .profileId(profileId)
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .fiveStarCount(fiveStarCount)
                .fourStarCount(fourStarCount)
                .threeStarCount(threeStarCount)
                .twoStarCount(twoStarCount)
                .oneStarCount(oneStarCount)
                .build();
    }

    @Override
    public ReviewResponse replyToReview(Long reviewId, Long freelancerUserId, ReplyToReviewRequest request) {
        ProfileReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Avis", reviewId));

        FreelancerProfile profile = review.getProfile();

        if (profile.getUserId() == null || !profile.getUserId().equals(freelancerUserId)) {
            throw new InvalidDataException("Vous n'êtes pas autorisé à répondre à cet avis");
        }

        review.setFreelancerReply(request.getReply());

        ProfileReview updatedReview = reviewRepository.save(review);
        return mapToResponse(updatedReview);
    }

    private void ensureProfileExists(Long profileId) {
        if (!profileRepository.existsById(profileId)) {
            throw new ResourceNotFoundException("Profil", profileId);
        }
    }

    private ReviewResponse mapToResponse(ProfileReview review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .clientId(review.getClientId())
                .rating(review.getRating())
                .comment(review.getComment())
                .freelancerReply(review.getFreelancerReply())
                .flagged(review.getFlagged())
                .flagReason(review.getFlagReason())
                .status(review.getStatus())
                .reviewedAt(review.getReviewedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}