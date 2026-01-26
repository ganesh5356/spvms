package com.example.svmps.service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;

import com.example.svmps.dto.PurchaseOrderDto;
import com.example.svmps.entity.PurchaseOrder;
import com.example.svmps.entity.PurchaseRequisition;
import com.example.svmps.repository.PurchaseOrderRepository;
import com.example.svmps.repository.PurchaseRequisitionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.LineSeparator;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepo;
    private final PurchaseRequisitionRepository prRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PurchaseOrderService(PurchaseOrderRepository poRepo,
            PurchaseRequisitionRepository prRepo) {
        this.poRepo = poRepo;
        this.prRepo = prRepo;
    }

    // ================= CREATE PO =================
    public PurchaseOrderDto createPo(Long prId,
            BigDecimal cgstPercent,
            BigDecimal sgstPercent,
            BigDecimal igstPercent) {

        PurchaseRequisition pr = prRepo.findById(prId)
                .orElseThrow(() -> new RuntimeException("PR not found"));

        if (!"APPROVED".equals(pr.getStatus())) {
            throw new RuntimeException("PR is not APPROVED");
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber("PO-" + System.currentTimeMillis());
        po.setPrId(prId);
        po.setBaseAmount(pr.getTotalAmount());
        po.setItemsJson(pr.getItemsJson());
        po.setQuantityJson(pr.getQuantityJson());

        int totalQty = extractTotalQuantity(pr.getQuantityJson());
        po.setTotalQuantity(totalQty);

        po.setCgstPercent(cgstPercent);
        po.setSgstPercent(sgstPercent);
        po.setIgstPercent(igstPercent);

        BigDecimal cgstAmount = pr.getTotalAmount()
                .multiply(cgstPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal sgstAmount = pr.getTotalAmount()
                .multiply(sgstPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal igstAmount = pr.getTotalAmount()
                .multiply(igstPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        po.setCgstAmount(cgstAmount);
        po.setSgstAmount(sgstAmount);
        po.setIgstAmount(igstAmount);

        BigDecimal totalGst = cgstAmount.add(sgstAmount).add(igstAmount);
        po.setTotalGstAmount(totalGst);
        po.setTotalAmount(pr.getTotalAmount().add(totalGst));

        po.setDeliveredQuantity(0);
        po.setStatus("CREATED");

        return toDto(poRepo.save(po));
    }

    // ================= DELIVERY =================
    public PurchaseOrderDto updateDelivery(Long poId, Integer deliveredQty) {

        PurchaseOrder po = poRepo.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        int totalDelivered = po.getDeliveredQuantity() + deliveredQty;

        if (totalDelivered > po.getTotalQuantity()) {
            throw new RuntimeException("Delivered quantity exceeds ordered quantity");
        }

        po.setDeliveredQuantity(totalDelivered);

        po.setStatus(
                totalDelivered == po.getTotalQuantity()
                        ? "DELIVERED"
                        : "PARTIAL_DELIVERED");

        return toDto(poRepo.save(po));
    }

    // ================= CLOSE PO =================
    public PurchaseOrderDto closePo(Long poId) {

        PurchaseOrder po = poRepo.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        if (!"DELIVERED".equals(po.getStatus())) {
            throw new RuntimeException("PO is not fully delivered");
        }

        po.setStatus("CLOSED");
        return toDto(poRepo.save(po));
    }

    // ================= FETCH =================
    public PurchaseOrderDto getPoById(Long poId) {
        return toDto(
                poRepo.findById(poId)
                        .orElseThrow(() -> new RuntimeException("PO not found")));
    }

    // ================= GET POs BY PR ID =================
    // ADMIN, PROCUREMENT, FINANCE
    public List<PurchaseOrderDto> getPosByPrId(Long prId) {

        return poRepo.findAll()
                .stream()
                .filter(po -> po.getPrId() != null && po.getPrId().equals(prId))
                .map(this::toDto)
                .toList();
    }

    public List<PurchaseOrderDto> getAllPos() {
        return poRepo.findAll().stream().map(this::toDto).toList();
    }

    public Page<PurchaseOrderDto> getAllPosWithPagination(Pageable pageable) {
        return poRepo.findAll(pageable).map(this::toDto);
    }

    public List<PurchaseOrderDto> getPosByVendorId(Long vendorId) {
        return poRepo.findByVendorId(vendorId).stream().map(this::toDto).toList();
    }

    // ================= PDF GENERATION =================
    public byte[] generateInvoicePdf(PurchaseOrderDto po) {

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

            Paragraph title = new Paragraph("DELIVERY INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(
                    "Supplier & Vendor Procurement Management System", normalFont));
            document.add(Chunk.NEWLINE);

            LineSeparator line = new LineSeparator();
            line.setLineWidth(2);
            document.add(line);
            document.add(Chunk.NEWLINE);

            PdfPTable info = new PdfPTable(2);
            info.setWidthPercentage(100);

            addInfoCell(info, "PO Number", po.getPoNumber(), boldFont);
            addInfoCell(info, "Status", po.getStatus(), boldFont);
            addInfoCell(info, "Total Quantity", po.getTotalQuantity().toString(), normalFont);
            addInfoCell(info, "Delivered Quantity", po.getDeliveredQuantity().toString(), normalFont);
            addInfoCell(info, "Remaining Quantity", po.getRemainingQuantity().toString(), normalFont);
            addInfoCell(info, "Invoice Date",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy hh:mm a")),
                    normalFont);

            document.add(info);
            document.add(Chunk.NEWLINE);

            BigDecimal unitPrice = po.getBaseAmount()
                    .divide(BigDecimal.valueOf(po.getTotalQuantity()), 2, RoundingMode.HALF_UP);
            BigDecimal deliveredAmount = unitPrice.multiply(BigDecimal.valueOf(po.getDeliveredQuantity()));

            PdfPTable items = new PdfPTable(4);
            items.setWidthPercentage(100);
            items.setWidths(new float[] { 4, 2, 2, 2 });

            addHeader(items, "Description");
            addHeader(items, "Qty");
            addHeader(items, "Unit Price");
            addHeader(items, "Amount");

            items.addCell("Delivered Items");
            items.addCell(po.getDeliveredQuantity().toString());
            items.addCell(unitPrice.toString());
            items.addCell(deliveredAmount.toString());

            document.add(items);
            document.add(Chunk.NEWLINE);

            PdfPTable gst = new PdfPTable(2);
            gst.setWidthPercentage(100);

            addRow(gst, "CGST", po.getCgstAmount());
            addRow(gst, "SGST", po.getSgstAmount());
            addRow(gst, "IGST", po.getIgstAmount());
            addBoldRow(gst, "TOTAL GST", po.getTotalGstAmount());

            document.add(gst);
            document.add(Chunk.NEWLINE);

            LineSeparator endLine = new LineSeparator();
            document.add(endLine);

            Paragraph total = new Paragraph(
                    "GRAND TOTAL : " + po.getTotalAmount(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            document.add(Chunk.NEWLINE);

            Paragraph footer = new Paragraph(
                    "This is a system generated invoice.\nNo signature required.",
                    normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    // ================= HELPERS =================
    private void addInfoCell(PdfPTable table, String label, String value, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(label + ": " + value, font));
        cell.setBorder(Rectangle.NO_BORDER);
        table.addCell(cell);
    }

    private void addHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addRow(PdfPTable table, String label, BigDecimal value) {
        table.addCell(label);
        table.addCell(value.toString());
    }

    private void addBoldRow(PdfPTable table, String label, BigDecimal value) {
        table.addCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
        table.addCell(new Phrase(value.toString(), FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
    }

    private int extractTotalQuantity(String quantityJson) {
        try {
            List<Integer> list = objectMapper.readValue(quantityJson, List.class);
            return list.stream().mapToInt(Integer::intValue).sum();
        } catch (Exception e) {
            return 0;
        }
    }

    private PurchaseOrderDto toDto(PurchaseOrder po) {
        PurchaseOrderDto dto = new PurchaseOrderDto();

        dto.setId(po.getId());
        dto.setPoNumber(po.getPoNumber());
        dto.setPrId(po.getPrId());
        dto.setStatus(po.getStatus());
        dto.setBaseAmount(po.getBaseAmount());
        dto.setCgstPercent(po.getCgstPercent());
        dto.setSgstPercent(po.getSgstPercent());
        dto.setIgstPercent(po.getIgstPercent());
        dto.setCgstAmount(po.getCgstAmount());
        dto.setSgstAmount(po.getSgstAmount());
        dto.setIgstAmount(po.getIgstAmount());
        dto.setTotalGstAmount(po.getTotalGstAmount());
        dto.setTotalAmount(po.getTotalAmount());
        dto.setTotalQuantity(po.getTotalQuantity());
        dto.setDeliveredQuantity(po.getDeliveredQuantity());

        int remaining = po.getTotalQuantity() - po.getDeliveredQuantity();
        dto.setRemainingQuantity(remaining);

        return dto;
    }
}
