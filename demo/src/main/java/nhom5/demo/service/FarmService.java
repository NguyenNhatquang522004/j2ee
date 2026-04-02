package nhom5.demo.service;

import nhom5.demo.dto.request.FarmRequest;
import nhom5.demo.dto.response.FarmResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;

public interface FarmService {
    FarmResponse createFarm(@NonNull FarmRequest request);

    FarmResponse updateFarm(@NonNull Long id, @NonNull FarmRequest request);

    void deleteFarm(@NonNull Long id);

    FarmResponse getFarmById(@NonNull Long id);

    Page<FarmResponse> getActiveFarms(@NonNull Pageable pageable);

    Page<FarmResponse> searchFarms(String name, @NonNull Pageable pageable);
}
