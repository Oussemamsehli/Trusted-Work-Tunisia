package tn.esprit.reviewservice.mapper;

import org.springframework.stereotype.Component;
import tn.esprit.reviewservice.dto.response.UserBadgeResponse;
import tn.esprit.reviewservice.entity.UserBadge;

@Component
public class UserBadgeMapper {

    public UserBadgeResponse toResponse(UserBadge userBadge) {
        return UserBadgeResponse.builder()
                .id(userBadge.getId())
                .userId(userBadge.getUserId())
                .badgeId(userBadge.getBadge().getId())
                .badgeName(userBadge.getBadge().getName())
                .awardedAt(userBadge.getAwardedAt())
                .build();
    }
}