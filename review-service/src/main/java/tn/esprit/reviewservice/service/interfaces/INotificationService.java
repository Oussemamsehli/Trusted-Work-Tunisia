package tn.esprit.reviewservice.service.interfaces;

import tn.esprit.reviewservice.dto.request.NotificationRequest;
import tn.esprit.reviewservice.dto.response.NotificationResponse;

import java.util.List;

public interface INotificationService {

    NotificationResponse createNotification(NotificationRequest request);

    List<NotificationResponse> getNotificationsByUserId(Long userId);

    List<NotificationResponse> getUnreadNotificationsByUserId(Long userId);

    long countUnreadNotifications(Long userId);

    NotificationResponse markAsRead(Long notificationId);

    List<NotificationResponse> markAllAsRead(Long userId);
}