package tn.esprit.userservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.esprit.userservice.dto.KycReviewRequest;
import tn.esprit.userservice.dto.KycSubmitRequest;
import tn.esprit.userservice.dto.UserDTO;
import tn.esprit.userservice.service.IKycService;

import java.util.List;

@RestController
@RequestMapping("/kyc")
@RequiredArgsConstructor
@Tag(name = "KYC Verification", description = "Submit and review KYC documents")
public class KycController {

    private final IKycService kycService;

    @PostMapping("/submit/{userId}")
    @Operation(summary = "Submit KYC documents for verification")
    public ResponseEntity<UserDTO> submitKyc(@PathVariable Long userId,
                                             @Valid @RequestBody KycSubmitRequest request) {
        return ResponseEntity.ok(kycService.submitKyc(userId, request));
    }

    @GetMapping("/status/{userId}")
    @Operation(summary = "Get KYC status for a user")
    public ResponseEntity<UserDTO> getKycStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(kycService.getKycStatus(userId));
    }

    // ==================== ADMIN ENDPOINTS ====================

    @GetMapping("/review/pending")
    @Operation(summary = "[ADMIN] List all users with pending KYC")
    public ResponseEntity<List<UserDTO>> getPendingKyc() {
        return ResponseEntity.ok(kycService.getPendingKycRequests());
    }

    @PutMapping("/review/{userId}")
    @Operation(summary = "[ADMIN] Approve or reject KYC for a user")
    public ResponseEntity<UserDTO> reviewKyc(@PathVariable Long userId,
                                             @Valid @RequestBody KycReviewRequest request,
                                             Authentication authentication) {
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(kycService.reviewKyc(userId, request, adminEmail));
    }
}
