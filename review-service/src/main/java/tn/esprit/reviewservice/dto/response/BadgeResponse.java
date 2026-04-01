package tn.esprit.reviewservice.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.CategorieBadge;
import tn.esprit.reviewservice.entity.enums.Rarete;

@Getter
@Setter
@Builder
public class BadgeResponse {

    private Long id;
    private String name;
    private String description;
    private CategorieBadge categorie;
    private Rarete rarete;
    private Integer points;
}