package nhom5.demo.service;

import nhom5.demo.dto.request.AddressRequest;
import nhom5.demo.dto.response.AddressResponse;
import org.springframework.lang.NonNull;

import java.util.List;

public interface AddressService {
    List<AddressResponse> getMyAddresses(@NonNull String username);
    AddressResponse addAddress(@NonNull String username, @NonNull AddressRequest request);
    AddressResponse updateAddress(@NonNull Long id, @NonNull String username, @NonNull AddressRequest request);
    void deleteAddress(@NonNull Long id, @NonNull String username);
    AddressResponse setDefault(@NonNull Long id, @NonNull String username);
}
