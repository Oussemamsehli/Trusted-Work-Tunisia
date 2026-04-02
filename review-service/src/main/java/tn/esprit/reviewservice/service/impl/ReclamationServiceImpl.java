package tn.esprit.reviewservice.service.impl;

import org.springframework.stereotype.Service;
import tn.esprit.reviewservice.dto.request.ReclamationRequest;
import tn.esprit.reviewservice.dto.response.ReclamationResponse;
import tn.esprit.reviewservice.entity.Reclamation;
import tn.esprit.reviewservice.entity.Review;
import tn.esprit.reviewservice.entity.enums.StatusReclamation;
import tn.esprit.reviewservice.exception.ResourceNotFoundException;
import tn.esprit.reviewservice.mapper.ReclamationMapper;
import tn.esprit.reviewservice.repository.ReclamationRepository;
import tn.esprit.reviewservice.repository.ReviewRepository;
import tn.esprit.reviewservice.service.interfaces.IReclamationService;
import tn.esprit.reviewservice.service.interfaces.ITrustScoreService;
import tn.esprit.reviewservice.dto.request.NotificationRequest;
import tn.esprit.reviewservice.entity.enums.NotificationChannel;
import tn.esprit.reviewservice.entity.enums.NotificationPriority;
import tn.esprit.reviewservice.entity.enums.NotificationType;
import tn.esprit.reviewservice.entity.enums.RelatedEntityType;
import tn.esprit.reviewservice.service.interfaces.INotificationService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReclamationServiceImpl implements IReclamationService {

    private final ReclamationRepository reclamationRepository;
    private final ReviewRepository reviewRepository;
    private final ReclamationMapper reclamationMapper;
    private final ITrustScoreService trustScoreService;
    private final INotificationService notificationService;

    public ReclamationServiceImpl(ReclamationRepository reclamationRepository,
                                  ReviewRepository reviewRepository,
                                  ReclamationMapper reclamationMapper,
                                  ITrustScoreService trustScoreService,
                                  INotificationService notificationService) {
        this.reclamationRepository = reclamationRepository;
        this.reviewRepository = reviewRepository;
        this.reclamationMapper = reclamationMapper;
        this.trustScoreService = trustScoreService;
        this.notificationService = notificationService;
    }

    @Override
    public ReclamationResponse createReclamation(ReclamationRequest request) {
        Review review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Review introuvable avec id : " + request.getReviewId()
                ));

        Reclamation reclamation = reclamationMapper.toEntity(request);
        reclamation.setReview(review);
        reclamation.setStatus(StatusReclamation.PENDING);

        Reclamation savedReclamation = reclamationRepository.save(reclamation);

        Long adminUserId = 3L;
        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(adminUserId)
                        .title("Nouvelle réclamation")
                        .message("Une nouvelle réclamation a été soumise et nécessite un traitement.")
                        .type(NotificationType.RECLAMATION_CREATED)
                        .channel(NotificationChannel.IN_APP)
                        .priority(NotificationPriority.HIGH)
                        .relatedEntityType(RelatedEntityType.RECLAMATION)
                        .relatedEntityId(savedReclamation.getId())
                        .build()
        );

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(savedReclamation.getReportedByUserId())
                        .title("Réclamation enregistrée")
                        .message("Votre réclamation a bien été enregistrée et est en attente de traitement.")
                        .type(NotificationType.RECLAMATION_CREATED)
                        .channel(NotificationChannel.IN_APP)
                        .priority(NotificationPriority.MEDIUM)
                        .relatedEntityType(RelatedEntityType.RECLAMATION)
                        .relatedEntityId(savedReclamation.getId())
                        .build()
        );

        return reclamationMapper.toResponse(savedReclamation);
    }

    @Override
    public List<ReclamationResponse> getAllReclamations() {
        return reclamationRepository.findAll()
                .stream()
                .map(reclamationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReclamationResponse> getReclamationsByStatus(StatusReclamation status) {
        return reclamationRepository.findByStatus(status)
                .stream()
                .map(reclamationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ReclamationResponse getReclamationById(Long id) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reclamation introuvable avec id : " + id
                ));

        return reclamationMapper.toResponse(reclamation);
    }

    @Override
    public ReclamationResponse markInReview(Long id, Long adminId, String adminComment) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reclamation introuvable avec id : " + id
                ));

        reclamation.setStatus(StatusReclamation.IN_REVIEW);
        reclamation.setProcessedByAdminId(adminId);
        reclamation.setAdminComment(adminComment);
        reclamation.setProcessedAt(LocalDateTime.now());

        Reclamation updatedReclamation = reclamationRepository.save(reclamation);

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(updatedReclamation.getReportedByUserId())
                        .title("Réclamation en cours de traitement")
                        .message("Votre réclamation est maintenant en cours d'examen par un administrateur.")
                        .type(NotificationType.RECLAMATION_IN_REVIEW)
                        .channel(NotificationChannel.IN_APP)
                        .priority(NotificationPriority.MEDIUM)
                        .relatedEntityType(RelatedEntityType.RECLAMATION)
                        .relatedEntityId(updatedReclamation.getId())
                        .build()
        );

        return reclamationMapper.toResponse(updatedReclamation);
    }

    @Override
    public ReclamationResponse confirmReclamation(Long id, Long adminId, String adminComment) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reclamation introuvable avec id : " + id
                ));

        Review review = reclamation.getReview();
        if (review == null) {
            throw new ResourceNotFoundException("Aucune review liée à cette réclamation");
        }

        reclamation.setStatus(StatusReclamation.CONFIRMED);
        reclamation.setProcessedByAdminId(adminId);
        reclamation.setAdminComment(adminComment);
        reclamation.setProcessedAt(LocalDateTime.now());
        reclamation.setResolvedAt(LocalDateTime.now());

        review.setIsDeleted(true);
        review.setIsVisible(false);
        reviewRepository.save(review);

        Reclamation updatedReclamation = reclamationRepository.save(reclamation);

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(updatedReclamation.getReportedByUserId())
                        .title("Réclamation confirmée")
                        .message("Votre réclamation a été confirmée par l'administration.")
                        .type(NotificationType.RECLAMATION_CONFIRMED)
                        .channel(NotificationChannel.IN_APP)
                        .priority(NotificationPriority.HIGH)
                        .relatedEntityType(RelatedEntityType.RECLAMATION)
                        .relatedEntityId(updatedReclamation.getId())
                        .build()
        );

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(review.getReviewedUserId())
                        .title("Une review a été masquée")
                        .message("Suite à une réclamation confirmée, une review liée à votre profil a été masquée.")
                        .type(NotificationType.RECLAMATION_CONFIRMED)
                        .channel(NotificationChannel.IN_APP)
                        .priority(NotificationPriority.HIGH)
                        .relatedEntityType(RelatedEntityType.RECLAMATION)
                        .relatedEntityId(updatedReclamation.getId())
                        .build()
        );

        trustScoreService.recalculateTrustScore(
                review.getReviewedUserId(),
                review.getId()
        );

        return reclamationMapper.toResponse(updatedReclamation);
    }

    @Override
    public ReclamationResponse rejectReclamation(Long id, Long adminId, String adminComment) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reclamation introuvable avec id : " + id
                ));

        reclamation.setStatus(StatusReclamation.REJECTED);
        reclamation.setProcessedByAdminId(adminId);
        reclamation.setAdminComment(adminComment);
        reclamation.setProcessedAt(LocalDateTime.now());
        reclamation.setResolvedAt(LocalDateTime.now());

        Reclamation updatedReclamation = reclamationRepository.save(reclamation);

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(updatedReclamation.getReportedByUserId())
                        .title("Réclamation rejetée")
                        .message("Votre réclamation a été rejetée par l'administration.")
                        .type(NotificationType.RECLAMATION_REJECTED)
                        .channel(NotificationChannel.IN_APP)
                        .priority(NotificationPriority.MEDIUM)
                        .relatedEntityType(RelatedEntityType.RECLAMATION)
                        .relatedEntityId(updatedReclamation.getId())
                        .build()
        );

        return reclamationMapper.toResponse(updatedReclamation);
    }

    @Override
    public void deleteReclamation(Long id) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reclamation introuvable avec id : " + id
                ));

        reclamationRepository.delete(reclamation);
    }
}