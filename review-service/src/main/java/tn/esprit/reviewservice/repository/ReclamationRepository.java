package tn.esprit.reviewservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.reviewservice.entity.Reclamation;
import tn.esprit.reviewservice.entity.enums.StatusReclamation;

import java.util.List;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {

    List<Reclamation> findByReportedByUserId(Long reportedByUserId);

    List<Reclamation> findByStatus(StatusReclamation status);

    List<Reclamation> findByReviewId(Long reviewId);
}