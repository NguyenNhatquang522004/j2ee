package nhom5.demo.service.impl;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import nhom5.demo.service.TwoFactorService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class TwoFactorServiceImpl implements TwoFactorService {

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    @Override
    public String generateSecret() {
        final GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey();
    }

    @Override
    public String getQrCodeUrl(String secret, String username) {
        String issuer = "TOAN_STORE";
        try {
            // Standard format: otpauth://totp/Issuer:AccountName?secret=SECRET&issuer=ISSUER
            String label = issuer + ":" + username;
            String encodedLabel = URLEncoder.encode(label, StandardCharsets.UTF_8).replace("+", "%20");
            String encodedIssuer = URLEncoder.encode(issuer, StandardCharsets.UTF_8).replace("+", "%20");
            
            return String.format("otpauth://totp/%s?secret=%s&issuer=%s", 
                    encodedLabel, 
                    secret, 
                    encodedIssuer);
        } catch (Exception e) {
            return "";
        }
    }

    @Override
    public String getBase64QrCode(String qrCodeUrl) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrCodeUrl, BarcodeFormat.QR_CODE, 250, 250);
            
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            return "";
        }
    }

    @Override
    public boolean verifyCode(String secret, String code) {
        try {
            int codeInt = Integer.parseInt(code);
            return gAuth.authorize(secret, codeInt);
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
