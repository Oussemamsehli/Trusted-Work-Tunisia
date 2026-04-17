package tn.esprit.freelancerprofileservice.services;

public interface IEmailService {
    void sendReportStatusEmail(String to, String fullName, String status, String description);
}