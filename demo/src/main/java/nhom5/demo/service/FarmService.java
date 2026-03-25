package nhom5.demo.service;

import nhom5.demo.dto.request.FarmRequest;
import nhom5.demo.dto.response.FarmResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FarmService {
    FarmResponse createFarm(FarmRequest request);

    FarmResponse updateFarm(Long id, FarmRequest request);

    void deleteFarm(Long id);

    FarmResponse getFarmById(Long id);

    Page<FarmResponse> getActiveFarms(Pageable pageable);

    Page<FarmResponse> searchFarms(String name, Pageable pageable);
}
