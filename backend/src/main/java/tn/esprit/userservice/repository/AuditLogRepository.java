package tn.esprit.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.userservice.entity.AuditLog;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByPerformedByOrderByCreatedAtDesc(String performedBy);

    List<AuditLog> findByTargetUserOrderByCreatedAtDesc(String targetUser);

    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);
}