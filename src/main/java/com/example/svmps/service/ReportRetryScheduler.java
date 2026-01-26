package com.example.svmps.service;



import com.example.svmps.entity.ReportLog;
import com.example.svmps.entity.ReportStatus;
import com.example.svmps.repository.ReportLogRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ReportRetryScheduler {

    private final ReportLogRepository repo;
    private final ScheduledReportService service;

    public ReportRetryScheduler(
            ReportLogRepository repo,
            ScheduledReportService service) {
        this.repo = repo;
        this.service = service;
    }

    @Scheduled(fixedDelay = 600000)
    public void retryFailedReports() {

        List<ReportLog> failed =
                repo.findByStatusAndRetryCountLessThan(
                        ReportStatus.FAILED, 3
                );

        for (ReportLog log : failed) {
            log.setRetryCount(log.getRetryCount() + 1);
            repo.save(log);
            service.generateAndSend(log.getReportType());
        }
    }
}
