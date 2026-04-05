package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.SystemSetting;
import nhom5.demo.repository.SystemSettingRepository;
import nhom5.demo.service.SettingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Arrays;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingServiceImpl implements SettingService {

    private final SystemSettingRepository repository;

    @Override
    public List<SystemSetting> getAllSettings() {
        return repository.findAll();
    }

    private static final Set<String> PUBLIC_KEYS = new HashSet<>(Arrays.asList(
        "MAINTENANCE_MODE", "STORE_NAME", "STORE_EMAIL", 
        "STORE_PHONE", "STORE_ADDRESS", "COPYRIGHT_TEXT",
        "FACEBOOK", "INSTAGRAM", "YOUTUBE", "TWITTER",
        "SHIPPING_FEE", "FREE_SHIPPING_THRESHOLD", "TAX", "CURRENCY",
        "BANK_ID", "BANK_ACCOUNT_NO", "BANK_ACCOUNT_NAME"
    ));

    @Override
    public List<SystemSetting> getPublicSettings() {
        return repository.findAll().stream()
                .filter(s -> PUBLIC_KEYS.contains(s.getSettingKey()))
                .collect(Collectors.toList());
    }

    @Override
    public String getSettingValue(String key, String defaultValue) {
        return repository.findBySettingKey(key)
                .map(SystemSetting::getSettingValue)
                .orElse(defaultValue);
    }

    @Override
    @Transactional
    public void updateSetting(String key, String value) {
        // Basic validation for common numeric keys
        if (key.endsWith("_AMOUNT") || key.endsWith("_THRESHOLD") || key.endsWith("_LIMIT") || 
            key.endsWith("_PERCENT") || key.endsWith("_FEE") || key.equals("TAX") || key.startsWith("LOYALTY_")) {
            try {
                double val = Double.parseDouble(value);
                if (val < 0) throw new nhom5.demo.exception.BusinessException("Giá trị cấu hình " + key + " không được âm");
                
                if ((key.endsWith("_PERCENT") || key.equals("TAX")) && val > 100) {
                    throw new nhom5.demo.exception.BusinessException("Giá trị " + key + " không được vượt quá 100%");
                }
                
                if (key.equals("LOYALTY_RATIO") && val <= 0) {
                    throw new nhom5.demo.exception.BusinessException("Tỉ giá tích điểm (LOYALTY_RATIO) phải lớn hơn 0");
                }
            } catch (NumberFormatException e) {
                if (!key.equals("CURRENCY")) { // Currency is text
                    throw new nhom5.demo.exception.BusinessException("Giá trị cấu hình " + key + " phải là một số hợp lệ");
                }
            }
        }
        
        // Basic validation for boolean keys
        if (key.equals("MAINTENANCE_MODE") || key.startsWith("ENABLE_")) {
            if (!value.equalsIgnoreCase("true") && !value.equalsIgnoreCase("false")) {
                throw new nhom5.demo.exception.BusinessException("Giá trị cấu hình " + key + " phải là 'true' hoặc 'false'");
            }
        }

        SystemSetting setting = repository.findBySettingKey(key)
                .orElse(SystemSetting.builder().settingKey(key).build());
        setting.setSettingValue(value);
        repository.save(setting);
    }

    @Override
    @Transactional
    public void updateSettings(Map<String, String> settings) {
        settings.forEach(this::updateSetting);
    }

    @Override
    public boolean isMaintenanceMode() {
        return "true".equalsIgnoreCase(getSettingValue("MAINTENANCE_MODE", "false"));
    }
}
