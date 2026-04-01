package tn.esprit.reviewservice.dto.response;

import lombok.*;
import tn.esprit.reviewservice.entity.enums.CategorieConfiance;
import tn.esprit.reviewservice.entity.enums.Tendance;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrustScoreResponse {

    private Long id;
    private Long userId;
    private Double score;
    private Double averageRating;
    private Integer totalReviews;
    private Integer positiveReviews;
    private Integer negativeReviews;
    private CategorieConfiance categorie;
    private Tendance tendance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}