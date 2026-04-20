package com.sfourtraders.invoice_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "invoice_items")
@Data
@NoArgsConstructor
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    @JsonBackReference
    private Invoice invoice;

    private Integer sno;
    private String description;
    private String hsnCode;
    private String uom;
    private Double quantity = 0.0;
    private Double rate = 0.0;
    private Double value = 0.0;
}
