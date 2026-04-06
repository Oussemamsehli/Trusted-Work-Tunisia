package tn.esprit.userservice.service;

import tn.esprit.userservice.dto.AdminCreateUserRequest;
import tn.esprit.userservice.dto.UpdateProfileRequest;
import tn.esprit.userservice.dto.UserDTO;

import java.util.List;

public interface IUserService {

    UserDTO getUserById(Integer cin);

    UserDTO getUserByEmail(String email);

    UserDTO updateProfile(Integer cin, UpdateProfileRequest request);

    List<UserDTO> getAllUsers();

    List<UserDTO> searchUsers(String keyword);

    List<UserDTO> getUsersByRole(String role);

    List<UserDTO> getUsersByStatus(String status);

    void deleteUser(Integer cin);

    UserDTO createUserByAdmin(AdminCreateUserRequest request);
}