package com.example.svmps.service;

import com.example.svmps.entity.EmailLog;
import com.example.svmps.entity.EmailStatus;
import com.example.svmps.repository.EmailLogRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailLogRepository repo;

    public EmailService(JavaMailSender mailSender, EmailLogRepository repo) {
        this.mailSender = mailSender;
        this.repo = repo;
    }

    @Async
    public void send(String to, String subject, String body) {
        EmailLog log = new EmailLog();
        log.setRecipient(to);
        log.setSubject(subject);
        log.setBody(body);
        log.setStatus(EmailStatus.PENDING);
        log.setRetryCount(0);
        log.setLastAttempt(LocalDateTime.now());
        repo.save(log);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
            log.setStatus(EmailStatus.SUCCESS);
        } catch (Exception e) {
            log.setStatus(EmailStatus.FAILED);
        }
        log.setLastAttempt(LocalDateTime.now());
        repo.save(log);
    }
}
