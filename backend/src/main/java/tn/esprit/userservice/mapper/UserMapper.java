package tn.esprit.userservice.mapper;

import org.springframework.stereotype.Component;
import tn.esprit.userservice.dto.UserDTO;
import tn.esprit.userservice.entity.AccountStatus;
import tn.esprit.userservice.entity.KycStatus;
import tn.esprit.userservice.entity.User;

import java.time.LocalDateTime;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        String primaryRole = user.getRoles() != null && !user.getRoles().isEmpty()
                ? user.getRoles().iterator().next().name()
                : "USER";

        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhone())
                .role(primaryRole)
                .accountStatus(user.getAccountStatus() != null ? user.getAccountStatus().name() : null)
                .kycStatus(user.getKycStatus() != null ? user.getKycStatus().name() : null)
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Initialise les champs par défaut d'un nouvel utilisateur.
     * Utilisé par AuthServiceImpl.register() et UserServiceImpl.createUserByAdmin()
     */
    public void initNewUser(User user) {
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setKycStatus(KycStatus.PENDING);
        user.setEnabled(true);
        user.setAccountNonLocked(true);
        user.setTwoFactorEnabled(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
    }
}