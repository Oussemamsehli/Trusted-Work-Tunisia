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

import java.time.LocalDate;

@Service
public class BadgeAssignmentServiceImpl implements IBadgeAssignmentService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final GrowthProfileRepository growthProfileRepository;

    public BadgeAssignmentServiceImpl(BadgeRepository badgeRepository,
                                      UserBadgeRepository userBadgeRepository,
                                      GrowthProfileRepository growthProfileRepository) {
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.growthProfileRepository = growthProfileRepository;
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

        if (profile.getXp() == null) profile.setXp(0);
        if (profile.getLevel() == null) profile.setLevel(1);
        if (profile.getNiveau() == null) profile.setNiveau(Niveau.DEBUTANT);
        if (profile.getStreakDays() == null) profile.setStreakDays(0);
        if (profile.getLongestStreak() == null) profile.setLongestStreak(0);
        if (profile.getBadgesCount() == null) profile.setBadgesCount(0);
        if (profile.getProfileCompleted() == null) profile.setProfileCompleted(false);

        profile.setXp(profile.getXp() + 10);
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

        userBadgeRepository.save(userBadge);
    }
}