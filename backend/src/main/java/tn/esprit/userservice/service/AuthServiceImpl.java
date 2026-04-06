package tn.esprit.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.userservice.dto.AuthResponse;
import tn.esprit.userservice.dto.LoginRequest;
import tn.esprit.userservice.dto.RegisterRequest;
import tn.esprit.userservice.dto.VerifyTwoFactorRequest;
import tn.esprit.userservice.entity.AccountStatus;
import tn.esprit.userservice.entity.Role;
import tn.esprit.userservice.entity.User;
import tn.esprit.userservice.exception.AccountSuspendedException;
import tn.esprit.userservice.exception.EmailAlreadyExistsException;
import tn.esprit.userservice.exception.InvalidCredentialsException;
import tn.esprit.userservice.exception.InvalidTwoFactorCodeException;
import tn.esprit.userservice.mapper.UserMapper;
import tn.esprit.userservice.repository.UserRepository;
import tn.esprit.userservice.security.JwtService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ITwoFactorService twoFactorService;
    private final UserMapper userMapper;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        if (userRepository.existsByCin(request.getCin())) {
            throw new IllegalArgumentException("CIN already registered: " + request.getCin());
        }

        User user = new User();
        user.setCin(request.getCin());
        user.setPhoto(request.getPhoto());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhoneNumber());

        Role role = Role.valueOf(request.getRole().toUpperCase());
        user.setRole(role);

        userMapper.initNewUser(user);

        User savedUser = userRepository.save(user);

        log.info("New user registered: {} with role {}", savedUser.getEmail(), role);

        String accessToken = jwtService.generateAccessToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(role.name())
                .twoFactorRequired(false)
                .message("Registration successful")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
            throw new AccountSuspendedException("Your account has been suspended");
        }

        if (!user.isEnabled() || !user.isAccountNonLocked()) {
            throw new AccountSuspendedException("Your account is disabled or locked");
        }

        if (user.getRole() == null) {
            log.error("Login blocked: user {} has no roles loaded from database", user.getEmail());
            throw new InvalidCredentialsException("User has no assigned role");
        }

        // Si 2FA activée, on ne génère pas encore les tokens
        if (user.isTwoFactorEnabled()) {
            log.info("2FA required for user {}", user.getEmail());

            return AuthResponse.builder()
                    .accessToken(null)
                    .refreshToken(null)
                    .tokenType("Bearer")
                    .userId(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .twoFactorRequired(true)
                    .message("2FA code required")
                    .build();
        }

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("User {} logged in with role {}", user.getEmail(), user.getRole());

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        String primaryRole = userMapper.toDTO(user).getRole();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .role(primaryRole)
                .twoFactorRequired(false)
                .message("Login successful")
                .build();
    }

    @Override
    public AuthResponse verifyTwoFactor(VerifyTwoFactorRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (!user.isTwoFactorEnabled()) {
            throw new InvalidTwoFactorCodeException("2FA is not enabled for this account");
        }

        boolean valid = twoFactorService.verifyCode(user.getSecret2FA(), request.getCode());

        if (!valid) {
            throw new InvalidTwoFactorCodeException("Invalid 2FA code");
        }

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        String primaryRole = userMapper.toDTO(user).getRole();

        log.info("2FA verified successfully for user {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .role(primaryRole)
                .twoFactorRequired(false)
                .message("2FA verification successful")
                .build();
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {

        if (!jwtService.isTokenValid(refreshToken)) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        String email = jwtService.extractEmail(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (user.getRole() == null) {
            log.error("Refresh token blocked: user {} has no role assigned", user.getEmail());
            throw new InvalidCredentialsException("User has no assigned role");
        }

        String newAccessToken = jwtService.generateAccessToken(user);
        String primaryRole = userMapper.toDTO(user).getRole();

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .role(primaryRole)
                .twoFactorRequired(false)
                .message("Token refreshed")
                .build();
    }
}