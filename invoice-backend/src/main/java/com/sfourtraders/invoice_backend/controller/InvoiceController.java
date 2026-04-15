package com.sfourtraders.controller;

import com.sfourtraders.model.Invoice;
import com.sfourtraders.service.InvoiceService;
import com.sfourtraders.service.PdfService;
import com.sfourtraders.service.ExcelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private ExcelService excelService;

    // GET /api/invoices — saari invoices
    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices(
            @RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(invoiceService.searchByParty(search));
        }
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    // GET /api/invoices/{id} — ek invoice
    @GetMapping("/{id}")
    public ResponseEntity<?> getInvoice(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/invoices/next-number — next serial number
    @GetMapping("/next-number")
    public ResponseEntity<Map<String, String>> getNextNumber() {
        return ResponseEntity.ok(Map.of("invoiceNo", invoiceService.generateNextInvoiceNo()));
    }

    // POST /api/invoices — naya invoice save
    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        Invoice saved = invoiceService.saveInvoice(invoice);
        return ResponseEntity.ok(saved);
    }

    // PUT /api/invoices/{id} — invoice edit
    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable Long id,
                                                  @RequestBody Invoice invoice) {
        Invoice updated = invoiceService.updateInvoice(id, invoice);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/invoices/{id} — invoice delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(Map.of("message", "Invoice deleted successfully"));
    }

    // GET /api/invoices/{id}/pdf — PDF download
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        Invoice invoice = invoiceService.getInvoiceById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));

        byte[] pdf = pdfService.generateInvoicePdf(invoice);

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + invoice.getInvoiceNo() + ".pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }

    // GET /api/invoices/excel?from=2025-01-01&to=2025-03-31 — Excel download
    @GetMapping("/excel")
    public ResponseEntity<byte[]> downloadExcel(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        List<Invoice> invoices;
        if (from != null && to != null) {
            invoices = invoiceService.getInvoicesByDateRange(from, to);
        } else {
            invoices = invoiceService.getAllInvoices();
        }

        byte[] excel = excelService.generateExcel(invoices);

        String filename = "SFourTraders_Invoices" +
            (from != null ? "_" + from + "_to_" + to : "") + ".xlsx";

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excel);
    }
}
