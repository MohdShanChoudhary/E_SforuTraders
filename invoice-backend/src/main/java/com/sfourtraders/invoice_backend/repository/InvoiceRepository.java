package com.sfourtraders.repository;

import com.sfourtraders.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    // Get all invoices newest first
    List<Invoice> findAllByOrderByCreatedAtDesc();

    // Find by invoice number
    Optional<Invoice> findByInvoiceNo(String invoiceNo);

    // Filter by date range for Excel export
    @Query("SELECT i FROM Invoice i WHERE i.invoiceDate >= :fromDate AND i.invoiceDate <= :toDate ORDER BY i.invoiceDate DESC")
    List<Invoice> findByDateRange(String fromDate, String toDate);

    // Get last invoice to generate next serial number
    @Query("SELECT i FROM Invoice i ORDER BY i.id DESC LIMIT 1")
    Optional<Invoice> findLastInvoice();

    // Search by party name
    List<Invoice> findByBilledNameContainingIgnoreCaseOrderByCreatedAtDesc(String name);
}
