package tn.esprit.freelancerprofileservice.services;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import tn.esprit.freelancerprofileservice.entities.FreelancerProfile;
import tn.esprit.freelancerprofileservice.repositories.FreelancerProfileRepository;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final FreelancerProfileRepository profileRepository;

    public byte[] generateProfilesExcel() throws Exception {
        List<FreelancerProfile> profiles = profileRepository.findAll();

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Freelancers");

        String[] headers = {
                "ID", "UserId", "Headline", "Région", "Taux/h",
                "Disponibilité", "Score", "Vues", "Risk Score", "Suspendu"
        };

        Row headerRow = sheet.createRow(0);
        CellStyle headerStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        headerStyle.setFont(font);

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;
        for (FreelancerProfile p : profiles) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(p.getId() != null ? p.getId() : 0);
            row.createCell(1).setCellValue(p.getUserId() != null ? p.getUserId() : 0);
            row.createCell(2).setCellValue(p.getHeadline() != null ? p.getHeadline() : "—");
            row.createCell(3).setCellValue(p.getRegion() != null ? p.getRegion() : "—");
            row.createCell(4).setCellValue(p.getHourlyRate() != null ? p.getHourlyRate() : 0);
            row.createCell(5).setCellValue(p.getAvailabilityStatus() != null ? p.getAvailabilityStatus().name() : "—");
            row.createCell(6).setCellValue(p.getCompletenessScore() != null ? p.getCompletenessScore() : 0);
            row.createCell(7).setCellValue(p.getTotalViews() != null ? p.getTotalViews() : 0);
            row.createCell(8).setCellValue(p.getRiskScore() != null ? p.getRiskScore() : 0);
            row.createCell(9).setCellValue(Boolean.TRUE.equals(p.getSuspended()) ? "OUI" : "NON");
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        return baos.toByteArray();
    }
}