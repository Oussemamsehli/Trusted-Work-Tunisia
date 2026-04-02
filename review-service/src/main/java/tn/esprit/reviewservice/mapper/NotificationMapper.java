package tn.esprit.reviewservice.mapper;

import org.springframework.stereotype.Component;
import tn.esprit.reviewservice.dto.request.NotificationRequest;
import tn.esprit.reviewservice.dto.response.NotificationResponse;
import tn.esprit.reviewservice.entity.Notification;

@Component
public class NotificationMapper {

    public Notification toEntity(NotificationRequest request) {
        if (request == null) {
            return null;
        }

        return Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .channel(request.getChannel())
                .priority(request.getPriority())
                .relatedEntityType(request.getRelatedEntityType())
                .relatedEntityId(request.getRelatedEntityId())
                .build();
    }

    public NotificationResponse toResponse(Notification notification) {
        if (notification == null) {
            return null;
        }

        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .channel(notification.getChannel())
                .priority(notification.getPriority())
                .relatedEntityType(notification.getRelatedEntityType())
                .relatedEntityId(notification.getRelatedEntityId())
                .isRead(notification.getIsRead())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}