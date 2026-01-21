package com.example.svmps.service;

import com.example.svmps.entity.EmailLog;
import com.example.svmps.entity.EmailStatus;
import com.example.svmps.repository.EmailLogRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EmailRetryScheduler {

    private final EmailLogRepository repo;
    private final EmailService emailService;

    public EmailRetryScheduler(EmailLogRepository repo,
                               EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;
    }

    @Scheduled(fixedDelay = 300000)
    public void retryFailedEmails() {

        List<EmailLog> failed =
                repo.findByStatusAndRetryCountLessThan(
                        EmailStatus.FAILED, 3
                );

        for (EmailLog log : failed) {
            emailService.send(
                    log.getRecipient(),
                    log.getSubject(),
                    log.getBody()
            );
            log.setRetryCount(log.getRetryCount() + 1);
            repo.save(log);
        }
    }
}

