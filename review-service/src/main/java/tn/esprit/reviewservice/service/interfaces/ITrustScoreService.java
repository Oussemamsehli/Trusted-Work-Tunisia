package tn.esprit.reviewservice.service.interfaces;

import tn.esprit.reviewservice.dto.request.TrustScoreRequest;
import tn.esprit.reviewservice.dto.response.TrustScoreResponse;

import java.util.List;

public interface ITrustScoreService {

    TrustScoreResponse createTrustScore(TrustScoreRequest request);

    TrustScoreResponse updateTrustScore(Long id, TrustScoreRequest request);

    List<TrustScoreResponse> getAllTrustScores();

    TrustScoreResponse getTrustScoreById(Long id);

    TrustScoreResponse getTrustScoreByUserId(Long userId);

    void deleteTrustScore(Long id);
}