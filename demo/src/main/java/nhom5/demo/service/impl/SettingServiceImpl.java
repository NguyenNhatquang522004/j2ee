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
        "MAINTENANCE_MODE", "STORE_NAME", "CONTACT_EMAIL", 
        "CONTACT_PHONE", "ADDRESS", "FB_LINK", 
        "TWITTER_LINK", "INSTA_LINK", "YOUTUBE_LINK"
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
