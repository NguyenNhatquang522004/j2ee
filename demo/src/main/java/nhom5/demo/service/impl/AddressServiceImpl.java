package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.AddressRequest;
import nhom5.demo.dto.response.AddressResponse;
import nhom5.demo.entity.Address;
import nhom5.demo.entity.User;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.AddressRepository;
import nhom5.demo.repository.UserRepository;
import nhom5.demo.service.AddressService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return addressRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public AddressResponse addAddress(String username, AddressRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // If this is the first address, make it default
        boolean isFirst = addressRepository.findByUserId(user.getId()).isEmpty();
        boolean setAsDefault = request.getIsDefault() != null ? request.getIsDefault() : isFirst;

        if (setAsDefault) {
             clearDefaults(user.getId());
        }

        Address address = Address.builder()
                .label(request.getLabel())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .details(request.getDetails())
                .isDefault(setAsDefault)
                .user(user)
                .build();

        return toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long id, String username, AddressRequest request) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));

        if (!address.getUser().getUsername().equals(username)) {
            throw new BusinessException("Bạn không có quyền cập nhật địa chỉ này");
        }

        address.setLabel(request.getLabel());
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setDetails(request.getDetails());

        if (request.getIsDefault() != null && request.getIsDefault()) {
            clearDefaults(address.getUser().getId());
            address.setIsDefault(true);
        }

        return toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(Long id, String username) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));

        if (!address.getUser().getUsername().equals(username)) {
            throw new BusinessException("Bạn không có quyền xóa địa chỉ này");
        }
        addressRepository.delete(address);
    }

    @Override
    @Transactional
    public AddressResponse setDefault(Long id, String username) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));

        if (!address.getUser().getUsername().equals(username)) {
            throw new BusinessException("Bạn không có quyền sửa địa chỉ này");
        }

        clearDefaults(address.getUser().getId());
        address.setIsDefault(true);
        return toResponse(addressRepository.save(address));
    }

    private void clearDefaults(Long userId) {
        List<Address> defaults = addressRepository.findByUserIdAndIsDefaultTrue(userId);
        for (Address a : defaults) {
            a.setIsDefault(false);
            addressRepository.save(a);
        }
    }

    private AddressResponse toResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .details(address.getDetails())
                .isDefault(address.getIsDefault())
                .build();
    }
}
