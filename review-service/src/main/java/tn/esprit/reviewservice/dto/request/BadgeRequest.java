package tn.esprit.reviewservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.CategorieBadge;
import tn.esprit.reviewservice.entity.enums.Rarete;

@Getter
@Setter
public class BadgeRequest {

    @NotNull
    private String name;

    private String description;

    @NotNull
    private CategorieBadge categorie;

    @NotNull
    private Rarete rarete;

    private Integer points;
}