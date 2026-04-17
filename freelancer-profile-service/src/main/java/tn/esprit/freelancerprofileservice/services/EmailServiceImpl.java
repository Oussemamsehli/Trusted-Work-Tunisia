package tn.esprit.freelancerprofileservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.mail.test-recipient:}")
    private String testRecipient;

    @Override
    @Async
    public void sendReportStatusEmail(String to, String fullName, String status, String description) {
        try {
            String subject = "Mise à jour de votre signalement";
            String body = buildMessage(fullName, status, description);

            String finalRecipient = (testRecipient != null && !testRecipient.isBlank())
                    ? testRecipient
                    : to;

            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(from);
            mail.setTo(finalRecipient);
            mail.setSubject(subject);
            mail.setText(body);

            mailSender.send(mail);

            System.out.println(">>> MAIL SUCCESS - email sent to " + finalRecipient);
        } catch (Exception e) {
            System.out.println(">>> MAIL ERROR - " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildMessage(String fullName, String status, String description) {
        String safeName = (fullName != null && !fullName.isBlank()) ? fullName : "Utilisateur";

        String statusMessage;
        switch (status) {
            case "IN_REVIEW":
                statusMessage = "Votre signalement est en cours d'examen.";
                break;
            case "RESOLVED":
                statusMessage = "Votre signalement a été traité par notre équipe.";
                break;
            case "REJECTED":
                statusMessage = "Après vérification, votre signalement n'a pas été retenu.";
                break;
            default:
                statusMessage = "Le statut de votre signalement a été mis à jour.";
        }

        return "Bonjour " + safeName + ",\n\n"
                + statusMessage + "\n\n"
                + "Description du signalement :\n"
                + (description != null ? description : "-") + "\n\n"
                + "Cordialement,\n"
                + "L'équipe TrustedWork Tunisia";
    }
}