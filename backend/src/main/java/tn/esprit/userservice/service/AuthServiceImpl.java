package tn.esprit.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.userservice.dto.AuthResponse;
import tn.esprit.userservice.dto.LoginRequest;
import tn.esprit.userservice.dto.RegisterRequest;
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
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ITwoFactorService twoFactorService;
    private final UserMapper userMapper;

    // ==================== REGISTER ====================

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhoneNumber());

        Role role = Role.valueOf(request.getRole().toUpperCase());
        user.setRoles(Set.of(role));

        // Initialisation centralisée des champs par défaut
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

    // ==================== LOGIN ====================

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmailWithRoles(request.getEmail())
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

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            log.error("Login blocked: user {} has no roles loaded from database", user.getEmail());
            throw new InvalidCredentialsException("User has no assigned role");
        }

        // ================= 2FA =================
        if (user.isTwoFactorEnabled()) {

            if (request.getTwoFactorCode() == null || request.getTwoFactorCode().isBlank()) {
                return new AuthResponse("2FA code required", true);
            }

            boolean valid = twoFactorService.verifyCode(user.getSecret2FA(), request.getTwoFactorCode());

            if (!valid) {
                throw new InvalidTwoFactorCodeException("Invalid 2FA code");
            }
        }

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("User {} loaded with roles {}", user.getEmail(), user.getRoles());

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        String primaryRole = userMapper.toDTO(user).getRole();

        log.info("User logged in: {}", user.getEmail());

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

    // ==================== REFRESH TOKEN ====================

    @Override
    public AuthResponse refreshToken(String refreshToken) {

        if (!jwtService.isTokenValid(refreshToken)) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        String email = jwtService.extractEmail(refreshToken);

        User user = userRepository.findByEmailWithRoles(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            log.error("Refresh token blocked: user {} has no roles loaded from database", user.getEmail());
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