package tn.esprit.reviewservice.service.interfaces;

import tn.esprit.reviewservice.dto.request.ReclamationRequest;
import tn.esprit.reviewservice.dto.response.ReclamationResponse;

import java.util.List;

public interface IReclamationService {

    ReclamationResponse createReclamation(ReclamationRequest request);

    List<ReclamationResponse> getAllReclamations();

    ReclamationResponse getReclamationById(Long id);

    ReclamationResponse resolveReclamation(Long id);

    void deleteReclamation(Long id);
}