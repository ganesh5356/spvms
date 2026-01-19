package com.example.svmps.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.svmps.dto.*;
import com.example.svmps.service.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final VendorService vendorService;
    private final PurchaseRequisitionService prService;
    private final PurchaseOrderService poService;
    private final ReportService reportService;

    public ReportController(
            VendorService vendorService,
            PurchaseRequisitionService prService,
            PurchaseOrderService poService,
            ReportService reportService) {

        this.vendorService = vendorService;
        this.prService = prService;
        this.poService = poService;
        this.reportService = reportService;
    }

    // ================= VENDORS =================
    @GetMapping("/vendors")
    public ResponseEntity<byte[]> vendors(
            @RequestParam(defaultValue = "pdf") String format) {

        List<VendorDto> data = vendorService.getAllVendors();
        return buildResponse("vendor", data, "vendors", format);
    }

    @GetMapping("/vendors/{id}")
    public ResponseEntity<byte[]> vendorById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "pdf") String format) {

        VendorDto data = vendorService.getVendorById(id);
        return buildResponse("vendor", List.of(data),
                "vendor_" + id, format);
    }

    // ================= PR =================
    @GetMapping("/pr")
    public ResponseEntity<byte[]> prs(
            @RequestParam(defaultValue = "pdf") String format) {

        List<PurchaseRequisitionDto> data = prService.getAllPrs();
        return buildResponse("pr", data, "prs", format);
    }

    @GetMapping("/pr/{id}")
    public ResponseEntity<byte[]> prById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "pdf") String format) {

        PurchaseRequisitionDto data = prService.getPrById(id);
        return buildResponse("pr", List.of(data),
                "pr_" + id, format);
    }

    // ================= PO =================
    @GetMapping("/po")
    public ResponseEntity<byte[]> pos(
            @RequestParam(defaultValue = "pdf") String format) {

        List<PurchaseOrderDto> data = poService.getAllPos();
        return buildResponse("po", data, "pos", format);
    }

    @GetMapping("/po/{id}")
    public ResponseEntity<byte[]> poById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "pdf") String format) {

        PurchaseOrderDto data = poService.getPoById(id);
        return buildResponse("po", List.of(data),
                "po_" + id, format);
    }

    // ================= COMMON =================
    private ResponseEntity<byte[]> buildResponse(
            String reportName,
            List<?> data,
            String fileName,
            String format) {

        if ("xlsx".equalsIgnoreCase(format)) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=" + fileName + ".xlsx")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(reportService.exportExcel(reportName, data));
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + fileName + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(reportService.exportPdf(reportName, data));
    }
}
