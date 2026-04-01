package tn.esprit.reviewservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.reviewservice.dto.request.BadgeRequest;
import tn.esprit.reviewservice.dto.response.BadgeResponse;
import tn.esprit.reviewservice.service.interfaces.IBadgeService;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
@CrossOrigin("*")
public class BadgeController {

    private final IBadgeService badgeService;

    @PostMapping
    public ResponseEntity<BadgeResponse> create(@Valid @RequestBody BadgeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(badgeService.createBadge(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BadgeResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody BadgeRequest request) {
        return ResponseEntity.ok(badgeService.updateBadge(id, request));
    }

    @GetMapping
    public ResponseEntity<List<BadgeResponse>> getAll() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BadgeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(badgeService.getBadgeById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        badgeService.deleteBadge(id);
        return ResponseEntity.noContent().build();
    }
}