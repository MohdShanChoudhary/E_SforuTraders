package com.sfourtraders.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.sfourtraders.model.Invoice;
import com.sfourtraders.model.InvoiceItem;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;

@Service
public class PdfService {

    private static final BaseColor RED = new BaseColor(192, 39, 45);
    private static final BaseColor DARK = new BaseColor(26, 26, 26);
    private static final BaseColor LIGHT_GRAY = new BaseColor(244, 244, 244);
    private static final BaseColor BORDER = new BaseColor(224, 224, 224);

    private static final Font COMPANY_FONT = new Font(Font.FontFamily.HELVETICA, 22, Font.BOLD, RED);
    private static final Font TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, DARK);
    private static final Font NORMAL = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, DARK);
    private static final Font BOLD = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, DARK);
    private static final Font SMALL = new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, new BaseColor(90, 90, 90));
    private static final Font WHITE_BOLD = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.WHITE);
    private static final Font GRAND_TOTAL = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);

    public byte[] generateInvoicePdf(Invoice inv) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4, 30, 30, 30, 30);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // ---- HEADER ----
            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setWidths(new float[]{2.5f, 1f});

            PdfPCell companyCell = new PdfPCell();
            companyCell.setBorder(Rectangle.NO_BORDER);
            companyCell.addElement(new Paragraph("S Four Traders", COMPANY_FONT));
            Paragraph addr = new Paragraph("Opp. Vardhman Refractory, Shamli Bypass Road, Muzaffarnagar (U.P.)", SMALL);
            addr.setSpacingBefore(2);
            companyCell.addElement(addr);
            companyCell.addElement(new Paragraph("GSTIN: 09AGOPA6566D2Z9  |  State: U.P.  |  State Code: 09", SMALL));
            header.addCell(companyCell);

            PdfPCell phoneCell = new PdfPCell();
            phoneCell.setBorder(Rectangle.NO_BORDER);
            phoneCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph phone = new Paragraph("8279444622", BOLD);
            phone.setAlignment(Element.ALIGN_RIGHT);
            phoneCell.addElement(phone);
            header.addCell(phoneCell);

            PdfPCell titleCell = new PdfPCell(new Phrase("TAX INVOICE", TITLE_FONT));
            titleCell.setColspan(2);
            titleCell.setBackgroundColor(LIGHT_GRAY);
            titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            titleCell.setPadding(5);
            titleCell.setBorderColor(BORDER);
            header.addCell(titleCell);

            doc.add(header);

            // ---- META INFO ----
            PdfPTable meta = new PdfPTable(2);
            meta.setWidthPercentage(100);
            meta.setSpacingBefore(0);

            PdfPCell metaLeft = new PdfPCell();
            metaLeft.setBorderColor(BORDER);
            metaLeft.setPadding(6);
            metaLeft.addElement(fieldLine("Invoice No.", inv.getInvoiceNo()));
            metaLeft.addElement(fieldLine("Date", inv.getInvoiceDate()));
            metaLeft.addElement(fieldLine("Reverse Charge", inv.getReverseCharge() ? "Yes" : "No"));
            meta.addCell(metaLeft);

            PdfPCell metaRight = new PdfPCell();
            metaRight.setBorderColor(BORDER);
            metaRight.setPadding(6);
            metaRight.addElement(fieldLine("Vehicle No.", inv.getVehicleNo()));
            metaRight.addElement(fieldLine("Date & Time of Supply", inv.getSupplyDate()));
            metaRight.addElement(fieldLine("Place of Supply", inv.getPlaceOfSupply()));
            meta.addCell(metaRight);

            doc.add(meta);

            // ---- PARTY ----
            PdfPTable party = new PdfPTable(2);
            party.setWidthPercentage(100);

            PdfPCell billedCell = new PdfPCell();
            billedCell.setBorderColor(BORDER);
            billedCell.setPadding(6);
            billedCell.addElement(sectionHead("Details of Receiver / Billed To"));
            billedCell.addElement(fieldLine("Name", inv.getBilledName()));
            billedCell.addElement(fieldLine("Address", inv.getBilledAddr()));
            billedCell.addElement(fieldLine("State", inv.getBilledState() + "  Code: " + inv.getBilledStateCode()));
            billedCell.addElement(fieldLine("GSTIN", inv.getBilledGstin()));
            party.addCell(billedCell);

            PdfPCell shippedCell = new PdfPCell();
            shippedCell.setBorderColor(BORDER);
            shippedCell.setPadding(6);
            shippedCell.addElement(sectionHead("Details of Consignee / Shipped To"));
            shippedCell.addElement(fieldLine("Name", inv.getShippedName()));
            shippedCell.addElement(fieldLine("Address", inv.getShippedAddr()));
            shippedCell.addElement(fieldLine("State", inv.getShippedState() + "  Code: " + inv.getShippedStateCode()));
            shippedCell.addElement(fieldLine("GSTIN", inv.getShippedGstin()));
            party.addCell(shippedCell);

            doc.add(party);

            // ---- ITEMS TABLE ----
            PdfPTable items = new PdfPTable(7);
            items.setWidthPercentage(100);
            items.setWidths(new float[]{0.5f, 3f, 1f, 0.7f, 0.7f, 1f, 1.2f});

            String[] headers = {"S.No", "Description of Goods", "HSN", "UOM", "Qty", "Rate", "Value"};
            for (String h : headers) {
                PdfPCell hc = new PdfPCell(new Phrase(h, WHITE_BOLD));
                hc.setBackgroundColor(DARK);
                hc.setHorizontalAlignment(Element.ALIGN_CENTER);
                hc.setPadding(5);
                items.addCell(hc);
            }

            double subtotal = 0;
            if (inv.getItems() != null) {
                for (InvoiceItem item : inv.getItems()) {
                    addItemRow(items, String.valueOf(item.getSno()), item.getDescription(),
                        item.getHsnCode(), item.getUom(),
                        fmt(item.getQuantity()), fmt(item.getRate()), fmtAmt(item.getValue()));
                    subtotal += item.getValue() != null ? item.getValue() : 0;
                }
            }
            // Empty rows
            for (int i = 0; i < 3; i++) {
                addItemRow(items, "", "", "", "", "", "", "");
            }

            // Total row
            PdfPCell totalLbl = new PdfPCell(new Phrase("Total", BOLD));
            totalLbl.setColspan(5);
            totalLbl.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalLbl.setPadding(5);
            totalLbl.setBorderColor(BORDER);
            items.addCell(totalLbl);

            PdfPCell totalLbl2 = new PdfPCell(new Phrase("Total", BOLD));
            totalLbl2.setPadding(5);
            totalLbl2.setBorderColor(BORDER);
            items.addCell(totalLbl2);

            PdfPCell totalVal = new PdfPCell(new Phrase(fmtAmt(subtotal), BOLD));
            totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalVal.setPadding(5);
            totalVal.setBorderColor(BORDER);
            items.addCell(totalVal);

            doc.add(items);

            // ---- FOOTER: WORDS + TOTALS ----
            PdfPTable footer = new PdfPTable(2);
            footer.setWidthPercentage(100);
            footer.setWidths(new float[]{2f, 1f});

            PdfPCell wordsCell = new PdfPCell();
            wordsCell.setBorderColor(BORDER);
            wordsCell.setPadding(8);
            wordsCell.addElement(new Paragraph("Total Invoice Amount in Words", SMALL));
            Paragraph words = new Paragraph(numberToWords((long) Math.round(inv.getGrandTotal())) + " Rupees Only", BOLD);
            words.setSpacingBefore(3);
            wordsCell.addElement(words);
            wordsCell.addElement(new Paragraph(" ", SMALL));
            wordsCell.addElement(fieldLine("E-Way Bill No.", inv.getEwbNo() != null ? inv.getEwbNo() : ""));
            footer.addCell(wordsCell);

            // Totals box
            PdfPCell totalsCell = new PdfPCell();
            totalsCell.setBorderColor(BORDER);
            totalsCell.setPadding(0);
            PdfPTable totalsInner = new PdfPTable(2);
            totalsInner.setWidthPercentage(100);
            addTotalRow(totalsInner, "Total", fmtAmt(inv.getSubtotal()), false);
            addTotalRow(totalsInner, "SGST @ " + inv.getSgstRate() + "%", fmtAmt(inv.getSgstAmount()), false);
            addTotalRow(totalsInner, "CGST @ " + inv.getCgstRate() + "%", fmtAmt(inv.getCgstAmount()), false);
            addTotalRow(totalsInner, "IGST @ " + inv.getIgstRate() + "%", fmtAmt(inv.getIgstAmount()), false);
            addTotalRow(totalsInner, "Freight Charges", fmtAmt(inv.getFreight()), false);
            addTotalRow(totalsInner, "Grand Total", fmtAmt(inv.getGrandTotal()), true);
            totalsCell.addElement(totalsInner);
            footer.addCell(totalsCell);

            doc.add(footer);

            // ---- SIGNATURE ----
            PdfPTable sign = new PdfPTable(2);
            sign.setWidthPercentage(100);

            PdfPCell termsCell = new PdfPCell();
            termsCell.setBorderColor(BORDER);
            termsCell.setPadding(8);
            termsCell.addElement(new Paragraph("Terms & Conditions", BOLD));
            termsCell.addElement(new Paragraph("• Goods once sold will not be taken back.", SMALL));
            termsCell.addElement(new Paragraph("• All Disputes Subject to Muzaffarnagar Jurisdiction Only.", SMALL));
            termsCell.addElement(new Paragraph("• E & O.E.", SMALL));
            sign.addCell(termsCell);

            PdfPCell signCell = new PdfPCell();
            signCell.setBorderColor(BORDER);
            signCell.setPadding(8);
            signCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            signCell.addElement(new Paragraph("Certified that the particulars given above are true & correct.", SMALL));
            Paragraph forCompany = new Paragraph("For S Four Traders", new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD, RED));
            forCompany.setAlignment(Element.ALIGN_RIGHT);
            forCompany.setSpacingBefore(4);
            signCell.addElement(forCompany);
            Paragraph signatory = new Paragraph("\n\nProp. / Auth. Signatory", SMALL);
            signatory.setAlignment(Element.ALIGN_RIGHT);
            signCell.addElement(signatory);
            sign.addCell(signCell);

            doc.add(sign);

            doc.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    private Paragraph fieldLine(String label, String value) {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + ": ", SMALL));
        p.add(new Chunk(value != null ? value : "", NORMAL));
        p.setSpacingBefore(2);
        return p;
    }

    private Paragraph sectionHead(String text) {
        Paragraph p = new Paragraph(text, new Font(Font.FontFamily.HELVETICA, 8, Font.BOLD, RED));
        p.setSpacingAfter(4);
        return p;
    }

    private void addItemRow(PdfPTable table, String... vals) {
        int[] align = {Element.ALIGN_CENTER, Element.ALIGN_LEFT, Element.ALIGN_CENTER,
                        Element.ALIGN_CENTER, Element.ALIGN_RIGHT, Element.ALIGN_RIGHT, Element.ALIGN_RIGHT};
        for (int i = 0; i < vals.length; i++) {
            PdfPCell c = new PdfPCell(new Phrase(vals[i], NORMAL));
            c.setPadding(4);
            c.setHorizontalAlignment(align[i]);
            c.setBorderColor(BORDER);
            c.setMinimumHeight(18f);
            table.addCell(c);
        }
    }

    private void addTotalRow(PdfPTable table, String label, String value, boolean isGrand) {
        Font labelFont = isGrand ? GRAND_TOTAL : SMALL;
        Font valueFont = isGrand ? GRAND_TOTAL : BOLD;
        BaseColor bg = isGrand ? DARK : (label.contains("@") ? LIGHT_GRAY : BaseColor.WHITE);

        PdfPCell lc = new PdfPCell(new Phrase(label, labelFont));
        lc.setBackgroundColor(bg);
        lc.setPadding(5);
        lc.setBorderColor(BORDER);
        table.addCell(lc);

        PdfPCell vc = new PdfPCell(new Phrase(value, valueFont));
        vc.setBackgroundColor(bg);
        vc.setPadding(5);
        vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vc.setBorderColor(BORDER);
        table.addCell(vc);
    }

    private String fmt(Double v) { return v != null ? String.valueOf(v.longValue()) : ""; }
    private String fmtAmt(Double v) {
        if (v == null) return "0.00";
        return String.format("%.2f", v);
    }

    private String numberToWords(long n) {
        if (n == 0) return "Zero";
        String[] ones = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"};
        String[] tens = {"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};
        if (n < 20) return ones[(int) n];
        if (n < 100) return tens[(int) (n / 10)] + (n % 10 != 0 ? " " + ones[(int) (n % 10)] : "");
        if (n < 1000) return ones[(int) (n / 100)] + " Hundred" + (n % 100 != 0 ? " " + numberToWords(n % 100) : "");
        if (n < 100000) return numberToWords(n / 1000) + " Thousand" + (n % 1000 != 0 ? " " + numberToWords(n % 1000) : "");
        if (n < 10000000) return numberToWords(n / 100000) + " Lakh" + (n % 100000 != 0 ? " " + numberToWords(n % 100000) : "");
        return numberToWords(n / 10000000) + " Crore" + (n % 10000000 != 0 ? " " + numberToWords(n % 10000000) : "");
    }
}
