package tn.esprit.reviewservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.reviewservice.entity.TrustScore;
import tn.esprit.reviewservice.entity.enums.CategorieConfiance;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrustScoreRepository extends JpaRepository<TrustScore, Long> {

    Optional<TrustScore> findByUserId(Long userId);

    List<TrustScore> findByCategorie(CategorieConfiance categorie);

    // pour dashboard
    List<TrustScore> findByScoreGreaterThan(Double score);

}