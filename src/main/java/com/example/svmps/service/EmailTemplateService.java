package com.example.svmps.service;

import com.example.svmps.entity.PurchaseRequisition;
import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    public String prCreated(PurchaseRequisition pr) {
        return String.format("""
                <h2>Purchase Requisition Created (Draft)</h2>
                <p>PR Number: %s</p>
                <p>Total Amount: %s</p>
                <p>Status: %s</p>
                <p>A new purchase requisition has been created as a draft.</p>
                """, pr.getPrNumber(), pr.getTotalAmount(), pr.getStatus());
    }

    public String prSubmitted(PurchaseRequisition pr) {
        return String.format("""
                <h2>Purchase Requisition Submitted</h2>
                <p>PR Number: %s</p>
                <p>Total Amount: %s</p>
                <p>Status: %s</p>
                """, pr.getPrNumber(), pr.getTotalAmount(), pr.getStatus());
    }

    public String prApproved(PurchaseRequisition pr) {
        return String.format("""
                <h2>Purchase Requisition Approved</h2>
                <p>PR Number: %s</p>
                <p>Total Amount: %s</p>
                """, pr.getPrNumber(), pr.getTotalAmount());
    }

    public String prRejected(PurchaseRequisition pr, String comments) {
        return String.format("""
                <h2>Purchase Requisition Rejected</h2>
                <p><b>PR Number:</b> %s</p>
                <p><b>Total Amount:</b> %s</p>
                <p><b>Status:</b> %s</p>
                <p><b>Remarks:</b> %s</p>
                """,
                pr.getPrNumber(),
                pr.getTotalAmount(),
                pr.getStatus(),
                comments);
    }

}