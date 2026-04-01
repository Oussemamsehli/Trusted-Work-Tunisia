package tn.esprit.reviewservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.CategorieConfiance;
import tn.esprit.reviewservice.entity.enums.Tendance;

@Getter
@Setter
public class TrustScoreRequest {

    @NotNull(message = "userId est obligatoire")
    private Long userId;

    @NotNull(message = "score est obligatoire")
    @Min(value = 0, message = "score doit être >= 0")
    private Double score;

    @NotNull(message = "averageRating est obligatoire")
    @Min(value = 0, message = "averageRating doit être >= 0")
    private Double averageRating;

    @NotNull(message = "totalReviews est obligatoire")
    @Min(value = 0, message = "totalReviews doit être >= 0")
    private Integer totalReviews;

    @NotNull(message = "categorie est obligatoire")
    private CategorieConfiance categorie;

    @NotNull(message = "tendance est obligatoire")
    private Tendance tendance;
}