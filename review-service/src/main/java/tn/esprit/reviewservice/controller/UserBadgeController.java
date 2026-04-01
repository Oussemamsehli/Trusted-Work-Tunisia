package tn.esprit.reviewservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.reviewservice.dto.request.UserBadgeRequest;
import tn.esprit.reviewservice.dto.response.UserBadgeResponse;
import tn.esprit.reviewservice.service.interfaces.IUserBadgeService;

import java.util.List;

@RestController
@RequestMapping("/api/userbadges")
@RequiredArgsConstructor
@CrossOrigin("*")
public class UserBadgeController {

    private final IUserBadgeService service;

    @PostMapping
    public ResponseEntity<UserBadgeResponse> assign(@Valid @RequestBody UserBadgeRequest request) {
        return ResponseEntity.ok(service.assignBadge(request));
    }

    @GetMapping
    public ResponseEntity<List<UserBadgeResponse>> getAll() {
        return ResponseEntity.ok(service.getAllUserBadges());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserBadgeResponse>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getBadgesByUser(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteUserBadge(id);
        return ResponseEntity.noContent().build();
    }
}