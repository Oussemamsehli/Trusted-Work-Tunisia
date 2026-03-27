package tn.esprit.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.userservice.entity.AccountStatus;
import tn.esprit.userservice.entity.KycStatus;
import tn.esprit.userservice.entity.Role;
import tn.esprit.userservice.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ================= AUTH =================
    Optional<User> findByEmail(String email);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles WHERE u.email = :email")
    Optional<User> findByEmailWithRoles(@Param("email") String email);

    boolean existsByEmail(String email);

    // ================= FILTERS =================
    List<User> findByAccountStatus(AccountStatus accountStatus);

    List<User> findByKycStatus(KycStatus kycStatus);

    List<User> findByEnabled(boolean enabled);

    // ================= SEARCH =================
    List<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);

    List<User> findByFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(String firstName, String lastName);

    // ================= ROLE =================
    List<User> findByRolesContaining(Role role);

    // ================= STATS =================
    long countByRolesContaining(Role role);

    long countByAccountStatus(AccountStatus status);

    long countByKycStatus(KycStatus status);
}