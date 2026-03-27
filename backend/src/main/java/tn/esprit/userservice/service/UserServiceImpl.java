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
import java.util.HashSet;
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

    private User findUserByIdOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }

    // ==================== GET BY ID ====================

    @Override
    public UserDTO getUserById(Long id) {
        User user = findUserByIdOrThrow(id);
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
    public UserDTO updateProfile(Long id, UpdateProfileRequest request) {
        User user = findUserByIdOrThrow(id);

        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName().trim());
        }

        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            user.setLastName(request.getLastName().trim());
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            user.setPhone(request.getPhoneNumber().trim());
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

        return userRepository.findByRolesContaining(parsedRole)
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
    public void deleteUser(Long id) {
        User user = findUserByIdOrThrow(id);

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

        User user = new User();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhoneNumber());

        HashSet<Role> roles = new HashSet<>();
        roles.add(Role.valueOf(request.getRole().toUpperCase()));
        user.setRoles(roles);

        // Initialisation centralisée des champs par défaut
        userMapper.initNewUser(user);

        User savedUser = userRepository.save(user);

        log.info("Admin created new user: {}", savedUser.getEmail());
        return userMapper.toDTO(savedUser);
    }
}