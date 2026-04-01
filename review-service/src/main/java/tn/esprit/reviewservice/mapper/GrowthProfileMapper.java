package tn.esprit.reviewservice.mapper;

import org.springframework.stereotype.Component;
import tn.esprit.reviewservice.dto.request.GrowthProfileRequest;
import tn.esprit.reviewservice.dto.response.GrowthProfileResponse;
import tn.esprit.reviewservice.entity.GrowthProfile;

@Component
public class GrowthProfileMapper {

    public GrowthProfile toEntity(GrowthProfileRequest request) {
        GrowthProfile growthProfile = new GrowthProfile();
        growthProfile.setUserId(request.getUserId());
        growthProfile.setXp(request.getXp());
        growthProfile.setLevel(request.getLevel());
        growthProfile.setNiveau(request.getNiveau());
        growthProfile.setStreakDays(request.getStreakDays());
        growthProfile.setLongestStreak(request.getLongestStreak());
        growthProfile.setLastActivityDate(request.getLastActivityDate());
        growthProfile.setBadgesCount(request.getBadgesCount());
        growthProfile.setProfileCompleted(request.getProfileCompleted());
        return growthProfile;
    }

    public GrowthProfileResponse toResponse(GrowthProfile growthProfile) {
        return GrowthProfileResponse.builder()
                .id(growthProfile.getId())
                .userId(growthProfile.getUserId())
                .xp(growthProfile.getXp())
                .level(growthProfile.getLevel())
                .niveau(growthProfile.getNiveau())
                .streakDays(growthProfile.getStreakDays())
                .longestStreak(growthProfile.getLongestStreak())
                .lastActivityDate(growthProfile.getLastActivityDate())
                .badgesCount(growthProfile.getBadgesCount())
                .profileCompleted(growthProfile.getProfileCompleted())
                .createdAt(growthProfile.getCreatedAt())
                .updatedAt(growthProfile.getUpdatedAt())
                .build();
    }
}