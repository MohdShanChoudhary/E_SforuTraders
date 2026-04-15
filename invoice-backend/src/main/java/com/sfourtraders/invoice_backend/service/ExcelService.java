package com.sfourtraders.service;

import com.sfourtraders.model.Invoice;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExcelService {

    public byte[] generateExcel(List<Invoice> invoices) {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFSheet sheet = wb.createSheet("Invoices");

            // ---- Styles ----
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)26, (byte)26, (byte)26}, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            Font headerFont = wb.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 10);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle titleStyle = wb.createCellStyle();
            titleStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)192, (byte)39, (byte)45}, null));
            titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font titleFont = wb.createFont();
            titleFont.setColor(IndexedColors.WHITE.getIndex());
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 13);
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle amtStyle = wb.createCellStyle();
            amtStyle.setAlignment(HorizontalAlignment.RIGHT);
            DataFormat format = wb.createDataFormat();
            amtStyle.setDataFormat(format.getFormat("#,##0.00"));

            CellStyle altStyle = wb.createCellStyle();
            altStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)244, (byte)244, (byte)244}, null));
            altStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // ---- Title ----
            Row titleRow = sheet.createRow(0);
            titleRow.setHeightInPoints(24);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("S Four Traders — Invoice Report");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 12));

            // ---- Headers ----
            String[] cols = {
                "S.No", "Invoice No.", "Invoice Date", "Party Name", "GSTIN",
                "Place of Supply", "Vehicle No.", "Subtotal (₹)",
                "SGST %", "CGST %", "IGST %", "Freight (₹)", "Grand Total (₹)", "EWB No.", "EWB Status"
            };
            Row headerRow = sheet.createRow(1);
            headerRow.setHeightInPoints(18);
            for (int i = 0; i < cols.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
            }

            // ---- Data ----
            int rowNum = 2;
            int sno = 1;
            for (Invoice inv : invoices) {
                Row row = sheet.createRow(rowNum);
                row.setHeightInPoints(16);

                CellStyle rowStyle = rowNum % 2 == 0 ? altStyle : null;

                setCell(row, 0, String.valueOf(sno++), rowStyle);
                setCell(row, 1, inv.getInvoiceNo(), rowStyle);
                setCell(row, 2, inv.getInvoiceDate(), rowStyle);
                setCell(row, 3, inv.getBilledName(), rowStyle);
                setCell(row, 4, inv.getBilledGstin(), rowStyle);
                setCell(row, 5, inv.getPlaceOfSupply(), rowStyle);
                setCell(row, 6, inv.getVehicleNo(), rowStyle);

                Cell amtCell = row.createCell(7);
                amtCell.setCellValue(inv.getSubtotal() != null ? inv.getSubtotal() : 0);
                amtCell.setCellStyle(amtStyle);

                setCell(row, 8, inv.getSgstRate() + "%", rowStyle);
                setCell(row, 9, inv.getCgstRate() + "%", rowStyle);
                setCell(row, 10, inv.getIgstRate() + "%", rowStyle);

                Cell freightCell = row.createCell(11);
                freightCell.setCellValue(inv.getFreight() != null ? inv.getFreight() : 0);
                freightCell.setCellStyle(amtStyle);

                Cell grandCell = row.createCell(12);
                grandCell.setCellValue(inv.getGrandTotal() != null ? inv.getGrandTotal() : 0);
                grandCell.setCellStyle(amtStyle);

                setCell(row, 13, inv.getEwbNo() != null ? inv.getEwbNo() : "", rowStyle);
                setCell(row, 14, inv.getEwbStatus() != null ? inv.getEwbStatus() : "Pending", rowStyle);

                rowNum++;
            }

            // ---- Grand Total Row ----
            Row totalRow = sheet.createRow(rowNum);
            totalRow.setHeightInPoints(18);
            Cell totalLabel = totalRow.createCell(6);
            totalLabel.setCellValue("GRAND TOTAL");
            CellStyle totalLabelStyle = wb.createCellStyle();
            Font boldFont = wb.createFont();
            boldFont.setBold(true);
            totalLabelStyle.setFont(boldFont);
            totalLabelStyle.setAlignment(HorizontalAlignment.RIGHT);
            totalLabel.setCellStyle(totalLabelStyle);

            double grandSum = invoices.stream()
                .mapToDouble(i -> i.getGrandTotal() != null ? i.getGrandTotal() : 0).sum();
            Cell grandTotalCell = totalRow.createCell(12);
            grandTotalCell.setCellValue(grandSum);
            grandTotalCell.setCellStyle(amtStyle);

            // ---- Column Widths ----
            int[] widths = {8, 16, 14, 25, 20, 20, 16, 16, 10, 10, 10, 14, 16, 20, 14};
            for (int i = 0; i < widths.length; i++) {
                sheet.setColumnWidth(i, widths[i] * 256);
            }

            // ---- Freeze header ----
            sheet.createFreezePane(0, 2);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Excel generation failed: " + e.getMessage(), e);
        }
    }

    private void setCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        if (style != null) cell.setCellStyle(style);
    }
}
