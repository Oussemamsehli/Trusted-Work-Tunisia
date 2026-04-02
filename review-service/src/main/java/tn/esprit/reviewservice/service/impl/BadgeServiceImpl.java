package tn.esprit.reviewservice.service.impl;

import org.springframework.stereotype.Service;
import tn.esprit.reviewservice.dto.request.BadgeRequest;
import tn.esprit.reviewservice.dto.response.BadgeResponse;
import tn.esprit.reviewservice.entity.Badge;
import tn.esprit.reviewservice.exception.ResourceNotFoundException;
import tn.esprit.reviewservice.mapper.BadgeMapper;
import tn.esprit.reviewservice.repository.BadgeRepository;
import tn.esprit.reviewservice.service.interfaces.IBadgeService;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class BadgeServiceImpl implements IBadgeService {

    private final BadgeRepository badgeRepository;
    private final BadgeMapper badgeMapper;


    public BadgeServiceImpl(BadgeRepository badgeRepository, BadgeMapper badgeMapper ) {
        this.badgeRepository = badgeRepository;
        this.badgeMapper = badgeMapper;

    }

    @Override
    public BadgeResponse createBadge(BadgeRequest request) {
        Badge badge = badgeMapper.toEntity(request);
        return badgeMapper.toResponse(badgeRepository.save(badge));
    }

    @Override
    public BadgeResponse updateBadge(Long id, BadgeRequest request) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badge introuvable"));

        badge.setName(request.getName());
        badge.setDescription(request.getDescription());
        badge.setCategorie(request.getCategorie());
        badge.setRarete(request.getRarete());
        badge.setPoints(request.getPoints());

        return badgeMapper.toResponse(badgeRepository.save(badge));
    }

    @Override
    public List<BadgeResponse> getAllBadges() {
        return badgeRepository.findAll()
                .stream()
                .map(badgeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BadgeResponse getBadgeById(Long id) {
        return badgeMapper.toResponse(
                badgeRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Badge introuvable"))
        );
    }

    @Override
    public void deleteBadge(Long id) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badge introuvable"));

        badgeRepository.delete(badge);
    }
}