package tn.esprit.reviewservice.mapper;

import org.springframework.stereotype.Component;
import tn.esprit.reviewservice.dto.request.ReclamationRequest;
import tn.esprit.reviewservice.dto.response.ReclamationResponse;
import tn.esprit.reviewservice.entity.Reclamation;

@Component
public class ReclamationMapper {

    public Reclamation toEntity(ReclamationRequest request) {
        Reclamation reclamation = new Reclamation();
        reclamation.setReportedByUserId(request.getReportedByUserId());
        reclamation.setMotif(request.getMotif());
        reclamation.setDescription(request.getDescription());
        return reclamation;
    }

    public ReclamationResponse toResponse(Reclamation reclamation) {
        return ReclamationResponse.builder()
                .id(reclamation.getId())
                .reviewId(reclamation.getReview() != null ? reclamation.getReview().getId() : null)
                .reportedByUserId(reclamation.getReportedByUserId())
                .motif(reclamation.getMotif())
                .description(reclamation.getDescription())
                .status(reclamation.getStatus())
                .createdAt(reclamation.getCreatedAt())
                .resolvedAt(reclamation.getResolvedAt())
                .build();
    }
}