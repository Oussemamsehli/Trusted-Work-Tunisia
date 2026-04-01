package tn.esprit.reviewservice.mapper;

import org.springframework.stereotype.Component;
import tn.esprit.reviewservice.dto.request.BadgeRequest;
import tn.esprit.reviewservice.dto.response.BadgeResponse;
import tn.esprit.reviewservice.entity.Badge;

@Component
public class BadgeMapper {

    public Badge toEntity(BadgeRequest request) {
        Badge badge = new Badge();
        badge.setName(request.getName());
        badge.setDescription(request.getDescription());
        badge.setCategorie(request.getCategorie());
        badge.setRarete(request.getRarete());
        badge.setPoints(request.getPoints());
        return badge;
    }

    public BadgeResponse toResponse(Badge badge) {
        return BadgeResponse.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .categorie(badge.getCategorie())
                .rarete(badge.getRarete())
                .points(badge.getPoints())
                .build();
    }
}