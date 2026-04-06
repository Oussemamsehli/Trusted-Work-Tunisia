package tn.esprit.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.userservice.dto.KycReviewRequest;
import tn.esprit.userservice.dto.KycSubmitRequest;
import tn.esprit.userservice.dto.UserDTO;
import tn.esprit.userservice.entity.AuditLog;
import tn.esprit.userservice.entity.KycStatus;
import tn.esprit.userservice.entity.User;
import tn.esprit.userservice.exception.KycAlreadySubmittedException;
import tn.esprit.userservice.exception.UserNotFoundException;
import tn.esprit.userservice.mapper.UserMapper;
import tn.esprit.userservice.repository.AuditLogRepository;
import tn.esprit.userservice.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycServiceImpl implements IKycService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserMapper userMapper;

    // ==================== HELPER ====================

    private User findUserByCinOrThrow(Integer cin) {
        return userRepository.findByCin(cin)
                .orElseThrow(() -> new UserNotFoundException("User not found with cin: " + cin));
    }

    // ==================== SUBMIT KYC ====================

    @Override
    public UserDTO submitKyc(Integer cin, KycSubmitRequest request) {
        User user = findUserByCinOrThrow(cin);

        if (user.getKycStatus() == KycStatus.APPROVED) {
            throw new KycAlreadySubmittedException("KYC already approved for this user");
        }

        if (user.getKycStatus() == KycStatus.IN_REVIEW) {
            throw new KycAlreadySubmittedException("KYC already submitted and under review");
        }

        user.setKycStatus(KycStatus.IN_REVIEW);
        user.setUpdatedAt(LocalDateTime.now());

        User updated = userRepository.save(user);

        saveAuditLog("KYC_SUBMITTED", user.getEmail(), user.getEmail(),
                "CIN: " + request.getCinNumber());

        log.info("KYC submitted by user: {}", user.getEmail());

        return userMapper.toDTO(updated);
    }
    // ==================== REVIEW KYC (ADMIN) ====================

    @Override
    public UserDTO reviewKyc(Integer cin, KycReviewRequest request, String adminEmail) {
        User user = findUserByCinOrThrow(cin);

        String decision = request.getDecision().toUpperCase();

        if ("APPROVED".equals(decision)) {
            user.setKycStatus(KycStatus.APPROVED);
        } else if ("REJECTED".equals(decision)) {
            user.setKycStatus(KycStatus.REJECTED);
        } else {
            throw new IllegalArgumentException("Decision must be APPROVED or REJECTED");
        }

        user.setUpdatedAt(LocalDateTime.now());

        User updated = userRepository.save(user);

        saveAuditLog("KYC_" + decision, adminEmail, user.getEmail(),
                "Reject reason: " + request.getRejectReason());

        return userMapper.toDTO(updated);
    }

    // ==================== GET PENDING KYC ====================

    @Override
    public List<UserDTO> getPendingKycRequests() {
        return userRepository.findByKycStatus(KycStatus.IN_REVIEW).stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ==================== GET KYC STATUS ====================

    @Override
    public UserDTO getKycStatus(Integer cin) {
        User user = findUserByCinOrThrow(cin);
        return userMapper.toDTO(user);
    }

    // ==================== AUDIT LOG ====================

    private void saveAuditLog(String action, String performedBy, String targetUser, String details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setPerformedBy(performedBy);
        auditLog.setTargetUser(targetUser);
        auditLog.setDetails(details);
        auditLog.setCreatedAt(LocalDateTime.now());
        auditLogRepository.save(auditLog);
    }
}