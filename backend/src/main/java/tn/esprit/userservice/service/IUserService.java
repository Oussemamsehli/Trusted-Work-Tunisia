package tn.esprit.userservice.service;

import tn.esprit.userservice.dto.AdminCreateUserRequest;
import tn.esprit.userservice.dto.UpdateProfileRequest;
import tn.esprit.userservice.dto.UserDTO;

import java.util.List;

public interface IUserService {

    UserDTO getUserById(Long id);

    UserDTO getUserByEmail(String email);

    UserDTO updateProfile(Long id, UpdateProfileRequest request);

    List<UserDTO> getAllUsers();

    List<UserDTO> searchUsers(String keyword);

    List<UserDTO> getUsersByRole(String role);

    List<UserDTO> getUsersByStatus(String status);

    void deleteUser(Long id);

    UserDTO createUserByAdmin(AdminCreateUserRequest request);
}