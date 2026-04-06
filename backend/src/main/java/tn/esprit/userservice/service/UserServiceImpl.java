package tn.esprit.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.userservice.dto.AdminCreateUserRequest;
import tn.esprit.userservice.dto.UpdateProfileRequest;
import tn.esprit.userservice.dto.UserDTO;
import tn.esprit.userservice.entity.AccountStatus;
import tn.esprit.userservice.entity.Role;
import tn.esprit.userservice.entity.User;
import tn.esprit.userservice.exception.UserNotFoundException;
import tn.esprit.userservice.mapper.UserMapper;
import tn.esprit.userservice.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    // ==================== HELPER ====================

    private User findUserByCinOrThrow(Integer cin) {
        return userRepository.findByCin(cin)
                .orElseThrow(() -> new UserNotFoundException("User not found with cin: " + cin));
    }

    // ==================== GET BY CIN ====================

    @Override
    public UserDTO getUserById(Integer cin) {
        User user = findUserByCinOrThrow(cin);
        return userMapper.toDTO(user);
    }

    // ==================== GET BY EMAIL ====================

    @Override
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return userMapper.toDTO(user);
    }

    // ==================== UPDATE PROFILE ====================

    @Override
    public UserDTO updateProfile(Integer cin, UpdateProfileRequest request) {
        User user = findUserByCinOrThrow(cin);

        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName().trim());
        }

        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            user.setLastName(request.getLastName().trim());
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            user.setPhone(request.getPhoneNumber().trim());
        }

        if (request.getPhoto() != null && !request.getPhoto().trim().isEmpty()) {
            user.setPhoto(request.getPhoto().trim());
        }

        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);

        log.info("Profile updated for user: {}", updatedUser.getEmail());
        return userMapper.toDTO(updatedUser);
    }

    // ==================== GET ALL USERS ====================

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ==================== SEARCH USERS ====================

    @Override
    public List<UserDTO> searchUsers(String keyword) {
        return userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(keyword, keyword)
                .stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ==================== GET USERS BY ROLE ====================

    @Override
    public List<UserDTO> getUsersByRole(String role) {
        Role parsedRole = Role.valueOf(role.toUpperCase());

        return userRepository.findByRole(parsedRole)
                .stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ==================== GET USERS BY STATUS ====================

    @Override
    public List<UserDTO> getUsersByStatus(String status) {
        AccountStatus parsedStatus = AccountStatus.valueOf(status.toUpperCase());

        return userRepository.findByAccountStatus(parsedStatus)
                .stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ==================== DELETE USER ====================

    @Override
    public void deleteUser(Integer cin) {
        User user = findUserByCinOrThrow(cin);

        user.setAccountStatus(AccountStatus.DELETED);
        user.setEnabled(false);
        user.setAccountNonLocked(false);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        log.info("User soft-deleted: {}", user.getEmail());
    }

    // ==================== ADMIN CREATE USER ====================

    @Override
    public UserDTO createUserByAdmin(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }
        if (userRepository.existsByCin(request.getCin())) {
            throw new IllegalArgumentException("CIN already exists: " + request.getCin());
        }

        User user = new User();
        user.setCin(request.getCin());
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhoneNumber());
        user.setPhoto(request.getPhoto());
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));

        // Initialisation centralisée des champs par défaut
        userMapper.initNewUser(user);

        User savedUser = userRepository.save(user);

        log.info("Admin created new user: {}", savedUser.getEmail());
        return userMapper.toDTO(savedUser);
    }
}