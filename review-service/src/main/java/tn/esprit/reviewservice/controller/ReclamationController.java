package tn.esprit.reviewservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.reviewservice.dto.request.ReclamationRequest;
import tn.esprit.reviewservice.dto.response.ReclamationResponse;
import tn.esprit.reviewservice.entity.enums.StatusReclamation;
import tn.esprit.reviewservice.service.interfaces.IReclamationService;

import java.util.List;

@RestController
@RequestMapping("/api/reclamations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReclamationController {

    private final IReclamationService reclamationService;

    @PostMapping
    public ResponseEntity<ReclamationResponse> createReclamation(@Valid @RequestBody ReclamationRequest request) {
        return ResponseEntity.ok(reclamationService.createReclamation(request));
    }

    @GetMapping
    public ResponseEntity<List<ReclamationResponse>> getAllReclamations() {
        return ResponseEntity.ok(reclamationService.getAllReclamations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReclamationResponse> getReclamationById(@PathVariable Long id) {
        return ResponseEntity.ok(reclamationService.getReclamationById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ReclamationResponse>> getReclamationsByStatus(@PathVariable StatusReclamation status) {
        return ResponseEntity.ok(reclamationService.getReclamationsByStatus(status));
    }

    @PutMapping("/{id}/in-review")
    public ResponseEntity<ReclamationResponse> markInReview(@PathVariable Long id,
                                                            @RequestParam Long adminId,
                                                            @RequestParam(required = false) String adminComment) {
        return ResponseEntity.ok(reclamationService.markInReview(id, adminId, adminComment));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ReclamationResponse> confirmReclamation(@PathVariable Long id,
                                                                  @RequestParam Long adminId,
                                                                  @RequestParam(required = false) String adminComment) {
        return ResponseEntity.ok(reclamationService.confirmReclamation(id, adminId, adminComment));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ReclamationResponse> rejectReclamation(@PathVariable Long id,
                                                                 @RequestParam Long adminId,
                                                                 @RequestParam(required = false) String adminComment) {
        return ResponseEntity.ok(reclamationService.rejectReclamation(id, adminId, adminComment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReclamation(@PathVariable Long id) {
        reclamationService.deleteReclamation(id);
        return ResponseEntity.noContent().build();
    }
}