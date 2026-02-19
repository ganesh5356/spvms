package com.example.svmps.service;

import com.example.svmps.entity.EmailLog;
import com.example.svmps.entity.EmailStatus;
import com.example.svmps.repository.EmailLogRepository;
import com.resend.Resend;
import com.resend.services.emails.model.Attachment;
import com.resend.services.emails.model.SendEmailRequest;
import com.resend.services.emails.model.SendEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmailService {

    private final Resend resend;
    private final EmailLogRepository repo;
    private final String defaultFrom;

    public EmailService(
            EmailLogRepository repo,
            @Value("${resend.api.key:re_placeholder}") String apiKey,
            @Value("${resend.from.email:onboarding@resend.dev}") String defaultFrom) {
        this.resend = new Resend(apiKey);
        this.repo = repo;
        this.defaultFrom = defaultFrom;
    }

    @Async
    public void send(String to, String subject, String body) {
        send(null, to, subject, body);
    }

    @Async
    public void send(String from, String to, String subject, String body) {
        EmailLog log = new EmailLog();
        log.setRecipient(to);
        log.setSubject(subject);
        log.setBody(body);
        log.setStatus(EmailStatus.PENDING);
        log.setRetryCount(0);
        log.setLastAttempt(LocalDateTime.now());
        EmailLog savedLog = repo.save(log);

        processEmail(savedLog, from);
    }

    @Async
    public void retry(EmailLog log) {
        processEmail(log, null);
    }

    private void processEmail(EmailLog log, String from) {
        try {
            sendEmailInternal(log, from);
            log.setStatus(EmailStatus.SUCCESS);
            log.setErrorMessage(null);
        } catch (Exception e) {
            log.setStatus(EmailStatus.FAILED);
            log.setErrorMessage(e.getMessage());
            System.err.println("RESEND ERROR: " + e.getMessage());
        }
        log.setLastAttempt(LocalDateTime.now());
        repo.save(log);
    }

    private void sendEmailInternal(EmailLog log, String from) {
        String fromEmail = (from != null && !from.isBlank()) ? from : defaultFrom;

        SendEmailRequest request = SendEmailRequest.builder()
                .from(fromEmail)
                .to(log.getRecipient())
                .subject(log.getSubject())
                .html(log.getBody())
                .build();

        SendEmailResponse response = resend.emails().send(request);
        if (response == null || response.getId() == null) {
            throw new RuntimeException("Resend failed to return a valid message ID");
        }
    }

    @Async
    public void sendWithMultipleAttachmentsAsync(
            String to,
            String subject,
            String body,
            Map<String, byte[]> attachments) {
        sendWithMultipleAttachments(to, subject, body, attachments);
    }

    public void sendWithMultipleAttachments(
            String to,
            String subject,
            String body,
            Map<String, byte[]> attachments) {

        EmailLog log = new EmailLog();
        log.setRecipient(to);
        log.setSubject(subject);
        log.setBody(body);
        log.setStatus(EmailStatus.PENDING);
        log.setRetryCount(3); // Mark as non-retryable by general scheduler
        log.setLastAttempt(LocalDateTime.now());
        EmailLog savedLog = repo.save(log);

        try {
            sendEmailWithAttachmentsInternal(savedLog, attachments);
            savedLog.setStatus(EmailStatus.SUCCESS);
            savedLog.setErrorMessage(null);
        } catch (Exception e) {
            savedLog.setStatus(EmailStatus.FAILED);
            savedLog.setErrorMessage(e.getMessage());
            System.err.println("RESEND ATTACHMENT ERROR: " + e.getMessage());
            throw new RuntimeException(e);
        } finally {
            savedLog.setLastAttempt(LocalDateTime.now());
            repo.save(savedLog);
        }
    }

    private void sendEmailWithAttachmentsInternal(EmailLog log, Map<String, byte[]> attachments) {
        List<Attachment> resendAttachments = attachments.entrySet().stream()
                .map(entry -> Attachment.builder()
                        .fileName(entry.getKey())
                        .content(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        SendEmailRequest request = SendEmailRequest.builder()
                .from(defaultFrom)
                .to(log.getRecipient())
                .subject(log.getSubject())
                .html(log.getBody())
                .attachments(resendAttachments)
                .build();

        SendEmailResponse response = resend.emails().send(request);
        if (response == null || response.getId() == null) {
            throw new RuntimeException("Resend failed to return a valid message ID for attachments");
        }
    }
}
