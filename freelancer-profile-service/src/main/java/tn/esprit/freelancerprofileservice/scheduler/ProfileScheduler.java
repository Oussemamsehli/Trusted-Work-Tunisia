package tn.esprit.freelancerprofileservice.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tn.esprit.freelancerprofileservice.entities.Certification;
import tn.esprit.freelancerprofileservice.entities.FreelancerProfile;
import tn.esprit.freelancerprofileservice.repositories.CertificationRepository;
import tn.esprit.freelancerprofileservice.repositories.FreelancerProfileRepository;
import tn.esprit.freelancerprofileservice.repositories.SkillRepository;
import tn.esprit.freelancerprofileservice.services.ICompletenessService;
import tn.esprit.freelancerprofileservice.services.ISkillAuthenticityService;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Scheduler automatique du Module 02 — 4 tâches planifiées
 *
 * Tâche 1 : Recalcul nocturne des scores d'authenticité (chaque nuit à 1h)
 * Tâche 2 : Mise à jour du classement régional (chaque lundi)
 * Tâche 3 : Rappels de complétion de profil (chaque matin à 9h)
 * Tâche 4 : Vérification expiration certifications (1er de chaque mois)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ProfileScheduler {

    private final FreelancerProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final CertificationRepository certificationRepository;
    private final ISkillAuthenticityService skillAuthenticityService;
    private final ICompletenessService completenessService;

    /**
     * TÂCHE 1 — Recalcul nocturne des scores d'authenticité
     * Exécution : chaque nuit à 1h00
     * Objectif : maintenir les scores à jour automatiquement
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void recalculateAllSkillScores() {
        log.info(">>> [SCHEDULER] Début recalcul scores authenticité...");

        List<FreelancerProfile> profiles = profileRepository.findAll();
        int count = 0;

        for (FreelancerProfile profile : profiles) {
            try {
                skillAuthenticityService.recalculateAllScores(profile.getId());
                count++;
            } catch (Exception e) {
                log.error("Erreur recalcul profil {} : {}", profile.getId(), e.getMessage());
            }
        }

        log.info(">>> [SCHEDULER] Scores recalculés pour {} profils.", count);
    }

    /**
     * TÂCHE 2 — Mise à jour du classement régional
     * Exécution : chaque lundi à minuit
     * Objectif : classer les freelancers par région selon leur score de complétude
     */
    @Scheduled(cron = "0 0 0 * * MON")
    public void updateRegionalRankings() {
        log.info(">>> [SCHEDULER] Début mise à jour classements régionaux...");

        List<FreelancerProfile> allProfiles = profileRepository.findAll();
        List<String> regions = allProfiles.stream()
                .map(FreelancerProfile::getRegion)
                .filter(r -> r != null && !r.isBlank())
                .distinct()
                .toList();

        for (String region : regions) {
            List<FreelancerProfile> ranked =
                    profileRepository.findByRegionOrderByCompletenessScoreDesc(region);

            for (int i = 0; i < ranked.size(); i++) {
                ranked.get(i).setRegionalRank(i + 1);
            }

            profileRepository.saveAll(ranked);
            log.info(">>> [SCHEDULER] Région '{}' : {} freelancers classés.", region, ranked.size());
        }

        log.info(">>> [SCHEDULER] Classements régionaux mis à jour.");
    }

    /**
     * TÂCHE 3 — Rappels de complétion de profil
     * Exécution : chaque matin à 9h
     * Objectif : recalculer et logger les profils incomplets (score < 60)
     * En production : envoyer un email via notification-service
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void sendProfileCompletionReminders() {
        log.info(">>> [SCHEDULER] Début vérification profils incomplets...");

        List<FreelancerProfile> incompleteProfiles =
                profileRepository.findProfilesBelowScore(60);

        for (FreelancerProfile profile : incompleteProfiles) {
            try {
                completenessService.calculateCompleteness(profile.getUserId());
                log.info(">>> [SCHEDULER] Rappel profil userId={} score={}",
                        profile.getUserId(), profile.getCompletenessScore());
                // TODO : appel notification-service pour envoyer email
            } catch (Exception e) {
                log.error("Erreur rappel profil {} : {}", profile.getId(), e.getMessage());
            }
        }

        log.info(">>> [SCHEDULER] {} profils incomplets détectés.", incompleteProfiles.size());
    }

    /**
     * TÂCHE 4 — Vérification expiration des certifications
     * Exécution : le 1er de chaque mois à minuit
     * Objectif : marquer les certifications expirées automatiquement
     * En production : notifier le freelancer par email
     */
    @Scheduled(cron = "0 0 0 1 * *")
    public void checkCertificationExpiry() {
        log.info(">>> [SCHEDULER] Début vérification expiration certifications...");

        LocalDate today = LocalDate.now();
        LocalDate deadline = today.plusDays(30);

        List<Certification> expiring =
                certificationRepository.findExpiringCertifications(deadline);

        int expiredCount = 0;
        Set<Long> impactedUserIds = new HashSet<>();

        for (Certification cert : expiring) {
            try {
                if (cert.getExpiryDate() != null && cert.getExpiryDate().isBefore(today)) {
                    cert.setIsExpired(true);
                    certificationRepository.save(cert);
                    expiredCount++;

                    Long userId = cert.getProfile().getUserId();
                    impactedUserIds.add(userId);

                    log.info(">>> [SCHEDULER] Certification expirée : '{}' (profil userId={})",
                            cert.getTitle(), userId);
                } else {
                    log.warn(">>> [SCHEDULER] Certification '{}' expire le {} (profil userId={})",
                            cert.getTitle(), cert.getExpiryDate(), cert.getProfile().getUserId());
                    // TODO : appel notification-service pour alerter le freelancer
                }
            } catch (Exception e) {
                log.error("Erreur traitement certification {} : {}", cert.getId(), e.getMessage());
            }
        }

        int recalculatedCount = 0;
        for (Long userId : impactedUserIds) {
            try {
                completenessService.calculateCompleteness(userId);
                recalculatedCount++;
                log.info(">>> [SCHEDULER] Completeness recalculé pour userId={}", userId);
            } catch (Exception e) {
                log.error("Erreur recalcul completeness userId={} : {}", userId, e.getMessage());
            }
        }

        log.info(">>> [SCHEDULER] {} certifications expirées marquées.", expiredCount);
        log.info(">>> [SCHEDULER] Completeness recalculé pour {} profil(s).", recalculatedCount);
    }
}