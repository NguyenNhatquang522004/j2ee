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
import org.springframework.lang.NonNull;
import java.util.Objects;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses(@NonNull String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return addressRepository.findByUserId(Objects.requireNonNull(user.getId())).stream()
                .map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public AddressResponse addAddress(@NonNull String username, @NonNull AddressRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // If this is the first address, make it default
        boolean isFirst = addressRepository.findByUserId(Objects.requireNonNull(user.getId())).isEmpty();
        boolean setAsDefault = request.getIsDefault() != null ? request.getIsDefault() : isFirst;

        if (setAsDefault) {
             clearDefaults(Objects.requireNonNull(user.getId()));
        }

        Address address = Address.builder()
                .label(request.getLabel())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .addressDetail(request.getAddressDetail() != null ? request.getAddressDetail() : request.getDetails())
                .ward(request.getWard())
                .district(request.getDistrict())
                .province(request.getProvince())
                .details(request.getDetails())
                .isDefault(setAsDefault)
                .user(user)
                .build();

        return toResponse(addressRepository.save(Objects.requireNonNull(address)));
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(@NonNull Long id, @NonNull String username, @NonNull AddressRequest request) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));

        if (!Objects.requireNonNull(address.getUser()).getUsername().equals(username)) {
            throw new BusinessException("Bạn không có quyền cập nhật địa chỉ này");
        }

        address.setLabel(request.getLabel());
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressDetail(request.getAddressDetail() != null ? request.getAddressDetail() : request.getDetails());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setProvince(request.getProvince());
        address.setDetails(request.getDetails());

        if (request.getIsDefault() != null && request.getIsDefault()) {
            clearDefaults(Objects.requireNonNull(address.getUser().getId()));
            address.setIsDefault(true);
        }

        return toResponse(addressRepository.save(Objects.requireNonNull(address)));
    }

    @Override
    @Transactional
    public void deleteAddress(@NonNull Long id, @NonNull String username) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));

        if (!Objects.requireNonNull(address.getUser()).getUsername().equals(username)) {
            throw new BusinessException("Bạn không có quyền xóa địa chỉ này");
        }
        addressRepository.delete(Objects.requireNonNull(address));
    }

    @Override
    @Transactional
    public AddressResponse setDefault(@NonNull Long id, @NonNull String username) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));

        if (!Objects.requireNonNull(address.getUser()).getUsername().equals(username)) {
            throw new BusinessException("Bạn không có quyền sửa địa chỉ này");
        }

        clearDefaults(Objects.requireNonNull(address.getUser().getId()));
        address.setIsDefault(true);
        return toResponse(addressRepository.save(Objects.requireNonNull(address)));
    }

    private void clearDefaults(@NonNull Long userId) {
        List<Address> defaults = addressRepository.findByUserIdAndIsDefaultTrue(userId);
        for (Address a : defaults) {
            a.setIsDefault(false);
            addressRepository.save(Objects.requireNonNull(a));
        }
    }

    private AddressResponse toResponse(@NonNull Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressDetail(address.getAddressDetail())
                .ward(address.getWard())
                .district(address.getDistrict())
                .province(address.getProvince())
                .details(address.getDetails())
                .isDefault(address.getIsDefault())
                .build();
    }
}
