package tn.esprit.reviewservice.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.ReviewType;

@Getter
@Setter
public class ReviewRequest {

    @NotNull(message = "contractId est obligatoire")
    private Long contractId;

    @NotNull(message = "reviewerId est obligatoire")
    private Long reviewerId;

    @NotNull(message = "reviewedUserId est obligatoire")
    private Long reviewedUserId;

    @NotNull(message = "reviewType est obligatoire")
    private ReviewType reviewType;

    @NotNull(message = "rating est obligatoire")
    @Min(value = 1, message = "La note doit être supérieure ou égale à 1")
    @Max(value = 5, message = "La note doit être inférieure ou égale à 5")
    private Integer rating;

    @Size(max = 1000, message = "Le commentaire ne doit pas dépasser 1000 caractères")
    private String comment;
}