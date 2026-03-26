package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.SystemSetting;
import nhom5.demo.repository.SystemSettingRepository;
import nhom5.demo.service.SettingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SettingServiceImpl implements SettingService {

    private final SystemSettingRepository repository;

    @Override
    public List<SystemSetting> getAllSettings() {
        return repository.findAll();
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
