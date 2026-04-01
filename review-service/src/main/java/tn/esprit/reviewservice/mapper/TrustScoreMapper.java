package tn.esprit.reviewservice.mapper;

import org.springframework.stereotype.Component;
import tn.esprit.reviewservice.dto.request.TrustScoreRequest;
import tn.esprit.reviewservice.dto.response.TrustScoreResponse;
import tn.esprit.reviewservice.entity.TrustScore;
import tn.esprit.reviewservice.entity.enums.CategorieConfiance;
import tn.esprit.reviewservice.entity.enums.Tendance;

@Component
public class TrustScoreMapper {

    public TrustScore toEntity(TrustScoreRequest request) {
        if (request == null) {
            return null;
        }

        TrustScore trustScore = new TrustScore();
        trustScore.setUserId(request.getUserId());
        trustScore.setScore(request.getScore());
        trustScore.setAverageRating(request.getAverageRating());
        trustScore.setTotalReviews(request.getTotalReviews());
        trustScore.setCategorie(
                request.getCategorie() != null ? request.getCategorie() : CategorieConfiance.FAIBLE
        );
        trustScore.setTendance(
                request.getTendance() != null ? request.getTendance() : Tendance.STABLE
        );

        return trustScore;
    }

    public TrustScoreResponse toResponse(TrustScore trustScore) {
        if (trustScore == null) {
            return null;
        }

        return TrustScoreResponse.builder()
                .id(trustScore.getId())
                .userId(trustScore.getUserId())
                .score(trustScore.getScore())
                .averageRating(trustScore.getAverageRating())
                .totalReviews(trustScore.getTotalReviews())
                .categorie(
                        trustScore.getCategorie() != null ? trustScore.getCategorie() : CategorieConfiance.FAIBLE
                )
                .tendance(
                        trustScore.getTendance() != null ? trustScore.getTendance() : Tendance.STABLE
                )
                .updatedAt(trustScore.getUpdatedAt())
                .build();
    }
}