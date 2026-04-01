package tn.esprit.reviewservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.reviewservice.dto.request.TrustScoreRequest;
import tn.esprit.reviewservice.dto.response.TrustScoreResponse;
import tn.esprit.reviewservice.service.interfaces.ITrustScoreService;

import java.util.List;

@RestController
@RequestMapping("/api/trustscores")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrustScoreController {

    private final ITrustScoreService trustScoreService;

    @PostMapping
    public ResponseEntity<TrustScoreResponse> createTrustScore(@Valid @RequestBody TrustScoreRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trustScoreService.createTrustScore(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrustScoreResponse> updateTrustScore(@PathVariable Long id,
                                                               @Valid @RequestBody TrustScoreRequest request) {
        return ResponseEntity.ok(trustScoreService.updateTrustScore(id, request));
    }

    @GetMapping
    public ResponseEntity<List<TrustScoreResponse>> getAllTrustScores() {
        return ResponseEntity.ok(trustScoreService.getAllTrustScores());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrustScoreResponse> getTrustScoreById(@PathVariable Long id) {
        return ResponseEntity.ok(trustScoreService.getTrustScoreById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<TrustScoreResponse> getTrustScoreByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(trustScoreService.getTrustScoreByUserId(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrustScore(@PathVariable Long id) {
        trustScoreService.deleteTrustScore(id);
        return ResponseEntity.noContent().build();
    }
}