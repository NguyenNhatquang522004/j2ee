package nhom5.demo.security;

import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.User;
import nhom5.demo.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy người dùng với username: " + username));

        List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(user.getRole().name()));
        
        // Granular permissions logic:
        // 1. If customPermissions is NOT empty → use ONLY customPermissions (admin has explicitly configured)
        // 2. If customPermissions IS empty → fallback to role defaults from RoleEnum
        // This allows admin to "uncheck" default role permissions
        if (user.getCustomPermissions() != null && !user.getCustomPermissions().isEmpty()) {
            user.getCustomPermissions().forEach(permission ->
                    authorities.add(new SimpleGrantedAuthority(permission)));
        } else {
            user.getRole().getPermissions().forEach(permission -> 
                    authorities.add(new SimpleGrantedAuthority(permission)));
        }

        return new CustomUserDetails(
                user.getUsername(),
                user.getPassword(),
                authorities,
                user.getId(),
                user.getTokenVersion(),
                user.getIsActive()
        );
    }
}
