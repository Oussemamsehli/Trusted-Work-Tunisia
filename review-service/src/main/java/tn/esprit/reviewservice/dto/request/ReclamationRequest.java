package tn.esprit.reviewservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.reviewservice.entity.enums.MotifReclamation;

@Getter
@Setter
public class ReclamationRequest {

    @NotNull(message = "reviewId est obligatoire")
    private Long reviewId;

    @NotNull(message = "reportedByUserId est obligatoire")
    private Long reportedByUserId;

    @NotNull(message = "motif est obligatoire")
    private MotifReclamation motif;

    private String description;
}