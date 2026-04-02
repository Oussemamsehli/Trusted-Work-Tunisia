package tn.esprit.reviewservice.service.interfaces;

public interface IBadgeAssignmentService {

    void assignFirstReviewBadge(Long userId);

    void updateGrowthProfile(Long userId);
}