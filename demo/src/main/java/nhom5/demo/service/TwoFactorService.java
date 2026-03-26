package nhom5.demo.service;

import com.warrenstrange.googleauth.GoogleAuthenticatorKey;

public interface TwoFactorService {
    String generateSecret();
    String getQrCodeUrl(String secret, String username);
    String getBase64QrCode(String qrCodeUrl);
    boolean verifyCode(String secret, String code);
}
