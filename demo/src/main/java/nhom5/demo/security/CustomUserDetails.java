package nhom5.demo.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

@Getter
public class CustomUserDetails extends User {
    private final Long id;
    private final Integer tokenVersion;

    public CustomUserDetails(String username, String password, Collection<? extends GrantedAuthority> authorities, 
                             Long id, Integer tokenVersion, boolean enabled) {
        super(username, password, enabled, true, true, true, authorities);
        this.id = id;
        this.tokenVersion = tokenVersion;
    }
}
