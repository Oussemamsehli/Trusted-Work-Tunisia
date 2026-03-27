package tn.esprit.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KycSubmitRequest {

    @NotBlank(message = "CIN number is required")
    private String cinNumber;

    @NotBlank(message = "CIN document path is required")
    private String cinDocumentPath;

    private String diplomaDocumentPath;
}