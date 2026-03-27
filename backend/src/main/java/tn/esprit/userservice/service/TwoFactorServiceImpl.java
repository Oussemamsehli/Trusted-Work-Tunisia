package tn.esprit.userservice.service;

import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tn.esprit.userservice.entity.User;
import tn.esprit.userservice.exception.UserNotFoundException;
import tn.esprit.userservice.repository.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class TwoFactorServiceImpl implements ITwoFactorService {

    private final UserRepository userRepository;

    @Value("${app.2fa.issuer}")
    private String issuer;

    // ==================== GENERATE SECRET ====================

    @Override
    public String generateSecret() {
        SecretGenerator secretGenerator = new DefaultSecretGenerator(32);
        return secretGenerator.generate();
    }

    // ==================== QR CODE URI ====================

    @Override
    public String getQrCodeUri(String secret, String email) {
        // Format otpauth standard pour Google Authenticator
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                issuer, email, secret, issuer);
    }

    // ==================== VERIFY CODE ====================

    @Override
    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null) return false;

        CodeVerifier verifier = new DefaultCodeVerifier(
                new DefaultCodeGenerator(HashingAlgorithm.SHA1),
                new SystemTimeProvider()
        );
        return verifier.isValidCode(secret, code);
    }

    // ==================== ENABLE 2FA ====================

    @Override
    public void enable2FA(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        String secret = generateSecret();
        user.setSecret2FA(secret);
        user.setTwoFactorEnabled(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("2FA enabled for user: {}", user.getEmail());
    }

    // ==================== DISABLE 2FA ====================

    @Override
    public void disable2FA(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        user.setSecret2FA(null);
        user.setTwoFactorEnabled(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("2FA disabled for user: {}", user.getEmail());
    }
}
