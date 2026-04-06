package tn.esprit.userservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.userservice.dto.LoginRequest;
import tn.esprit.userservice.dto.RegisterRequest;
import tn.esprit.userservice.dto.VerifyTwoFactorRequest;
import tn.esprit.userservice.service.IAuthService;
import tn.esprit.userservice.service.ITwoFactorService;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Auth APIs: Register, Login, 2FA, Refresh Token")
public class AuthController {

    private final IAuthService authService;
    private final ITwoFactorService twoFactorService;

    @PostMapping("/register")
    @Operation(summary = "Register new user")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify-2fa")
    @Operation(summary = "Verify 2FA code after login")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> verifyTwoFactor(@Valid @RequestBody VerifyTwoFactorRequest request) {
        return ResponseEntity.ok(authService.verifyTwoFactor(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Refresh token is required"));
        }

        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

    @PostMapping("/setup-2fa/{cin}")
    @Operation(summary = "Initialize 2FA and return QR code URI")
    public ResponseEntity<?> setupTwoFactor(@PathVariable Integer cin) {
        String qrCodeUri = twoFactorService.setupTwoFactor(cin);

        return ResponseEntity.ok(Map.of(
                "qrCodeUri", qrCodeUri,
                "message", "2FA setup initialized successfully"
        ));
    }

    @PostMapping("/confirm-2fa/{cin}")
    @Operation(summary = "Confirm and enable 2FA using the first OTP code")
    public ResponseEntity<?> confirmTwoFactor(
            @PathVariable Integer cin,
            @RequestBody Map<String, String> request
    ) {
        String code = request.get("code");

        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "2FA code is required"));
        }

        twoFactorService.confirmTwoFactor(cin, code);

        return ResponseEntity.ok(Map.of(
                "message", "2FA enabled successfully"
        ));
    }

    @PostMapping("/disable-2fa/{cin}")
    @Operation(summary = "Disable 2FA for a user")
    public ResponseEntity<?> disableTwoFactor(@PathVariable Integer cin) {
        twoFactorService.disable2FA(cin);

        return ResponseEntity.ok(Map.of(
                "message", "2FA disabled successfully"
        ));
    }
}