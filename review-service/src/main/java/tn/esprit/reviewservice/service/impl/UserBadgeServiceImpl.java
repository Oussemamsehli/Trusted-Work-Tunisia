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
import tn.esprit.reviewservice.service.interfaces.INotificationService;
import tn.esprit.reviewservice.service.interfaces.IUserBadgeService;
import tn.esprit.reviewservice.dto.request.NotificationRequest;
import tn.esprit.reviewservice.entity.enums.NotificationChannel;
import tn.esprit.reviewservice.entity.enums.NotificationPriority;
import tn.esprit.reviewservice.entity.enums.NotificationType;
import tn.esprit.reviewservice.entity.enums.RelatedEntityType;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserBadgeServiceImpl implements IUserBadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeMapper userBadgeMapper;
    private final INotificationService notificationService;


    public UserBadgeServiceImpl(UserBadgeRepository userBadgeRepository,
                                BadgeRepository badgeRepository,
                                UserBadgeMapper userBadgeMapper,
                                INotificationService notificationService
    ) {
        this.userBadgeRepository = userBadgeRepository;
        this.badgeRepository = badgeRepository;
        this.userBadgeMapper = userBadgeMapper;
        this.notificationService = notificationService;

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

        UserBadge savedUserBadge = userBadgeRepository.save(userBadge);

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(savedUserBadge.getUserId())
                        .title("Nouveau badge obtenu")
                        .message("Félicitations ! Vous avez obtenu le badge : " + badge.getName())
                        .type(NotificationType.BADGE_EARNED)
                        .channel(NotificationChannel.IN_APP)
                        .priority(NotificationPriority.HIGH)
                        .relatedEntityType(RelatedEntityType.BADGE)
                        .relatedEntityId(savedUserBadge.getId())
                        .build()
        );

        return userBadgeMapper.toResponse(savedUserBadge);    }

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