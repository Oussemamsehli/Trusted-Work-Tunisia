package tn.esprit.freelancerprofileservice.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.freelancerprofileservice.dto.response.ProfileViewAnalyticsResponse;
import tn.esprit.freelancerprofileservice.services.IProfileViewService;

import java.util.Map;

/**
 * Controller REST — gestion des vues de profils
 */
@RestController
@RequestMapping("/api/views")
@RequiredArgsConstructor
public class ProfileViewController {

    private final IProfileViewService profileViewService;

    /**
     * POST /api/views/profiles/{profileId}?viewerId=X
     * Enregistre une vue sur le profil
     */
    @PostMapping("/profiles/{profileId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, String>> recordView(
            @PathVariable Long profileId,
            @RequestParam(required = false) Long viewerId) {

        profileViewService.recordView(profileId, viewerId);
        return ResponseEntity.ok(Map.of("message", "Vue enregistrée avec succès"));
    }

    /**
     * GET /api/views/profiles/{profileId}/count
     * Retourne le nombre total de vues
     */
    @GetMapping("/profiles/{profileId}/count")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Long> getTotalViews(@PathVariable Long profileId) {
        return ResponseEntity.ok(profileViewService.getTotalViews(profileId));
    }

    /**
     * GET /api/views/profiles/{profileId}/analytics
     * Retourne les analytics des vues
     */
    @GetMapping("/profiles/{profileId}/analytics")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ProfileViewAnalyticsResponse> getAnalytics(@PathVariable Long profileId) {
        return ResponseEntity.ok(profileViewService.getAnalytics(profileId));
    }
}