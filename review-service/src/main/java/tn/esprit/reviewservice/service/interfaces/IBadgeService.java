package tn.esprit.reviewservice.service.interfaces;

import tn.esprit.reviewservice.dto.request.BadgeRequest;
import tn.esprit.reviewservice.dto.response.BadgeResponse;

import java.util.List;

public interface IBadgeService {

    BadgeResponse createBadge(BadgeRequest request);

    BadgeResponse updateBadge(Long id, BadgeRequest request);

    List<BadgeResponse> getAllBadges();

    BadgeResponse getBadgeById(Long id);

    void deleteBadge(Long id);
}