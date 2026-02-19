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
import java.util.Map;

import org.springframework.core.io.ByteArrayResource;

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
        }
        log.setLastAttempt(LocalDateTime.now());
        repo.save(log);
    }

    private void sendEmailInternal(EmailLog log, String from) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        if (from != null && !from.isBlank()) {
            helper.setFrom(from);
            helper.setReplyTo(from);
        }

        helper.setTo(log.getRecipient());
        helper.setSubject(log.getSubject());
        helper.setText(log.getBody(), true);
        mailSender.send(message);
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
            throw new RuntimeException(e);
        } finally {
            savedLog.setLastAttempt(LocalDateTime.now());
            repo.save(savedLog);
        }
    }

    private void sendEmailWithAttachmentsInternal(EmailLog log, Map<String, byte[]> attachments)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(log.getRecipient());
        helper.setSubject(log.getSubject());
        helper.setText(log.getBody(), true);

        for (Map.Entry<String, byte[]> entry : attachments.entrySet()) {
            helper.addAttachment(
                    entry.getKey(),
                    new ByteArrayResource(entry.getValue()));
        }

        mailSender.send(message);
    }
}