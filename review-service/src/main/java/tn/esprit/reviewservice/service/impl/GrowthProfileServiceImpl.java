package tn.esprit.reviewservice.service.impl;

import org.springframework.stereotype.Service;
import tn.esprit.reviewservice.dto.request.GrowthProfileRequest;
import tn.esprit.reviewservice.dto.response.GrowthProfileResponse;
import tn.esprit.reviewservice.entity.GrowthProfile;
import tn.esprit.reviewservice.exception.ResourceNotFoundException;
import tn.esprit.reviewservice.mapper.GrowthProfileMapper;
import tn.esprit.reviewservice.repository.GrowthProfileRepository;
import tn.esprit.reviewservice.service.interfaces.IGrowthProfileService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GrowthProfileServiceImpl implements IGrowthProfileService {

    private final GrowthProfileRepository growthProfileRepository;
    private final GrowthProfileMapper growthProfileMapper;

    public GrowthProfileServiceImpl(GrowthProfileRepository growthProfileRepository,
                                    GrowthProfileMapper growthProfileMapper) {
        this.growthProfileRepository = growthProfileRepository;
        this.growthProfileMapper = growthProfileMapper;
    }

    @Override
    public GrowthProfileResponse createGrowthProfile(GrowthProfileRequest request) {
        GrowthProfile growthProfile = growthProfileMapper.toEntity(request);
        GrowthProfile savedGrowthProfile = growthProfileRepository.save(growthProfile);
        return growthProfileMapper.toResponse(savedGrowthProfile);
    }

    @Override
    public GrowthProfileResponse updateGrowthProfile(Long id, GrowthProfileRequest request) {
        GrowthProfile existingGrowthProfile = growthProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GrowthProfile introuvable avec id : " + id));

        existingGrowthProfile.setUserId(request.getUserId());
        existingGrowthProfile.setXp(request.getXp());
        existingGrowthProfile.setLevel(request.getLevel());
        existingGrowthProfile.setNiveau(request.getNiveau());
        existingGrowthProfile.setStreakDays(request.getStreakDays());
        existingGrowthProfile.setLongestStreak(request.getLongestStreak());
        existingGrowthProfile.setLastActivityDate(request.getLastActivityDate());
        existingGrowthProfile.setBadgesCount(request.getBadgesCount());
        existingGrowthProfile.setProfileCompleted(request.getProfileCompleted());

        GrowthProfile updatedGrowthProfile = growthProfileRepository.save(existingGrowthProfile);
        return growthProfileMapper.toResponse(updatedGrowthProfile);
    }

    @Override
    public List<GrowthProfileResponse> getAllGrowthProfiles() {
        return growthProfileRepository.findAll()
                .stream()
                .map(growthProfileMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public GrowthProfileResponse getGrowthProfileById(Long id) {
        GrowthProfile growthProfile = growthProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GrowthProfile introuvable avec id : " + id));
        return growthProfileMapper.toResponse(growthProfile);
    }

    @Override
    public GrowthProfileResponse getGrowthProfileByUserId(Long userId) {
        GrowthProfile growthProfile = growthProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("GrowthProfile introuvable pour userId : " + userId));
        return growthProfileMapper.toResponse(growthProfile);
    }

    @Override
    public void deleteGrowthProfile(Long id) {
        GrowthProfile growthProfile = growthProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GrowthProfile introuvable avec id : " + id));

        growthProfileRepository.delete(growthProfile);
    }
}