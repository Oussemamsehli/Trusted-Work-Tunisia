package tn.esprit.reviewservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.reviewservice.dto.request.NotificationRequest;
import tn.esprit.reviewservice.dto.response.NotificationResponse;
import tn.esprit.reviewservice.service.interfaces.INotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final INotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(@RequestBody NotificationRequest request) {
        return ResponseEntity.ok(notificationService.createNotification(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotificationsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsByUserId(userId));
    }

    @GetMapping("/user/{userId}/count-unread")
    public ResponseEntity<Long> countUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.countUnreadNotifications(userId));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<List<NotificationResponse>> markAllAsRead(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.markAllAsRead(userId));
    }
}