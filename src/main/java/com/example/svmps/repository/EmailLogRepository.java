package com.example.svmps.repository;

import com.example.svmps.entity.EmailLog;
import com.example.svmps.entity.EmailStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findByStatusAndRetryCountLessThan(EmailStatus status, int maxRetries);
}
