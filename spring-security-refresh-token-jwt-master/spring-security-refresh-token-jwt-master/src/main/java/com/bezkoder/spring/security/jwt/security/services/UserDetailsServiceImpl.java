package com.bezkoder.spring.security.jwt.security.services;

import com.bezkoder.spring.security.jwt.models.Doctor;
import com.bezkoder.spring.security.jwt.models.User;
import com.bezkoder.spring.security.jwt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
  @Autowired
  UserRepository userRepository;

  @Override
  @Transactional
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> {
              throw new UsernameNotFoundException("User Not Found with email: " + email);
            });

    // Ensure Doctor entity is fully loaded
    if (user instanceof Doctor doctor) {
      boolean isApproved = doctor.isApproved();
      if (!isApproved) {
        throw new UsernameNotFoundException("Doctor account with email: " + email + " is not yet approved");
      }
    }

    return UserDetailsImpl.build(user);
  }
}
