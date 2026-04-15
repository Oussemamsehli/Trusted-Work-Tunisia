package tn.esprit.freelancerprofileservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.freelancerprofileservice.entities.Endorsement;
import tn.esprit.freelancerprofileservice.entities.Skill;
import tn.esprit.freelancerprofileservice.exceptions.DuplicateResourceException;
import tn.esprit.freelancerprofileservice.exceptions.InvalidDataException;
import tn.esprit.freelancerprofileservice.exceptions.ResourceNotFoundException;
import tn.esprit.freelancerprofileservice.repositories.EndorsementRepository;
import tn.esprit.freelancerprofileservice.repositories.SkillRepository;

import java.util.List;

/**
 * Gestion des endorsements des compétences.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class EndorsementServiceImpl implements IEndorsementService {

    private final EndorsementRepository endorsementRepository;
    private final SkillRepository skillRepository;
    private final ISkillAuthenticityService skillAuthenticityService;
    private final ISkillService skillService;

    @Override
    public Endorsement addEndorsement(Long skillId, Long endorserId, String comment) {
        if (endorsementRepository.existsByEndorserIdAndSkillId(endorserId, skillId)) {
            throw new DuplicateResourceException("Vous avez déjà validé cette compétence");
        }

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", skillId));

        if (skill.getProfile().getUserId().equals(endorserId)) {
            throw new InvalidDataException("Vous ne pouvez pas valider vos propres compétences");
        }

        String cleanedComment = cleanComment(comment);

        Endorsement endorsement = Endorsement.builder()
                .endorserId(endorserId)
                .skill(skill)
                .comment(cleanedComment)
                .build();

        Endorsement savedEndorsement = endorsementRepository.save(endorsement);

        long endorsementCount = endorsementRepository.countBySkillId(skillId);
        skill.setEndorsementCount((int) endorsementCount);
        skillRepository.save(skill);

        skillAuthenticityService.calculateAuthenticityScore(skillId);
        skillService.upgradeSkillLevelIfEligible(skillId);

        return savedEndorsement;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Endorsement> getEndorsementsBySkill(Long skillId) {
        if (!skillRepository.existsById(skillId)) {
            throw new ResourceNotFoundException("Skill", skillId);
        }

        return endorsementRepository.findBySkillIdOrderByEndorsedAtDesc(skillId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countEndorsements(Long skillId) {
        if (!skillRepository.existsById(skillId)) {
            throw new ResourceNotFoundException("Skill", skillId);
        }

        return endorsementRepository.countBySkillId(skillId);
    }

    private String cleanComment(String comment) {
        if (comment == null) {
            return null;
        }

        String cleaned = comment.trim().replaceAll("\\s+", " ");
        return cleaned.isBlank() ? null : cleaned;
    }
}