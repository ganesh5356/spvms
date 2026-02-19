package com.example.svmps.service;

import com.example.svmps.entity.EmailLog;
import com.example.svmps.entity.EmailStatus;
import com.example.svmps.repository.EmailLogRepository;
import org.springframework.data.domain.PageRequest;
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

    @Scheduled(fixedDelay = 7200000) // Retry every 2 hours
    public void retryFailedEmails() {

        List<EmailLog> failed = repo.findByStatusAndRetryCountLessThan(
                EmailStatus.FAILED, 3, PageRequest.of(0, 50));

        for (EmailLog log : failed) {
            log.setRetryCount(log.getRetryCount() + 1);
            log.setStatus(EmailStatus.PENDING); // Mark as pending while trying
            repo.save(log);
            emailService.retry(log);
        }
    }
}
