package tn.esprit.reviewservice.service.interfaces;

import tn.esprit.reviewservice.dto.request.UserBadgeRequest;
import tn.esprit.reviewservice.dto.response.UserBadgeResponse;

import java.util.List;

public interface IUserBadgeService {

    UserBadgeResponse assignBadge(UserBadgeRequest request);

    List<UserBadgeResponse> getBadgesByUser(Long userId);

    List<UserBadgeResponse> getAllUserBadges();

    void deleteUserBadge(Long id);
}