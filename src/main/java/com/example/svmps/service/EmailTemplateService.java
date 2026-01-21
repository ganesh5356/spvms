package com.example.svmps.service;

import com.example.svmps.entity.PurchaseRequisition;
import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

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
}
