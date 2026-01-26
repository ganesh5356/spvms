package com.example.svmps.repository;

import com.example.svmps.entity.ReportLog;
import com.example.svmps.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportLogRepository extends JpaRepository<ReportLog, Long> {

    List<ReportLog> findByStatusAndRetryCountLessThan(
            ReportStatus status,
            int retryCount
    );
}
