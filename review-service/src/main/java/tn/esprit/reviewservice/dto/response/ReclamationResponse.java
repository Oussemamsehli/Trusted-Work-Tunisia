package tn.esprit.reviewservice.dto.response;

import lombok.*;
import tn.esprit.reviewservice.entity.enums.MotifReclamation;
import tn.esprit.reviewservice.entity.enums.StatusReclamation;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReclamationResponse {

    private Long id;
    private Long reviewId;
    private Long reportedByUserId;
    private MotifReclamation motif;
    private String description;
    private StatusReclamation status;

    private String adminComment;
    private Long processedByAdminId;
    private LocalDateTime processedAt;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}