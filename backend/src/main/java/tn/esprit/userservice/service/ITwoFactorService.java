package tn.esprit.userservice.service;

public interface ITwoFactorService {

    String generateSecret();

    String getQrCodeUri(String secret, String email);

    boolean verifyCode(String secret, String code);

    void enable2FA(Long userId);

    void disable2FA(Long userId);
}
