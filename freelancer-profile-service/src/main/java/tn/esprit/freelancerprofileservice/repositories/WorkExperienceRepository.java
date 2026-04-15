package tn.esprit.freelancerprofileservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.freelancerprofileservice.entities.WorkExperience;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {


    List<WorkExperience> findByProfileIdOrderByIsCurrentDescStartDateDesc(Long profileId);


    long countByProfileId(Long profileId);


    Optional<WorkExperience> findByIdAndProfileId(Long id, Long profileId);


    boolean existsByProfileIdAndJobTitleIgnoreCaseAndCompanyIgnoreCaseAndStartDate(
            Long profileId,
            String jobTitle,
            String company,
            LocalDate startDate
    );


    boolean existsByProfileIdAndJobTitleIgnoreCaseAndCompanyIgnoreCaseAndStartDateAndIdNot(
            Long profileId,
            String jobTitle,
            String company,
            LocalDate startDate,
            Long id
    );
}