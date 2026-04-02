package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.FarmRequest;
import nhom5.demo.dto.response.FarmResponse;
import nhom5.demo.entity.Farm;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.FarmRepository;
import nhom5.demo.repository.ProductRepository;
import nhom5.demo.service.FarmService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FarmServiceImpl implements FarmService {

    private final FarmRepository farmRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public FarmResponse createFarm(@NonNull FarmRequest request) {
        if (request.getCertificationExpiryDate() != null) {
            if (request.getCertificationExpiryDate().getYear() > 2099) {
                throw new nhom5.demo.exception.BusinessException("Năm hết hạn chứng nhận không hợp lệ (tối đa 2099)");
            }
            if (request.getCertificationExpiryDate().isBefore(java.time.LocalDate.now())) {
                throw new nhom5.demo.exception.BusinessException("Chứng nhận đã hết hạn, không thể đăng ký");
            }
        }
        
        Farm farm = Farm.builder()
                .name(request.getName())
                .address(request.getAddress())
                .province(request.getProvince())
                .ownerName(request.getOwnerName())
                .contactPhone(request.getContactPhone() != null && request.getContactPhone().isBlank() ? null : request.getContactPhone())
                .contactEmail(request.getContactEmail() != null && request.getContactEmail().isBlank() ? null : request.getContactEmail())
                .description(request.getDescription())
                .certification(request.getCertification())
                .certificationCode(request.getCertificationCode())
                .certificationExpiryDate(request.getCertificationExpiryDate())
                .imageUrl(request.getImageUrl())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isActive(true)
                .build();
        return toResponse(farmRepository.save(Objects.requireNonNull(farm)));
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public FarmResponse updateFarm(@NonNull Long id, @NonNull FarmRequest request) {
        Farm farm = findById(id);
        farm.setName(request.getName());
        farm.setAddress(request.getAddress());
        farm.setProvince(request.getProvince());
        farm.setOwnerName(request.getOwnerName());
        farm.setContactPhone(request.getContactPhone() != null && request.getContactPhone().isBlank() ? null : request.getContactPhone());
        farm.setContactEmail(request.getContactEmail() != null && request.getContactEmail().isBlank() ? null : request.getContactEmail());
        farm.setDescription(request.getDescription());
        farm.setCertification(request.getCertification());
        farm.setCertificationCode(request.getCertificationCode());
        if (request.getCertificationExpiryDate() != null) {
            if (request.getCertificationExpiryDate().getYear() > 2099) {
                throw new nhom5.demo.exception.BusinessException("Năm hết hạn chứng nhận không hợp lệ (tối đa 2099)");
            }
            farm.setCertificationExpiryDate(request.getCertificationExpiryDate());
        }
        farm.setImageUrl(request.getImageUrl());
        farm.setLatitude(request.getLatitude());
        farm.setLongitude(request.getLongitude());
        if (request.getIsActive() != null)
            farm.setIsActive(request.getIsActive());
        return toResponse(farmRepository.save(farm));
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public void deleteFarm(@NonNull Long id) {
        if (!farmRepository.existsById(id)) {
            throw new ResourceNotFoundException("Farm", "id", id);
        }
        farmRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public FarmResponse getFarmById(@NonNull Long id) {
        return toResponse(Objects.requireNonNull(findById(id)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FarmResponse> getActiveFarms(@NonNull Pageable pageable) {
        return farmRepository.findByIsActiveTrue(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FarmResponse> searchFarms(String name, @NonNull Pageable pageable) {
        return farmRepository.findByNameContainingIgnoreCase(name != null ? name : "", pageable)
                .map(this::toResponse);
    }

    private Farm findById(@NonNull Long id) {
        return farmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farm", "id", id));
    }

    private FarmResponse toResponse(@NonNull Farm farm) {
        Long farmId = Objects.requireNonNull(farm.getId());
        long productCount = productRepository.countByFarmId(farmId);
        return FarmResponse.builder()
                .id(farmId)
                .name(farm.getName())
                .address(farm.getAddress())
                .province(farm.getProvince())
                .ownerName(farm.getOwnerName())
                .contactPhone(farm.getContactPhone())
                .contactEmail(farm.getContactEmail())
                .description(farm.getDescription())
                .certification(farm.getCertification())
                .certificationDescription(farm.getCertification() != null
                        ? farm.getCertification().getDescription()
                        : null)
                .certificationCode(farm.getCertificationCode())
                .certificationExpiryDate(farm.getCertificationExpiryDate())
                .imageUrl(farm.getImageUrl())
                .latitude(farm.getLatitude())
                .longitude(farm.getLongitude())
                .isActive(farm.getIsActive())
                .productCount((int) productCount)
                .build();
    }
}
