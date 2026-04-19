package tn.esprit.freelancerprofileservice.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tn.esprit.freelancerprofileservice.clients.UserClient;
import tn.esprit.freelancerprofileservice.entities.Certification;
import tn.esprit.freelancerprofileservice.entities.FreelancerProfile;
import tn.esprit.freelancerprofileservice.repositories.CertificationRepository;
import tn.esprit.freelancerprofileservice.repositories.FreelancerProfileRepository;
import tn.esprit.freelancerprofileservice.repositories.SkillRepository;
import tn.esprit.freelancerprofileservice.services.ICompletenessService;
import tn.esprit.freelancerprofileservice.services.IEmailService;
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
 * Tâche 3 : Rappels de complétion de profil (chaque matin à 9h) + EMAIL
 * Tâche 4 : Vérification expiration certifications (1er de chaque mois) + EMAIL
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
    private final IEmailService emailService;
    private final UserClient userClient;

    /**
     * TÂCHE 1 — Recalcul nocturne des scores d'authenticité
     * Exécution : chaque nuit à 1h00
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
     * TÂCHE 3 — Rappels de complétion de profil + EMAIL
     * Exécution : chaque matin à 9h
     * Objectif : notifier les freelancers avec score < 60% par email
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void sendProfileCompletionReminders() {
        log.info(">>> [SCHEDULER] Début vérification profils incomplets...");

        List<FreelancerProfile> incompleteProfiles =
                profileRepository.findProfilesBelowScore(60);

        int emailSentCount = 0;

        for (FreelancerProfile profile : incompleteProfiles) {
            try {
                // Recalculer le score avant d'envoyer
                completenessService.calculateCompleteness(profile.getUserId());

                log.info(">>> [SCHEDULER] Rappel profil userId={} score={}",
                        profile.getUserId(), profile.getCompletenessScore());

                // Récupérer email + nom depuis user-service
                String email    = userClient.getUserEmail(profile.getUserId());
                String fullName = userClient.getUserFullName(profile.getUserId());

                if (email != null && !email.isBlank()) {
                    emailService.sendProfileIncompleteReminder(
                            email,
                            fullName,
                            profile.getCompletenessScore() != null
                                    ? profile.getCompletenessScore()
                                    : 0
                    );
                    emailSentCount++;
                    log.info(">>> [SCHEDULER] Email rappel envoyé → {}", email);
                } else {
                    log.warn(">>> [SCHEDULER] Email absent pour userId={}", profile.getUserId());
                }

            } catch (Exception e) {
                log.error("Erreur rappel profil {} : {}", profile.getId(), e.getMessage());
            }
        }

        log.info(">>> [SCHEDULER] {} profils incomplets détectés, {} emails envoyés.",
                incompleteProfiles.size(), emailSentCount);
    }

    /**
     * TÂCHE 4 — Vérification expiration certifications + EMAIL
     * Exécution : le 1er de chaque mois à minuit
     * Objectif : marquer les certifications expirées + alerter le freelancer par email
     */
    @Scheduled(cron = "0 0 0 1 * *")
    public void checkCertificationExpiry() {
        log.info(">>> [SCHEDULER] Début vérification expiration certifications...");

        LocalDate today    = LocalDate.now();
        LocalDate deadline = today.plusDays(30);

        List<Certification> expiring =
                certificationRepository.findExpiringCertifications(deadline);

        int expiredCount      = 0;
        int emailSentCount    = 0;
        Set<Long> impactedUserIds = new HashSet<>();

        for (Certification cert : expiring) {
            try {
                Long userId = cert.getProfile().getUserId();

                if (cert.getExpiryDate() != null && cert.getExpiryDate().isBefore(today)) {
                    // ── Certification déjà expirée → marquer ──────────────
                    cert.setIsExpired(true);
                    certificationRepository.save(cert);
                    expiredCount++;
                    impactedUserIds.add(userId);

                    log.info(">>> [SCHEDULER] Certification expirée : '{}' (userId={})",
                            cert.getTitle(), userId);

                } else {
                    // ── Certification expire dans < 30 jours → alerter ────
                    log.warn(">>> [SCHEDULER] Certification '{}' expire le {} (userId={})",
                            cert.getTitle(), cert.getExpiryDate(), userId);

                    // Envoyer email d'alerte au freelancer
                    String email    = userClient.getUserEmail(userId);
                    String fullName = userClient.getUserFullName(userId);

                    if (email != null && !email.isBlank()) {
                        emailService.sendCertificationExpiryAlert(
                                email,
                                fullName,
                                cert.getTitle(),
                                cert.getExpiryDate().toString()
                        );
                        emailSentCount++;
                        log.info(">>> [SCHEDULER] Email alerte expiration → {}", email);
                    } else {
                        log.warn(">>> [SCHEDULER] Email absent pour userId={}", userId);
                    }
                }

            } catch (Exception e) {
                log.error("Erreur traitement certification {} : {}", cert.getId(), e.getMessage());
            }
        }

        // Recalculer completeness pour les profils impactés
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
        log.info(">>> [SCHEDULER] {} emails d'alerte envoyés.", emailSentCount);
        log.info(">>> [SCHEDULER] Completeness recalculé pour {} profil(s).", recalculatedCount);
    }
}