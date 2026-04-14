package tn.esprit.freelancerprofileservice.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.freelancerprofileservice.dto.request.AddReportRequest;
import tn.esprit.freelancerprofileservice.entities.ProfileReport;
import tn.esprit.freelancerprofileservice.enums.ReportStatus;
import tn.esprit.freelancerprofileservice.services.IProfileReportService;

import java.util.List;

/**
 * Controller REST — gestion des signalements de profils
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final IProfileReportService reportService;

    // POST /api/reports/profile/{profileId} — tout utilisateur connecté peut signaler
    @PostMapping("/profile/{profileId}")
    public ResponseEntity<ProfileReport> reportProfile(
            @PathVariable Long profileId,
            @Valid @RequestBody AddReportRequest request) {

        ProfileReport saved = reportService.reportProfile(
                profileId, request.getReporterId(), request.getReason());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // GET /api/reports/pending — ADMIN uniquement
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProfileReport>> getPendingReports() {
        return ResponseEntity.ok(reportService.getPendingReports());
    }

    // PATCH /api/reports/{reportId}/resolve — ADMIN uniquement
    @PatchMapping("/{reportId}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProfileReport> resolveReport(
            @PathVariable Long reportId,
            @RequestParam ReportStatus status) {
        return ResponseEntity.ok(reportService.resolveReport(reportId, status));
    }
}