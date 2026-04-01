package tn.esprit.reviewservice.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.CategorieConfiance;
import tn.esprit.reviewservice.entity.enums.Tendance;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class TrustScoreResponse {

    private Long id;
    private Long userId;
    private Double score;
    private Double averageRating;
    private Integer totalReviews;
    private CategorieConfiance categorie;
    private Tendance tendance;
    private LocalDateTime updatedAt;
}