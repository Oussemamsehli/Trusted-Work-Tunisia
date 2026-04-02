package tn.esprit.reviewservice.service.impl;

import org.springframework.stereotype.Service;
import tn.esprit.reviewservice.dto.request.ReviewRequest;
import tn.esprit.reviewservice.dto.response.ReviewResponse;
import tn.esprit.reviewservice.entity.Review;
import tn.esprit.reviewservice.exception.ResourceNotFoundException;
import tn.esprit.reviewservice.mapper.ReviewMapper;
import tn.esprit.reviewservice.repository.ReviewRepository;
import tn.esprit.reviewservice.service.interfaces.IBadgeAssignmentService;
import tn.esprit.reviewservice.service.interfaces.IReviewService;
import tn.esprit.reviewservice.service.interfaces.ITrustScoreService;
import tn.esprit.reviewservice.dto.request.NotificationRequest;
import tn.esprit.reviewservice.entity.enums.NotificationChannel;
import tn.esprit.reviewservice.entity.enums.NotificationPriority;
import tn.esprit.reviewservice.entity.enums.NotificationType;
import tn.esprit.reviewservice.entity.enums.RelatedEntityType;
import tn.esprit.reviewservice.service.interfaces.INotificationService;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements IReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final ITrustScoreService trustScoreService;
    private final IBadgeAssignmentService badgeAssignmentService;
    private final INotificationService notificationService;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             ReviewMapper reviewMapper,
                             ITrustScoreService trustScoreService,
                             IBadgeAssignmentService badgeAssignmentService,
                             INotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.reviewMapper = reviewMapper;
        this.trustScoreService = trustScoreService;
        this.badgeAssignmentService = badgeAssignmentService;
        this.notificationService = notificationService;
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

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(savedReview.getReviewedUserId())
                        .title("Nouvelle review reçue")
                        .message("Vous avez reçu une nouvelle review sur votre profil.")
                        .type(NotificationType.REVIEW_CREATED)
                        .channel(NotificationChannel.IN_APP)
                        .priority(NotificationPriority.MEDIUM)
                        .relatedEntityType(RelatedEntityType.REVIEW)
                        .relatedEntityId(savedReview.getId())
                        .build()
        );

        trustScoreService.recalculateTrustScore(
                savedReview.getReviewedUserId(),
                savedReview.getId()
        );
        badgeAssignmentService.updateGrowthProfile(savedReview.getReviewedUserId());

        badgeAssignmentService.assignFirstReviewBadge(savedReview.getReviewedUserId());

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

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(updated.getReviewedUserId())
                        .title("Review mise à jour")
                        .message("Une review liée à votre profil a été mise à jour.")
                        .type(NotificationType.SYSTEM)
                        .channel(NotificationChannel.IN_APP)
                        .priority(NotificationPriority.LOW)
                        .relatedEntityType(RelatedEntityType.REVIEW)
                        .relatedEntityId(updated.getId())
                        .build()
        );

        trustScoreService.recalculateTrustScore(
                updated.getReviewedUserId(),
                updated.getId()
        );

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
        review.setIsVisible(false);

        Review deletedReview = reviewRepository.save(review);

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(deletedReview.getReviewedUserId())
                        .title("Review masquée")
                        .message("Une review liée à votre profil n'est plus visible.")
                        .type(NotificationType.SYSTEM)
                        .channel(NotificationChannel.IN_APP)
                        .priority(NotificationPriority.MEDIUM)
                        .relatedEntityType(RelatedEntityType.REVIEW)
                        .relatedEntityId(deletedReview.getId())
                        .build()
        );

        trustScoreService.recalculateTrustScore(
                deletedReview.getReviewedUserId(),
                deletedReview.getId()
        );
    }
}