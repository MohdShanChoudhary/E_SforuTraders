package com.sfourtraders.service;

import com.sfourtraders.model.Invoice;
import com.sfourtraders.model.InvoiceItem;
import com.sfourtraders.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Year;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    // Saari invoices lo
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAllByOrderByCreatedAtDesc();
    }

    // Ek invoice lo
    public Optional<Invoice> getInvoiceById(Long id) {
        return invoiceRepository.findById(id);
    }

    // Naya serial number generate karo
    public String generateNextInvoiceNo() {
        int year = Year.now().getValue();
        Optional<Invoice> last = invoiceRepository.findLastInvoice();
        if (last.isEmpty()) {
            return "INV-" + year + "-001";
        }
        String lastNo = last.get().getInvoiceNo();
        try {
            String[] parts = lastNo.split("-");
            int lastNum = Integer.parseInt(parts[parts.length - 1]);
            return "INV-" + year + "-" + String.format("%03d", lastNum + 1);
        } catch (Exception e) {
            return "INV-" + year + "-001";
        }
    }

    // Invoice save karo
    @Transactional
    public Invoice saveInvoice(Invoice invoice) {
        // Items ko invoice se link karo
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                item.setInvoice(invoice);
                // Value calculate karo
                if (item.getQuantity() != null && item.getRate() != null) {
                    item.setValue(item.getQuantity() * item.getRate());
                }
            }
        }

        // GST amounts calculate karo
        double subtotal = invoice.getItems() != null
            ? invoice.getItems().stream().mapToDouble(i -> i.getValue() != null ? i.getValue() : 0).sum()
            : 0;

        double sgst = subtotal * (invoice.getSgstRate() != null ? invoice.getSgstRate() : 0) / 100;
        double cgst = subtotal * (invoice.getCgstRate() != null ? invoice.getCgstRate() : 0) / 100;
        double igst = subtotal * (invoice.getIgstRate() != null ? invoice.getIgstRate() : 0) / 100;
        double freight = invoice.getFreight() != null ? invoice.getFreight() : 0;

        invoice.setSubtotal(subtotal);
        invoice.setSgstAmount(sgst);
        invoice.setCgstAmount(cgst);
        invoice.setIgstAmount(igst);
        invoice.setGrandTotal(subtotal + sgst + cgst + igst + freight);

        return invoiceRepository.save(invoice);
    }

    // Invoice update karo
    @Transactional
    public Invoice updateInvoice(Long id, Invoice updated) {
        Invoice existing = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        // Saare fields update karo
        existing.setInvoiceNo(updated.getInvoiceNo());
        existing.setInvoiceDate(updated.getInvoiceDate());
        existing.setReverseCharge(updated.getReverseCharge());
        existing.setVehicleNo(updated.getVehicleNo());
        existing.setSupplyDate(updated.getSupplyDate());
        existing.setPlaceOfSupply(updated.getPlaceOfSupply());
        existing.setBilledName(updated.getBilledName());
        existing.setBilledAddr(updated.getBilledAddr());
        existing.setBilledPin(updated.getBilledPin());
        existing.setBilledCity(updated.getBilledCity());
        existing.setBilledState(updated.getBilledState());
        existing.setBilledStateCode(updated.getBilledStateCode());
        existing.setBilledGstin(updated.getBilledGstin());
        existing.setShippedName(updated.getShippedName());
        existing.setShippedAddr(updated.getShippedAddr());
        existing.setShippedPin(updated.getShippedPin());
        existing.setShippedCity(updated.getShippedCity());
        existing.setShippedState(updated.getShippedState());
        existing.setShippedStateCode(updated.getShippedStateCode());
        existing.setShippedGstin(updated.getShippedGstin());
        existing.setSgstRate(updated.getSgstRate());
        existing.setCgstRate(updated.getCgstRate());
        existing.setIgstRate(updated.getIgstRate());
        existing.setFreight(updated.getFreight());
        existing.setEwbNo(updated.getEwbNo());
        existing.setEwbStatus(updated.getEwbStatus());

        // Items update karo
        existing.getItems().clear();
        if (updated.getItems() != null) {
            for (InvoiceItem item : updated.getItems()) {
                item.setInvoice(existing);
                if (item.getQuantity() != null && item.getRate() != null) {
                    item.setValue(item.getQuantity() * item.getRate());
                }
                existing.getItems().add(item);
            }
        }

        return saveInvoice(existing);
    }

    // Invoice delete karo
    public void deleteInvoice(Long id) {
        if (!invoiceRepository.existsById(id)) {
            throw new RuntimeException("Invoice not found: " + id);
        }
        invoiceRepository.deleteById(id);
    }

    // Date range se invoices lo (Excel ke liye)
    public List<Invoice> getInvoicesByDateRange(String from, String to) {
        return invoiceRepository.findByDateRange(from, to);
    }

    // Party name se search karo
    public List<Invoice> searchByParty(String name) {
        return invoiceRepository.findByBilledNameContainingIgnoreCaseOrderByCreatedAtDesc(name);
    }
}
