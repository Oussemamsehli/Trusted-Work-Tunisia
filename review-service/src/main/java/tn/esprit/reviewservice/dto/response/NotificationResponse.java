package tn.esprit.reviewservice.dto.response;

import lombok.*;
import tn.esprit.reviewservice.entity.enums.NotificationChannel;
import tn.esprit.reviewservice.entity.enums.NotificationPriority;
import tn.esprit.reviewservice.entity.enums.NotificationType;
import tn.esprit.reviewservice.entity.enums.RelatedEntityType;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationChannel channel;
    private NotificationPriority priority;
    private RelatedEntityType relatedEntityType;
    private Long relatedEntityId;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}