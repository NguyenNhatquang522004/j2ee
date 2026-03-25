package nhom5.demo.service;

import nhom5.demo.dto.request.AddressRequest;
import nhom5.demo.dto.response.AddressResponse;

import java.util.List;

public interface AddressService {
    List<AddressResponse> getMyAddresses(String username);
    AddressResponse addAddress(String username, AddressRequest request);
    AddressResponse updateAddress(Long id, String username, AddressRequest request);
    void deleteAddress(Long id, String username);
    AddressResponse setDefault(Long id, String username);
}
