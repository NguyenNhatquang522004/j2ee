package nhom5.demo.service;

import nhom5.demo.entity.SystemSetting;
import java.util.List;
import java.util.Map;

public interface SettingService {
    List<SystemSetting> getAllSettings();
    String getSettingValue(String key, String defaultValue);
    void updateSetting(String key, String value);
    void updateSettings(Map<String, String> settings);
    boolean isMaintenanceMode();
}
