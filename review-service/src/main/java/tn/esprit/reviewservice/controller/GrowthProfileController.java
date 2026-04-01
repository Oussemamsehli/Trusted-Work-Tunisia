package tn.esprit.reviewservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.reviewservice.dto.request.GrowthProfileRequest;
import tn.esprit.reviewservice.dto.response.GrowthProfileResponse;
import tn.esprit.reviewservice.service.interfaces.IGrowthProfileService;

import java.util.List;

@RestController
@RequestMapping("/api/growthprofiles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GrowthProfileController {

    private final IGrowthProfileService growthProfileService;

    @PostMapping
    public ResponseEntity<GrowthProfileResponse> createGrowthProfile(@Valid @RequestBody GrowthProfileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(growthProfileService.createGrowthProfile(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GrowthProfileResponse> updateGrowthProfile(@PathVariable Long id,
                                                                     @Valid @RequestBody GrowthProfileRequest request) {
        return ResponseEntity.ok(growthProfileService.updateGrowthProfile(id, request));
    }

    @GetMapping
    public ResponseEntity<List<GrowthProfileResponse>> getAllGrowthProfiles() {
        return ResponseEntity.ok(growthProfileService.getAllGrowthProfiles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrowthProfileResponse> getGrowthProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(growthProfileService.getGrowthProfileById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<GrowthProfileResponse> getGrowthProfileByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(growthProfileService.getGrowthProfileByUserId(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrowthProfile(@PathVariable Long id) {
        growthProfileService.deleteGrowthProfile(id);
        return ResponseEntity.noContent().build();
    }
}