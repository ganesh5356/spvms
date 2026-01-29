package com.example.svmps.service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.*;

@Service
public class ReportService {

    private JasperPrint prepareReport(String reportName, List<?> data) {

        try {
            InputStream jrxml = getClass().getResourceAsStream("/reports/" + reportName + ".jrxml");

            JasperReport report = JasperCompileManager.compileReport(jrxml);

            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(data);

            Map<String, Object> params = new HashMap<>();
            params.put("REPORT_TITLE", reportName.toUpperCase() + " REPORT");

            // Handle logo safely
            java.net.URL logoUrl = getClass().getResource("/static/logo.png");
            if (logoUrl != null) {
                params.put("LOGO_PATH", logoUrl.toString());
            } else {
                params.put("LOGO_PATH", ""); // Empty string if not found
            }

            return JasperFillManager.fillReport(report, params, dataSource);

        } catch (Exception e) {
            throw new RuntimeException("Report generation failed", e);
        }
    }

    // ================= PDF =================
    public byte[] exportPdf(String reportName, List<?> data) {
        try {
            JasperPrint print = prepareReport(reportName, data);
            return JasperExportManager.exportReportToPdf(print);
        } catch (Exception e) {
            throw new RuntimeException("PDF export failed", e);
        }
    }

    // ================= EXCEL =================
    public byte[] exportExcel(String reportName, List<?> data) {
        try {
            JasperPrint print = prepareReport(reportName, data);

            ByteArrayOutputStream out = new ByteArrayOutputStream();

            JRXlsxExporter exporter = new JRXlsxExporter();
            exporter.setExporterInput(new SimpleExporterInput(print));
            exporter.setExporterOutput(
                    new SimpleOutputStreamExporterOutput(out));

            SimpleXlsxReportConfiguration config = new SimpleXlsxReportConfiguration();
            config.setDetectCellType(true);
            config.setWhitePageBackground(false);
            config.setRemoveEmptySpaceBetweenRows(true);

            exporter.setConfiguration(config);
            exporter.exportReport();

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Excel export failed", e);
        }
    }
}
