package tn.esprit.reviewservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserBadgeRequest {

    @NotNull(message = "userId est obligatoire")
    private Long userId;

    @NotNull(message = "badgeId est obligatoire")
    private Long badgeId;
}