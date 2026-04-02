package tn.esprit.reviewservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.reviewservice.entity.TrustScoreHistory;

import java.util.List;

@Repository
public interface TrustScoreHistoryRepository extends JpaRepository<TrustScoreHistory, Long> {

    List<TrustScoreHistory> findByUserId(Long userId);

    List<TrustScoreHistory> findByUserIdOrderByChangedAtDesc(Long userId);
}