package tn.esprit.reviewservice.service.impl;

import org.springframework.stereotype.Service;
import tn.esprit.reviewservice.entity.Badge;
import tn.esprit.reviewservice.entity.GrowthProfile;
import tn.esprit.reviewservice.entity.UserBadge;
import tn.esprit.reviewservice.entity.enums.Niveau;
import tn.esprit.reviewservice.repository.BadgeRepository;
import tn.esprit.reviewservice.repository.GrowthProfileRepository;
import tn.esprit.reviewservice.repository.UserBadgeRepository;
import tn.esprit.reviewservice.service.interfaces.IBadgeAssignmentService;
import tn.esprit.reviewservice.dto.request.NotificationRequest;
import tn.esprit.reviewservice.entity.enums.NotificationChannel;
import tn.esprit.reviewservice.entity.enums.NotificationPriority;
import tn.esprit.reviewservice.entity.enums.NotificationType;
import tn.esprit.reviewservice.entity.enums.RelatedEntityType;
import tn.esprit.reviewservice.service.interfaces.INotificationService;

import java.time.LocalDate;

@Service
public class BadgeAssignmentServiceImpl implements IBadgeAssignmentService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final GrowthProfileRepository growthProfileRepository;
    private final INotificationService notificationService;

    public BadgeAssignmentServiceImpl(BadgeRepository badgeRepository,
                                      UserBadgeRepository userBadgeRepository,
                                      GrowthProfileRepository growthProfileRepository,
                                      INotificationService notificationService
    ) {
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.growthProfileRepository = growthProfileRepository;
        this.notificationService = notificationService;
    }

    @Override
    public void updateGrowthProfile(Long userId) {

        GrowthProfile profile = growthProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    GrowthProfile newProfile = new GrowthProfile();
                    newProfile.setUserId(userId);
                    newProfile.setXp(0);
                    newProfile.setLevel(1);
                    newProfile.setNiveau(Niveau.DEBUTANT);
                    newProfile.setStreakDays(0);
                    newProfile.setLongestStreak(0);
                    newProfile.setBadgesCount(0);
                    newProfile.setProfileCompleted(false);
                    newProfile.setLastActivityDate(LocalDate.now());
                    return newProfile;
                });

        // sécurisation
        if (profile.getXp() == null) profile.setXp(0);

        // ajout XP
        int newXp = profile.getXp() + 10;
        profile.setXp(newXp);

        //  LEVEL SYSTEM
        if (newXp < 50) {
            profile.setLevel(1);
            profile.setNiveau(Niveau.DEBUTANT);
        } else if (newXp < 100) {
            profile.setLevel(2);
            profile.setNiveau(Niveau.INTERMEDIAIRE);
        } else {
            profile.setLevel(3);
            profile.setNiveau(Niveau.EXPERT);
        }

        profile.setLastActivityDate(LocalDate.now());

        growthProfileRepository.save(profile);
    }

    @Override
    public void assignFirstReviewBadge(Long userId) {

        Badge badge = badgeRepository.findByName("First Review")
                .orElse(null);

        if (badge == null) return;

        boolean alreadyExists = userBadgeRepository
                .existsByUserIdAndBadgeId(userId, badge.getId());

        if (alreadyExists) return;

        UserBadge userBadge = new UserBadge();
        userBadge.setUserId(userId);
        userBadge.setBadge(badge);
        userBadge.setReason("First review published");

        UserBadge savedUserBadge = userBadgeRepository.save(userBadge);

            //Notification
        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(userId)
                        .title("🎉 Nouveau badge obtenu")
                        .message("Félicitations ! Vous avez obtenu le badge : " + badge.getName())
                        .type(NotificationType.BADGE_EARNED)
                        .channel(NotificationChannel.IN_APP)
                        .priority(NotificationPriority.HIGH)
                        .relatedEntityType(RelatedEntityType.BADGE)
                        .relatedEntityId(savedUserBadge.getId())
                        .build()
        );    }
}