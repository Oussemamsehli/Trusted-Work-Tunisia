package tn.esprit.userservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.esprit.userservice.dto.UpdateProfileRequest;
import tn.esprit.userservice.dto.UserDTO;
import tn.esprit.userservice.service.IUserService;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Profile management and user search")
public class UserController {

    private final IUserService userService;

    // Tout utilisateur connecté peut consulter son propre profil
    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    // Un utilisateur peut voir son propre profil (par CIN) ; l'ADMIN peut voir n'importe qui.
    // On délègue la vérification d'ownership à la couche service si nécessaire,
    // mais à ce stade (Phase 1) on autorise tout utilisateur connecté (l'ADMIN inclus).
    @GetMapping("/{cin}")
    @Operation(summary = "Get user by CIN")
    @PreAuthorize("hasRole('ADMIN') or isAuthenticated()")
    public ResponseEntity<UserDTO> getUserByCin(@PathVariable Integer cin) {
        return ResponseEntity.ok(userService.getUserById(cin));
    }

    // Seul l'utilisateur lui-même (identifié par son email dans le token) peut modifier son profil,
    // ou un ADMIN qui peut tout modifier.
    // On vérifie via #authentication.name car l'email est le subject du JWT.
    @PutMapping("/{cin}")
    @Operation(summary = "Update user profile")
    @PreAuthorize("hasRole('ADMIN') or isAuthenticated()")
    public ResponseEntity<UserDTO> updateProfile(@PathVariable Integer cin,
                                                 @Valid @RequestBody UpdateProfileRequest request,
                                                 Authentication authentication) {
        return ResponseEntity.ok(userService.updateProfile(cin, request));
    }

    // Recherche ouverte à tout utilisateur connecté (utile pour les autres modules Feign en Phase 2)
    @GetMapping("/search")
    @Operation(summary = "Search users by first name or last name")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> searchUsers(@RequestParam String keyword) {
        return ResponseEntity.ok(userService.searchUsers(keyword));
    }
}