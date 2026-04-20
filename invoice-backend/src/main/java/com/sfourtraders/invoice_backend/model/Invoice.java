package com.sfourtraders.invoice_backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String invoiceNo;

    private String invoiceDate;
    private Boolean reverseCharge = false;

    // Transport
    private String vehicleNo;
    private String supplyDate;
    private String placeOfSupply;

    // Billed To
    private String billedName;
    private String billedAddr;
    private String billedPin;
    private String billedCity;
    private String billedState;
    private String billedStateCode;
    private String billedGstin;

    // Shipped To
    private String shippedName;
    private String shippedAddr;
    private String shippedPin;
    private String shippedCity;
    private String shippedState;
    private String shippedStateCode;
    private String shippedGstin;

    // GST Rates
    private Double sgstRate = 0.0;
    private Double cgstRate = 0.0;
    private Double igstRate = 0.0;
    private Double freight = 0.0;

    // Totals
    private Double subtotal = 0.0;
    private Double sgstAmount = 0.0;
    private Double cgstAmount = 0.0;
    private Double igstAmount = 0.0;
    private Double grandTotal = 0.0;

    // EWB
    private String ewbNo;
    private String ewbStatus = "Pending";

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Items - One invoice has many items
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<InvoiceItem> items;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
