package tn.esprit.reviewservice.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.MotifReclamation;
import tn.esprit.reviewservice.entity.enums.StatusReclamation;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ReclamationResponse {

    private Long id;
    private Long reviewId;
    private Long reportedByUserId;
    private MotifReclamation motif;
    private String description;
    private StatusReclamation status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}