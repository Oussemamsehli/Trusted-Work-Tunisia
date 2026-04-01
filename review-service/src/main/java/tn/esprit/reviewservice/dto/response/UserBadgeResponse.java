package tn.esprit.reviewservice.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class UserBadgeResponse {

    private Long id;
    private Long userId;
    private Long badgeId;
    private String badgeName;
    private LocalDateTime awardedAt;
}