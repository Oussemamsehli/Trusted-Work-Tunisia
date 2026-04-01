package tn.esprit.reviewservice.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBadgeResponse {

    private Long id;
    private Long userId;
    private Long badgeId;
    private String reason;
    private LocalDateTime awardedAt;
}