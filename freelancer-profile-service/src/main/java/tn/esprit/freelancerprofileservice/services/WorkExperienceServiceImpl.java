package tn.esprit.freelancerprofileservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.freelancerprofileservice.entities.FreelancerProfile;
import tn.esprit.freelancerprofileservice.entities.WorkExperience;
import tn.esprit.freelancerprofileservice.repositories.FreelancerProfileRepository;
import tn.esprit.freelancerprofileservice.repositories.WorkExperienceRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkExperienceServiceImpl implements IWorkExperienceService {

    private final WorkExperienceRepository workExperienceRepository;
    private final FreelancerProfileRepository profileRepository;
    private final ICompletenessService completenessService;

    @Override
    public WorkExperience addWorkExperience(Long userId, WorkExperience experience) {
        FreelancerProfile profile = getProfile(userId);

        validateExperience(experience, profile.getId(), null);

        experience.setProfile(profile);

        WorkExperience saved = workExperienceRepository.save(experience);
        completenessService.calculateCompleteness(userId);

        return saved;
    }

    @Override
    public WorkExperience updateWorkExperience(Long expId, Long userId, WorkExperience updates) {
        FreelancerProfile profile = getProfile(userId);

        WorkExperience existing = workExperienceRepository
                .findByIdAndProfileId(expId, profile.getId())
                .orElseThrow(() -> new RuntimeException("Expérience introuvable"));

        validateExperience(updates, profile.getId(), expId);

        existing.setJobTitle(updates.getJobTitle());
        existing.setCompany(updates.getCompany());
        existing.setLocation(updates.getLocation());
        existing.setDescription(updates.getDescription());
        existing.setStartDate(updates.getStartDate());
        existing.setEndDate(updates.getEndDate());
        existing.setIsCurrent(updates.getIsCurrent());

        WorkExperience saved = workExperienceRepository.save(existing);
        completenessService.calculateCompleteness(userId);

        return saved;
    }

    @Override
    public List<WorkExperience> getMyWorkExperiences(Long userId) {
        FreelancerProfile profile = getProfile(userId);
        return workExperienceRepository.findByProfileIdOrderByIsCurrentDescStartDateDesc(profile.getId());
    }

    @Override
    public WorkExperience getWorkExperienceById(Long expId, Long userId) {
        FreelancerProfile profile = getProfile(userId);

        return workExperienceRepository.findByIdAndProfileId(expId, profile.getId())
                .orElseThrow(() -> new RuntimeException("Expérience introuvable"));
    }

    @Override
    public void deleteWorkExperience(Long expId, Long userId) {
        FreelancerProfile profile = getProfile(userId);

        WorkExperience exp = workExperienceRepository.findByIdAndProfileId(expId, profile.getId())
                .orElseThrow(() -> new RuntimeException("Expérience introuvable"));

        workExperienceRepository.delete(exp);
        completenessService.calculateCompleteness(userId);
    }

    @Override
    public Long getTotalExperienceInMonths(Long userId) {
        FreelancerProfile profile = getProfile(userId);

        List<WorkExperience> experiences =
                workExperienceRepository.findByProfileIdOrderByIsCurrentDescStartDateDesc(profile.getId());

        long total = 0;

        for (WorkExperience exp : experiences) {
            LocalDate start = exp.getStartDate();
            LocalDate end = exp.getEndDate() != null ? exp.getEndDate() : LocalDate.now();

            long months = ChronoUnit.MONTHS.between(start, end);
            total += Math.max(months, 0);
        }

        return total;
    }

    private FreelancerProfile getProfile(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profil introuvable"));
    }

    private void validateExperience(WorkExperience exp, Long profileId, Long expId) {
        if (exp.getJobTitle() == null || exp.getJobTitle().isBlank()) {
            throw new RuntimeException("Titre du poste obligatoire");
        }

        if (exp.getCompany() == null || exp.getCompany().isBlank()) {
            throw new RuntimeException("Entreprise obligatoire");
        }

        if (exp.getStartDate() == null) {
            throw new RuntimeException("Date de début obligatoire");
        }

        if (exp.getStartDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Date de début invalide");
        }

        if (Boolean.TRUE.equals(exp.getIsCurrent())) {
            exp.setEndDate(null);
        } else {
            if (exp.getEndDate() == null) {
                throw new RuntimeException("Date de fin obligatoire");
            }

            if (exp.getEndDate().isAfter(LocalDate.now())) {
                throw new RuntimeException("Date de fin invalide");
            }

            if (exp.getStartDate().isAfter(exp.getEndDate())) {
                throw new RuntimeException("Dates incohérentes");
            }
        }

        boolean exists;

        if (expId == null) {
            exists = workExperienceRepository
                    .existsByProfileIdAndJobTitleIgnoreCaseAndCompanyIgnoreCaseAndStartDate(
                            profileId,
                            exp.getJobTitle(),
                            exp.getCompany(),
                            exp.getStartDate()
                    );
        } else {
            exists = workExperienceRepository
                    .existsByProfileIdAndJobTitleIgnoreCaseAndCompanyIgnoreCaseAndStartDateAndIdNot(
                            profileId,
                            exp.getJobTitle(),
                            exp.getCompany(),
                            exp.getStartDate(),
                            expId
                    );
        }

        if (exists) {
            throw new RuntimeException("Expérience déjà existante");
        }
    }
}