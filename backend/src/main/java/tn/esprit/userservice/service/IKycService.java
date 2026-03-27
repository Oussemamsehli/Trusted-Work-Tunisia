package tn.esprit.userservice.service;

import tn.esprit.userservice.dto.KycReviewRequest;
import tn.esprit.userservice.dto.KycSubmitRequest;
import tn.esprit.userservice.dto.UserDTO;

import java.util.List;

public interface IKycService {

    UserDTO submitKyc(Long userId, KycSubmitRequest request);

    UserDTO reviewKyc(Long userId, KycReviewRequest request, String adminEmail);

    List<UserDTO> getPendingKycRequests();

    UserDTO getKycStatus(Long userId);
}
