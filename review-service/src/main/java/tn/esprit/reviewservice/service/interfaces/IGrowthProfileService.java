package tn.esprit.reviewservice.service.interfaces;

import tn.esprit.reviewservice.dto.request.GrowthProfileRequest;
import tn.esprit.reviewservice.dto.response.GrowthProfileResponse;

import java.util.List;

public interface IGrowthProfileService {

    GrowthProfileResponse createGrowthProfile(GrowthProfileRequest request);

    GrowthProfileResponse updateGrowthProfile(Long id, GrowthProfileRequest request);

    List<GrowthProfileResponse> getAllGrowthProfiles();

    GrowthProfileResponse getGrowthProfileById(Long id);

    GrowthProfileResponse getGrowthProfileByUserId(Long userId);

    void deleteGrowthProfile(Long id);
}