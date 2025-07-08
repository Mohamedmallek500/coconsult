package com.bezkoder.spring.security.jwt.controllers;

import com.bezkoder.spring.security.jwt.exception.TokenRefreshException;
import com.bezkoder.spring.security.jwt.models.*;
import com.bezkoder.spring.security.jwt.payload.request.LoginRequest;
import com.bezkoder.spring.security.jwt.payload.request.SignupRequest;
import com.bezkoder.spring.security.jwt.payload.response.MessageResponse;
import com.bezkoder.spring.security.jwt.payload.response.UserInfoResponse;
import com.bezkoder.spring.security.jwt.repository.MaladieRepository;
import com.bezkoder.spring.security.jwt.repository.RoleRepository;
import com.bezkoder.spring.security.jwt.repository.UserRepository;
import com.bezkoder.spring.security.jwt.security.jwt.JwtUtils;
import com.bezkoder.spring.security.jwt.security.services.RefreshTokenService;
import com.bezkoder.spring.security.jwt.security.services.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  MaladieRepository maladieRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  @Autowired
  RefreshTokenService refreshTokenService;

  @Value("${file.upload-dir}")
  private String uploadDir;

  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    try {
      Authentication authentication = authenticationManager
              .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

      SecurityContextHolder.getContext().setAuthentication(authentication);

      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

      ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

      List<String> roles = userDetails.getAuthorities().stream()
              .map(item -> item.getAuthority())
              .collect(Collectors.toList());

      RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

      ResponseCookie jwtRefreshCookie = jwtUtils.generateRefreshJwtCookie(refreshToken.getToken());

      logger.info("User {} logged in successfully with roles: {}", loginRequest.getEmail(), roles);

      return ResponseEntity.ok()
              .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
              .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
              .body(new UserInfoResponse(userDetails.getId(),
                      userDetails.getUsername(),
                      userDetails.getEmail(),
                      roles));
    } catch (UsernameNotFoundException e) {
      logger.error("Login failed for email: {}. Error: {}", loginRequest.getEmail(), e.getMessage());
      return ResponseEntity.status(401).body(new MessageResponse(e.getMessage()));
    } catch (BadCredentialsException e) {
      logger.error("Login failed for email: {}. Invalid credentials", loginRequest.getEmail());
      return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid email or password"));
    } catch (Exception e) {
      logger.error("Login failed for email: {}. Error: {}", loginRequest.getEmail(), e.getMessage());
      return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
    }
  }

  @PostMapping(value = "/signup", consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
  public ResponseEntity<?> registerUser(@Valid @RequestPart("signUpRequest") SignupRequest signUpRequest,
                                        @RequestPart(value = "image", required = false) MultipartFile image) {
    try {
      // Validate common fields
      if (userRepository.existsByUsername(signUpRequest.getUsername())) {
        logger.warn("Signup failed: Username {} is already taken", signUpRequest.getUsername());
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
      }
      if (userRepository.existsByEmail(signUpRequest.getEmail())) {
        logger.warn("Signup failed: Email {} is already in use", signUpRequest.getEmail());
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
      }
      if (signUpRequest.getNumtel() != null && userRepository.existsByNumtel(signUpRequest.getNumtel())) {
        logger.warn("Signup failed: Phone number {} is already in use", signUpRequest.getNumtel());
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Phone number is already in use!"));
      }
      if (signUpRequest.getCin() != null && userRepository.existsByCin(signUpRequest.getCin())) {
        logger.warn("Signup failed: CIN {} is already in use", signUpRequest.getCin());
        return ResponseEntity.badRequest().body(new MessageResponse("Error: CIN is already in use!"));
      }

      String imagePath = null;
      if (image != null && !image.isEmpty()) {
        // Vérifier le type de fichier
        String contentType = image.getContentType();
        if (!contentType.equals("image/jpeg") && !contentType.equals("image/png")) {
          logger.warn("Image upload failed: Invalid file type for user {}", signUpRequest.getUsername());
          return ResponseEntity.badRequest().body(new MessageResponse("Error: Only JPEG or PNG files are allowed."));
        }

        // Créer le répertoire de stockage (juste au cas où)
        Path directory = Paths.get(uploadDir);
        Files.createDirectories(directory);

        // Générer un nom de fichier unique
        String fileName = signUpRequest.getUsername() + "_" + System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Path filePath = directory.resolve(fileName); // Correctly appends fileName with separator
        imagePath = filePath.toString(); // Store full path, e.g., C:/Users/mmall/Desktop/Coconsult/front/src/assets/images/ayoub_...

        // Sauvegarder le fichier
        Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        logger.info("Image saved at: {}", imagePath);
      }

      User user;
      Set<String> strRoles = signUpRequest.getRole();
      Set<Role> roles = new HashSet<>();

      if (strRoles == null || strRoles.isEmpty()) {
        Role patientRole = roleRepository.findByName(ERole.patient)
                .orElseThrow(() -> {
                  logger.error("Role 'patient' not found");
                  return new RuntimeException("Error: Role is not found.");
                });
        roles.add(patientRole);

        if (signUpRequest.getNumCnss() == null || signUpRequest.getNumDossier() == null) {
          logger.warn("Signup failed: numCnss and numDossier are required for patients");
          return ResponseEntity.badRequest().body(new MessageResponse("Error: numCnss and numDossier are required for patients!"));
        }

        user = new Patient(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                signUpRequest.getNumtel(),
                signUpRequest.getNom(),
                signUpRequest.getPrenom(),
                signUpRequest.getDateNaissance(),
                signUpRequest.getAdresse(),
                signUpRequest.getCin(),
                encoder.encode(signUpRequest.getPassword()),
                imagePath,
                signUpRequest.getNumCnss(),
                signUpRequest.getNomDocteurFamille(),
                signUpRequest.getMpsi(),
                signUpRequest.getNumDossier(),
                new HashSet<>()
        );

        Set<Maladie> maladies = new HashSet<>();
        if (signUpRequest.getDossierfile() != null) {
          for (Long maladieId : signUpRequest.getDossierfile()) {
            Maladie maladie = maladieRepository.findById(maladieId)
                    .orElseThrow(() -> {
                      logger.error("Maladie with ID {} not found", maladieId);
                      return new RuntimeException("Error: Maladie with ID " + maladieId + " not found.");
                    });
            maladies.add(maladie);
          }
        }
        ((Patient) user).setDossierfile(maladies);
      } else if (strRoles.contains("doctor")) {
        Role doctorRole = roleRepository.findByName(ERole.doctor)
                .orElseThrow(() -> {
                  logger.error("Role 'doctor' not found");
                  return new RuntimeException("Error: Role is not found.");
                });
        roles.add(doctorRole);

        if (signUpRequest.getSpeciality() == null || signUpRequest.getBio() == null) {
          logger.warn("Signup failed: speciality and bio are required for doctors");
          return ResponseEntity.badRequest().body(new MessageResponse("Error: speciality and bio are required for doctors!"));
        }

        user = new Doctor(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                signUpRequest.getNumtel(),
                signUpRequest.getNom(),
                signUpRequest.getPrenom(),
                signUpRequest.getDateNaissance(),
                signUpRequest.getAdresse(),
                signUpRequest.getCin(),
                encoder.encode(signUpRequest.getPassword()),
                imagePath,
                signUpRequest.getSpeciality(),
                signUpRequest.getBio()
        );
        ((Doctor) user).setApproved(false);
      } else if (strRoles.contains("admin")) {
        Role adminRole = roleRepository.findByName(ERole.admin)
                .orElseThrow(() -> {
                  logger.error("Role 'admin' not found");
                  return new RuntimeException("Error: Role is not found.");
                });
        roles.add(adminRole);

        user = new Patient(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                signUpRequest.getNumtel(),
                signUpRequest.getNom(),
                signUpRequest.getPrenom(),
                signUpRequest.getDateNaissance(),
                signUpRequest.getAdresse(),
                signUpRequest.getCin(),
                encoder.encode(signUpRequest.getPassword()),
                imagePath,
                null, null, null, null, new HashSet<>()
        );
      } else {
        Role patientRole = roleRepository.findByName(ERole.patient)
                .orElseThrow(() -> {
                  logger.error("Role 'patient' not found");
                  return new RuntimeException("Error: Role is not found.");
                });
        roles.add(patientRole);

        if (signUpRequest.getNumCnss() == null || signUpRequest.getNumDossier() == null) {
          logger.warn("Signup failed: numCnss and numDossier are required for patients");
          return ResponseEntity.badRequest().body(new MessageResponse("Error: numCnss and numDossier are required for patients!"));
        }

        user = new Patient(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                signUpRequest.getNumtel(),
                signUpRequest.getNom(),
                signUpRequest.getPrenom(),
                signUpRequest.getDateNaissance(),
                signUpRequest.getAdresse(),
                signUpRequest.getCin(),
                encoder.encode(signUpRequest.getPassword()),
                imagePath,
                signUpRequest.getNumCnss(),
                signUpRequest.getNomDocteurFamille(),
                signUpRequest.getMpsi(),
                signUpRequest.getNumDossier(),
                new HashSet<>()
        );

        Set<Maladie> maladies = new HashSet<>();
        if (signUpRequest.getDossierfile() != null) {
          for (Long maladieId : signUpRequest.getDossierfile()) {
            Maladie maladie = maladieRepository.findById(maladieId)
                    .orElseThrow(() -> {
                      logger.error("Maladie with ID {} not found", maladieId);
                      return new RuntimeException("Error: Maladie with ID " + maladieId + " not found.");
                    });
            maladies.add(maladie);
          }
        }
        ((Patient) user).setDossierfile(maladies);
      }

      user.setRoles(roles);
      userRepository.save(user);

      logger.info("User {} registered successfully with roles: {}", signUpRequest.getEmail(), strRoles);
      return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    } catch (Exception e) {
      logger.error("Signup failed for user: {}. Error: {}", signUpRequest.getEmail(), e.getMessage(), e);
      return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
    }
  }

  @PostMapping("/signout")
  public ResponseEntity<?> logoutUser() {
    Object principle = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (principle.toString() != "anonymousUser") {
      Long userId = ((UserDetailsImpl) principle).getId();
      refreshTokenService.deleteByUserId(userId);
      logger.info("User with ID {} logged out successfully", userId);
    }

    ResponseCookie jwtCookie = jwtUtils.getCleanJwtCookie();
    ResponseCookie jwtRefreshCookie = jwtUtils.getCleanJwtRefreshCookie();

    return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
            .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
            .body(new MessageResponse("You've been signed out!"));
  }

  @PostMapping("/refreshtoken")
  public ResponseEntity<?> refreshtoken(HttpServletRequest request) {
    String refreshToken = jwtUtils.getJwtRefreshFromCookies(request);

    if ((refreshToken != null) && (refreshToken.length() > 0)) {
      return refreshTokenService.findByToken(refreshToken)
              .map(refreshTokenService::verifyExpiration)
              .map(RefreshToken::getUser)
              .map(user -> {
                ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(user);
                logger.info("Token refreshed successfully for user ID: {}", user.getId());
                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                        .body(new MessageResponse("Token is refreshed successfully!"));
              })
              .orElseThrow(() -> {
                logger.error("Refresh token {} not found in database", refreshToken);
                return new TokenRefreshException(refreshToken, "Refresh token is not in database!");
              });
    }

    logger.warn("Refresh token is empty");
    return ResponseEntity.badRequest().body(new MessageResponse("Refresh Token is empty!"));
  }

  @PostMapping("/approve-doctor/{doctorId}")
  @Transactional
  public ResponseEntity<?> approveDoctor(@PathVariable Long doctorId) {
    try {
      User user = userRepository.findById(doctorId)
              .orElseThrow(() -> {
                logger.error("Doctor not found with ID: {}", doctorId);
                return new RuntimeException("Doctor not found with ID: " + doctorId);
              });

      boolean isDoctor = user.getRoles().stream()
              .anyMatch(role -> role.getName() == ERole.doctor);
      if (!isDoctor) {
        logger.warn("User with ID {} is not a doctor", doctorId);
        return ResponseEntity.badRequest().body(new MessageResponse("Error: User is not a doctor."));
      }

      if (user instanceof Doctor) {
        Doctor doctor = (Doctor) user;
        if (doctor.isApproved()) {
          logger.info("Doctor with ID {} is already approved", doctorId);
          return ResponseEntity.ok(new MessageResponse("Doctor is already approved."));
        }
        doctor.setApproved(true);
        userRepository.saveAndFlush(doctor);
        logger.info("Doctor with ID {} approved successfully", doctorId);
        return ResponseEntity.ok(new MessageResponse("Doctor approved successfully."));
      } else {
        logger.error("User with ID {} is not an instance of Doctor", doctorId);
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid doctor entity."));
      }
    } catch (Exception e) {
      logger.error("Failed to approve doctor with ID: {}. Error: {}", doctorId, e.getMessage());
      return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
    }
  }

  @PostMapping("/refuse-doctor/{doctorId}")
  @Transactional
  public ResponseEntity<?> refuseDoctor(@PathVariable Long doctorId) {
    try {
      User user = userRepository.findById(doctorId)
              .orElseThrow(() -> {
                logger.error("Doctor not found with ID: {}", doctorId);
                return new RuntimeException("Doctor not found with ID: " + doctorId);
              });

      boolean isDoctor = user.getRoles().stream()
              .anyMatch(role -> role.getName() == ERole.doctor);
      if (!isDoctor) {
        logger.warn("User with ID {} is not a doctor", doctorId);
        return ResponseEntity.badRequest().body(new MessageResponse("Error: User is not a doctor."));
      }

      if (user instanceof Doctor) {
        Doctor doctor = (Doctor) user;
        if (!doctor.isApproved()) {
          logger.info("Doctor with ID {} is already not approved", doctorId);
          return ResponseEntity.ok(new MessageResponse("Doctor is already not approved."));
        }
        doctor.setApproved(false);
        userRepository.saveAndFlush(doctor);
        logger.info("Doctor with ID {} refused successfully", doctorId);
        return ResponseEntity.ok(new MessageResponse("Doctor refused successfully."));
      } else {
        logger.error("User with ID {} is not an instance of Doctor", doctorId);
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid doctor entity."));
      }
    } catch (Exception e) {
      logger.error("Failed to refuse doctor with ID: {}. Error: {}", doctorId, e.getMessage());
      return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
    }
  }
}
