package tn.esprit.reviewservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.reviewservice.entity.UserBadge;

import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    List<UserBadge> findByUserId(Long userId);

    List<UserBadge> findByBadgeId(Long badgeId);
}