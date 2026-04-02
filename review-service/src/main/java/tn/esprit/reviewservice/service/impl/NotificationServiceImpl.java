package tn.esprit.reviewservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.reviewservice.dto.request.NotificationRequest;
import tn.esprit.reviewservice.dto.response.NotificationResponse;
import tn.esprit.reviewservice.entity.Notification;
import tn.esprit.reviewservice.exception.ResourceNotFoundException;
import tn.esprit.reviewservice.mapper.NotificationMapper;
import tn.esprit.reviewservice.repository.NotificationRepository;
import tn.esprit.reviewservice.service.interfaces.INotificationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements INotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public NotificationResponse createNotification(NotificationRequest request) {
        Notification notification = notificationMapper.toEntity(request);
        Notification saved = notificationRepository.save(notification);
        return notificationMapper.toResponse(saved);
    }

    @Override
    public List<NotificationResponse> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponse> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long countUnreadNotifications(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification introuvable avec id : " + notificationId));

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());

        Notification updated = notificationRepository.save(notification);
        return notificationMapper.toResponse(updated);
    }

    @Override
    public List<NotificationResponse> markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);

        notifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        });

        List<Notification> updated = notificationRepository.saveAll(notifications);

        return updated.stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }
}