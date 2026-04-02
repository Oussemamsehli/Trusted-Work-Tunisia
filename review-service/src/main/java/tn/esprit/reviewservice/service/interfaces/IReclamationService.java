package tn.esprit.reviewservice.service.interfaces;

import tn.esprit.reviewservice.dto.request.ReclamationRequest;
import tn.esprit.reviewservice.dto.response.ReclamationResponse;
import tn.esprit.reviewservice.entity.enums.StatusReclamation;

import java.util.List;

public interface IReclamationService {

    ReclamationResponse createReclamation(ReclamationRequest request);

    List<ReclamationResponse> getAllReclamations();

    List<ReclamationResponse> getReclamationsByStatus(StatusReclamation status);

    ReclamationResponse getReclamationById(Long id);

    ReclamationResponse markInReview(Long id, Long adminId, String adminComment);

    ReclamationResponse confirmReclamation(Long id, Long adminId, String adminComment);

    ReclamationResponse rejectReclamation(Long id, Long adminId, String adminComment);

    void deleteReclamation(Long id);
}