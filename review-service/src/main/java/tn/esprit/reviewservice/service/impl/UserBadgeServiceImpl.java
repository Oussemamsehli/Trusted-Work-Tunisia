package tn.esprit.reviewservice.service.impl;

import org.springframework.stereotype.Service;
import tn.esprit.reviewservice.dto.request.UserBadgeRequest;
import tn.esprit.reviewservice.dto.response.UserBadgeResponse;
import tn.esprit.reviewservice.entity.Badge;
import tn.esprit.reviewservice.entity.UserBadge;
import tn.esprit.reviewservice.exception.ResourceNotFoundException;
import tn.esprit.reviewservice.mapper.UserBadgeMapper;
import tn.esprit.reviewservice.repository.BadgeRepository;
import tn.esprit.reviewservice.repository.UserBadgeRepository;
import tn.esprit.reviewservice.service.interfaces.IUserBadgeService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserBadgeServiceImpl implements IUserBadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeMapper userBadgeMapper;

    public UserBadgeServiceImpl(UserBadgeRepository userBadgeRepository,
                                BadgeRepository badgeRepository,
                                UserBadgeMapper userBadgeMapper) {
        this.userBadgeRepository = userBadgeRepository;
        this.badgeRepository = badgeRepository;
        this.userBadgeMapper = userBadgeMapper;
    }

    @Override
    public UserBadgeResponse assignBadge(UserBadgeRequest request) {

        Badge badge = badgeRepository.findById(request.getBadgeId())
                .orElseThrow(() -> new ResourceNotFoundException("Badge introuvable"));

        boolean alreadyExists = userBadgeRepository
                .existsByUserIdAndBadgeId(request.getUserId(), request.getBadgeId());

        if (alreadyExists) {
            throw new RuntimeException("Badge déjà attribué à cet utilisateur");
        }

        UserBadge userBadge = new UserBadge();
        userBadge.setUserId(request.getUserId());
        userBadge.setBadge(badge);

        return userBadgeMapper.toResponse(userBadgeRepository.save(userBadge));
    }

    @Override
    public List<UserBadgeResponse> getBadgesByUser(Long userId) {
        return userBadgeRepository.findByUserId(userId)
                .stream()
                .map(userBadgeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserBadgeResponse> getAllUserBadges() {
        return userBadgeRepository.findAll()
                .stream()
                .map(userBadgeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteUserBadge(Long id) {
        UserBadge ub = userBadgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserBadge introuvable"));

        userBadgeRepository.delete(ub);
    }
}