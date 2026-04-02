package tn.esprit.reviewservice.entity;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.reviewservice.entity.enums.NotificationChannel;
import tn.esprit.reviewservice.entity.enums.NotificationPriority;
import tn.esprit.reviewservice.entity.enums.NotificationType;
import tn.esprit.reviewservice.entity.enums.RelatedEntityType;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RelatedEntityType relatedEntityType;

    private Long relatedEntityId;

    @Builder.Default
    private Boolean isRead = false;

    private LocalDateTime readAt;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = false;
        }
        if (channel == null) {
            channel = NotificationChannel.IN_APP;
        }
        if (priority == null) {
            priority = NotificationPriority.MEDIUM;
        }
        if (relatedEntityType == null) {
            relatedEntityType = RelatedEntityType.SYSTEM;
        }
    }
}