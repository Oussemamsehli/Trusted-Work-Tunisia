package tn.esprit.userservice.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tn.esprit.userservice.entity.AccountStatus;
import tn.esprit.userservice.entity.User;
import tn.esprit.userservice.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserScheduler {

    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 2 * * *")
    public void logDeletedUsersCount() {
        List<User> deletedUsers = userRepository.findByAccountStatus(AccountStatus.DELETED);

        log.info("Scheduler executed at {} - Total soft-deleted users: {}",
                LocalDateTime.now(),
                deletedUsers.size());
    }
}