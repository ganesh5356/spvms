package com.example.svmps.service;

import com.example.svmps.entity.EmailLog;
import com.example.svmps.entity.EmailStatus;
import com.example.svmps.repository.EmailLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class EmailService {

    private final EmailLogRepository repo;
    private final RestTemplate restTemplate;

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${resend.from-email}")
    private String fromEmail;

    // On Resend free plan (no verified domain), all emails must go to the account
    // email.
    // Set RESEND_TEST_RECIPIENT in Railway to override all recipients for demo
    // purposes.
    @Value("${resend.test-recipient:}")
    private String testRecipientOverride;

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    public EmailService(EmailLogRepository repo) {
        this.repo = repo;
        this.restTemplate = new RestTemplate();
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
            sendViaResend(log.getRecipient(), log.getSubject(), log.getBody(), null);
            log.setStatus(EmailStatus.SUCCESS);
            log.setErrorMessage(null);
        } catch (Exception e) {
            log.setStatus(EmailStatus.FAILED);
            log.setErrorMessage(e.getMessage());
        }
        log.setLastAttempt(LocalDateTime.now());
        repo.save(log);
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
            sendViaResend(to, subject, body, attachments);
            savedLog.setStatus(EmailStatus.SUCCESS);
            savedLog.setErrorMessage(null);
        } catch (Exception e) {
            savedLog.setStatus(EmailStatus.FAILED);
            savedLog.setErrorMessage(e.getMessage());
            throw new RuntimeException(e);
        } finally {
            savedLog.setLastAttempt(LocalDateTime.now());
            repo.save(savedLog);
        }
    }

    private void sendViaResend(String to, String subject, String htmlBody,
            Map<String, byte[]> attachments) {
        // Use override recipient if set (Resend free plan: can only send to account
        // email)
        String recipient = (testRecipientOverride != null && !testRecipientOverride.isBlank())
                ? testRecipientOverride
                : to;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("from", fromEmail);
        payload.put("to", List.of(recipient));
        payload.put("subject", subject);
        payload.put("html", htmlBody);

        if (attachments != null && !attachments.isEmpty()) {
            List<Map<String, String>> attachmentList = new ArrayList<>();
            for (Map.Entry<String, byte[]> entry : attachments.entrySet()) {
                Map<String, String> att = new LinkedHashMap<>();
                att.put("filename", entry.getKey());
                att.put("content", Base64.getEncoder().encodeToString(entry.getValue()));
                attachmentList.add(att);
            }
            payload.put("attachments", attachmentList);
        }

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(RESEND_API_URL, request, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Resend API error: " + response.getStatusCode() + " - " + response.getBody());
        }
    }
}