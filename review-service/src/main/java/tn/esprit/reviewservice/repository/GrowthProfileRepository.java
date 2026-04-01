package tn.esprit.reviewservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.reviewservice.entity.GrowthProfile;
import tn.esprit.reviewservice.entity.enums.Niveau;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrowthProfileRepository extends JpaRepository<GrowthProfile, Long> {

    Optional<GrowthProfile> findByUserId(Long userId);

    List<GrowthProfile> findByNiveau(Niveau niveau);
}