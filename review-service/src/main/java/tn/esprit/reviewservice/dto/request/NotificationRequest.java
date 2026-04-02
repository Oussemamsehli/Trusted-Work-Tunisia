package tn.esprit.reviewservice.dto.request;

import lombok.*;
import tn.esprit.reviewservice.entity.enums.NotificationChannel;
import tn.esprit.reviewservice.entity.enums.NotificationPriority;
import tn.esprit.reviewservice.entity.enums.NotificationType;
import tn.esprit.reviewservice.entity.enums.RelatedEntityType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {

    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationChannel channel;
    private NotificationPriority priority;
    private RelatedEntityType relatedEntityType;
    private Long relatedEntityId;
}