package tn.esprit.freelancerprofileservice.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
import tn.esprit.freelancerprofileservice.repositories.NotificationRepository;
import tn.esprit.freelancerprofileservice.repositories.ProfileReviewRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour ProfileReviewServiceImpl
 * Validation jury : 18/04/2026
 */
@ExtendWith(MockitoExtension.class)
class ProfileReviewServiceImplTest {

    @Mock
    private ProfileReviewRepository reviewRepository;

    @Mock
    private FreelancerProfileRepository profileRepository;

    @Mock
    private ReviewAnalysisService reviewAnalysisService;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ProfileReviewServiceImpl profileReviewService;

    private FreelancerProfile profile;
    private AddReviewRequest addReviewRequest;
    private ProfileReview review;

    @BeforeEach
    void setUp() {
        profile = FreelancerProfile.builder()
                .id(1L)
                .userId(100L)
                .headline("Full Stack Developer")
                .bio("Experienced developer")
                .build();

        addReviewRequest = new AddReviewRequest();
        addReviewRequest.setClientId(200L);
        addReviewRequest.setRating(5);
        addReviewRequest.setComment("Freelancer très professionnel, rapide et fiable dans son travail.");

        review = ProfileReview.builder()
                .id(10L)
                .clientId(200L)
                .profile(profile)
                .rating(5)
                .comment("Freelancer très professionnel, rapide et fiable dans son travail.")
                .status(ReviewStatus.VISIBLE)
                .flagged(false)
                .flagReason(null)
                .reviewedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // Validation jury 18/04/2026 — vérifier qu’un avis peut être ajouté avec succès
    @Test
    void shouldAddReviewSuccessfully() {
        when(profileRepository.findById(1L)).thenReturn(Optional.of(profile));
        when(reviewRepository.existsByClientIdAndProfileId(200L, 1L)).thenReturn(false);
        when(reviewAnalysisService.analyze(5, addReviewRequest.getComment()))
                .thenReturn(ReviewAnalysisResult.builder()
                        .flagged(false)
                        .flagReason(null)
                        .build());
        when(reviewRepository.save(any(ProfileReview.class))).thenReturn(review);
        when(notificationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ReviewResponse response = profileReviewService.addReview(1L, addReviewRequest);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals(200L, response.getClientId());
        assertEquals(5, response.getRating());
        assertEquals("Freelancer très professionnel, rapide et fiable dans son travail.", response.getComment());

        verify(profileRepository).findById(1L);
        verify(reviewRepository).existsByClientIdAndProfileId(200L, 1L);
        verify(reviewAnalysisService).analyze(5, addReviewRequest.getComment());
        verify(reviewRepository).save(any(ProfileReview.class));
        verify(notificationRepository, atLeastOnce()).save(any());

        // Seulement si le service envoie réellement une notification websocket en cas de succès
        verify(messagingTemplate, times(1))
                .convertAndSend(anyString(), any(Object.class));
    }

    // Validation jury 18/04/2026 — vérifier l’exception si le profil n’existe pas
    @Test
    void shouldThrowExceptionWhenProfileNotFound() {
        when(profileRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> profileReviewService.addReview(1L, addReviewRequest)
        );

        assertNotNull(exception);
        verify(profileRepository).findById(1L);
        verify(reviewRepository, never()).save(any());
        verify(notificationRepository, never()).save(any());

        // En cas d’échec métier, aucun websocket ne doit partir
        verify(messagingTemplate, never())
                .convertAndSend(anyString(), any(Object.class));
    }

    // Validation jury 18/04/2026 — vérifier qu’un client ne peut pas noter son propre profil
    @Test
    void shouldThrowExceptionWhenClientReviewsOwnProfile() {
        addReviewRequest.setClientId(100L);

        when(profileRepository.findById(1L)).thenReturn(Optional.of(profile));

        InvalidDataException exception = assertThrows(
                InvalidDataException.class,
                () -> profileReviewService.addReview(1L, addReviewRequest)
        );

        assertEquals("Vous ne pouvez pas laisser un avis sur votre propre profil", exception.getMessage());
        verify(profileRepository).findById(1L);
        verify(reviewRepository, never()).save(any());
        verify(notificationRepository, never()).save(any());

        // En cas d’échec métier, aucun websocket ne doit partir
        verify(messagingTemplate, never())
                .convertAndSend(anyString(), any(Object.class));
    }

    // Validation jury 18/04/2026 — vérifier qu’un client ne peut pas publier deux avis sur le même profil
    @Test
    void shouldThrowExceptionWhenReviewAlreadyExists() {
        when(profileRepository.findById(1L)).thenReturn(Optional.of(profile));
        when(reviewRepository.existsByClientIdAndProfileId(200L, 1L)).thenReturn(true);

        DuplicateResourceException exception = assertThrows(
                DuplicateResourceException.class,
                () -> profileReviewService.addReview(1L, addReviewRequest)
        );

        assertEquals("Vous avez déjà laissé un avis sur ce profil", exception.getMessage());
        verify(profileRepository).findById(1L);
        verify(reviewRepository).existsByClientIdAndProfileId(200L, 1L);
        verify(reviewRepository, never()).save(any());
        verify(notificationRepository, never()).save(any());

        // En cas d’échec métier, aucun websocket ne doit partir
        verify(messagingTemplate, never())
                .convertAndSend(anyString(), any(Object.class));
    }

    // Validation jury 18/04/2026 — vérifier la récupération des avis visibles
    @Test
    void shouldReturnVisibleReviews() {
        when(profileRepository.existsById(1L)).thenReturn(true);
        when(reviewRepository.findByProfileIdAndStatusOrderByReviewedAtDesc(1L, ReviewStatus.VISIBLE))
                .thenReturn(List.of(review));

        List<ReviewResponse> responses = profileReviewService.getVisibleReviews(1L);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(10L, responses.get(0).getId());
        assertEquals(5, responses.get(0).getRating());

        verify(profileRepository).existsById(1L);
        verify(reviewRepository).findByProfileIdAndStatusOrderByReviewedAtDesc(1L, ReviewStatus.VISIBLE);
    }

    // Validation jury 18/04/2026 — vérifier le calcul de la note moyenne arrondie
    @Test
    void shouldReturnAverageRatingRoundedToOneDecimal() {
        when(profileRepository.existsById(1L)).thenReturn(true);
        when(reviewRepository.findAverageRatingByProfileId(1L)).thenReturn(4.666);

        Double result = profileReviewService.getAverageRating(1L);

        assertEquals(4.7, result);
        verify(profileRepository).existsById(1L);
        verify(reviewRepository).findAverageRatingByProfileId(1L);
    }

    // Validation jury 18/04/2026 — vérifier le résumé global des avis
    @Test
    void shouldReturnReviewSummary() {
        when(profileRepository.existsById(1L)).thenReturn(true);
        when(reviewRepository.findAverageRatingByProfileId(1L)).thenReturn(4.25);
        when(reviewRepository.countByProfileIdAndStatus(1L, ReviewStatus.VISIBLE)).thenReturn(4L);
        when(reviewRepository.countByProfileIdAndRatingAndStatus(1L, 5, ReviewStatus.VISIBLE)).thenReturn(2L);
        when(reviewRepository.countByProfileIdAndRatingAndStatus(1L, 4, ReviewStatus.VISIBLE)).thenReturn(1L);
        when(reviewRepository.countByProfileIdAndRatingAndStatus(1L, 3, ReviewStatus.VISIBLE)).thenReturn(1L);
        when(reviewRepository.countByProfileIdAndRatingAndStatus(1L, 2, ReviewStatus.VISIBLE)).thenReturn(0L);
        when(reviewRepository.countByProfileIdAndRatingAndStatus(1L, 1, ReviewStatus.VISIBLE)).thenReturn(0L);

        ProfileReviewSummaryResponse summary = profileReviewService.getReviewSummary(1L);

        assertNotNull(summary);
        assertEquals(1L, summary.getProfileId());
        assertEquals(4.3, summary.getAverageRating());
        assertEquals(4L, summary.getTotalReviews());
        assertEquals(2L, summary.getFiveStarCount());
        assertEquals(1L, summary.getFourStarCount());
        assertEquals(1L, summary.getThreeStarCount());
        assertEquals(0L, summary.getTwoStarCount());
        assertEquals(0L, summary.getOneStarCount());
    }

    // Validation jury 18/04/2026 — vérifier qu’un freelancer peut répondre à un avis sur son profil
    @Test
    void shouldReplyToReviewSuccessfully() {
        ReplyToReviewRequest request = new ReplyToReviewRequest();
        request.setReply("Merci beaucoup pour votre retour positif.");

        ProfileReview existingReview = ProfileReview.builder()
                .id(10L)
                .clientId(200L)
                .profile(profile)
                .rating(5)
                .comment("Excellent travail, très satisfait.")
                .status(ReviewStatus.VISIBLE)
                .flagged(false)
                .reviewedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ProfileReview updatedReview = ProfileReview.builder()
                .id(10L)
                .clientId(200L)
                .profile(profile)
                .rating(5)
                .comment("Excellent travail, très satisfait.")
                .freelancerReply("Merci beaucoup pour votre retour positif.")
                .status(ReviewStatus.VISIBLE)
                .flagged(false)
                .reviewedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(reviewRepository.findById(10L)).thenReturn(Optional.of(existingReview));
        when(reviewRepository.save(any(ProfileReview.class))).thenReturn(updatedReview);

        ReviewResponse response = profileReviewService.replyToReview(10L, 100L, request);

        assertNotNull(response);
        assertEquals("Merci beaucoup pour votre retour positif.", response.getFreelancerReply());

        verify(reviewRepository).findById(10L);
        verify(reviewRepository).save(any(ProfileReview.class));
    }

    // Validation jury 18/04/2026 — vérifier qu’un autre freelancer ne peut pas répondre à un avis qui ne lui appartient pas
    @Test
    void shouldThrowExceptionWhenReplyingToReviewOfAnotherFreelancer() {
        ReplyToReviewRequest request = new ReplyToReviewRequest();
        request.setReply("Merci pour votre retour.");

        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        InvalidDataException exception = assertThrows(
                InvalidDataException.class,
                () -> profileReviewService.replyToReview(10L, 999L, request)
        );

        assertEquals("Vous n'êtes pas autorisé à répondre à cet avis", exception.getMessage());
        verify(reviewRepository).findById(10L);
        verify(reviewRepository, never()).save(any());
    }
}