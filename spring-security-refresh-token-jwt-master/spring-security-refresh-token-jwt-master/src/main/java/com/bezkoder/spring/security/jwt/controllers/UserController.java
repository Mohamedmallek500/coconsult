package com.bezkoder.spring.security.jwt.controllers;

import com.bezkoder.spring.security.jwt.models.*;
import com.bezkoder.spring.security.jwt.payload.request.UserRequest;
import com.bezkoder.spring.security.jwt.payload.response.MessageResponse;
import com.bezkoder.spring.security.jwt.payload.response.UserResponse;
import com.bezkoder.spring.security.jwt.repository.MaladieRepository;
import com.bezkoder.spring.security.jwt.repository.RoleRepository;
import com.bezkoder.spring.security.jwt.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    MaladieRepository maladieRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> userPage = userRepository.findAll(pageable);
            List<UserResponse> userResponses = userPage.getContent().stream()
                    .map(user -> {
                        List<String> roles = user.getRoles().stream()
                                .map(role -> role.getName().name())
                                .collect(Collectors.toList());
                        return new UserResponse(
                                user.getId(),
                                user.getUsername(),
                                user.getEmail(),
                                user.getNumtel(),
                                user.getNom(),
                                user.getPrenom(),
                                user.getDateNaissance(),
                                user.getAdresse(),
                                user.getCin(),
                                user.getImage(),
                                roles,
                                user instanceof Doctor ? ((Doctor) user).isApproved() : null,
                                user instanceof Doctor ? ((Doctor) user).getSpeciality() : null,
                                user instanceof Doctor ? ((Doctor) user).getBio() : null,
                                user instanceof Patient ? ((Patient) user).getNumCnss() : null,
                                user instanceof Patient ? ((Patient) user).getNomDocteurFamille() : null,
                                user instanceof Patient ? ((Patient) user).getMpsi() : null,
                                user instanceof Patient ? ((Patient) user).getNumDossier() : null,
                                user instanceof Patient ? ((Patient) user).getDossierfile().stream()
                                        .map(Maladie::getId).collect(Collectors.toList()) : null
                        );
                    })
                    .collect(Collectors.toList());

            logger.info("Retrieved {} users on page {}", userResponses.size(), page);
            // Return paginated response with content and totalPages
            return ResponseEntity.ok(new PageResponse(userResponses, userPage.getTotalPages()));
        } catch (Exception e) {
            logger.error("Failed to retrieve users. Error: {}", e.getMessage());
            return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> {
                        logger.error("User not found with ID: {}", id);
                        return new RuntimeException("User not found with ID: " + id);
                    });

            List<String> roles = user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toList());

            UserResponse response = new UserResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getNumtel(),
                    user.getNom(),
                    user.getPrenom(),
                    user.getDateNaissance(),
                    user.getAdresse(),
                    user.getCin(),
                    user.getImage(),
                    roles,
                    user instanceof Doctor ? ((Doctor) user).isApproved() : null,
                    user instanceof Doctor ? ((Doctor) user).getSpeciality() : null,
                    user instanceof Doctor ? ((Doctor) user).getBio() : null,
                    user instanceof Patient ? ((Patient) user).getNumCnss() : null,
                    user instanceof Patient ? ((Patient) user).getNomDocteurFamille() : null,
                    user instanceof Patient ? ((Patient) user).getMpsi() : null,
                    user instanceof Patient ? ((Patient) user).getNumDossier() : null,
                    user instanceof Patient ? ((Patient) user).getDossierfile().stream()
                            .map(Maladie::getId).collect(Collectors.toList()) : null
            );

            logger.info("Retrieved user with ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Failed to retrieve user with ID: {}. Error: {}", id, e.getMessage());
            return ResponseEntity.status(404).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to retrieve user with ID: {}. Error: {}", id, e.getMessage());
            return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createUserWithoutImage(@Valid @RequestBody UserRequest request) {
        return createUserInternal(request, null);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createUserWithImage(
            @Valid @RequestPart("userRequest") UserRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return createUserInternal(request, image);
    }

    private ResponseEntity<?> createUserInternal(UserRequest request, MultipartFile image) {
        try {
            // Validate unique constraints
            if (userRepository.existsByUsername(request.getUsername())) {
                logger.warn("Create user failed: Username {} is already taken", request.getUsername());
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
            }
            if (userRepository.existsByEmail(request.getEmail())) {
                logger.warn("Create user failed: Email {} is already in use", request.getEmail());
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
            }
            if (request.getNumtel() != null && userRepository.existsByNumtel(request.getNumtel())) {
                logger.warn("Create user failed: Phone number {} is already in use", request.getNumtel());
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Phone number is already in use!"));
            }
            if (request.getCin() != null && userRepository.existsByCin(request.getCin())) {
                logger.warn("Create user failed: CIN {} is already in use", request.getCin());
                return ResponseEntity.badRequest().body(new MessageResponse("Error: CIN is already in use!"));
            }

            String imagePath = null;
            if (image != null && !image.isEmpty()) {
                // Validate file type
                String contentType = image.getContentType();
                if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType)) {
                    logger.warn("Image upload failed: Invalid file type for user {}", request.getUsername());
                    return ResponseEntity.badRequest().body(new MessageResponse("Error: Only JPEG or PNG files are allowed."));
                }

                // Create storage directory
                Path directory = Paths.get(uploadDir);
                Files.createDirectories(directory);

                // Sanitize username to avoid spaces or invalid characters
                String sanitizedUsername = request.getUsername().replaceAll("[^a-zA-Z0-9]", "_");
                // Sanitize original file name or use a default suffix
                String originalFileName = image.getOriginalFilename();
                String fileExtension = originalFileName != null && originalFileName.contains(".")
                        ? originalFileName.substring(originalFileName.lastIndexOf("."))
                        : ".jpg";
                String sanitizedFileName = originalFileName != null
                        ? originalFileName.replaceAll("[^a-zA-Z0-9.]", "_")
                        : "image" + fileExtension;
                String fileName = sanitizedUsername + "_" + System.currentTimeMillis() + fileExtension;

                // Normalize path using Paths.get for correct separators
                Path filePath = directory.resolve(fileName);
                imagePath = filePath.toString();

                // Save file
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                logger.info("Image saved at: {}", imagePath);
            }

            // Map roles
            Set<String> requestRoles = request.getRoles();
            Set<Role> roles = new HashSet<>();
            if (requestRoles == null || requestRoles.isEmpty()) {
                Role patientRole = roleRepository.findByName(ERole.patient)
                        .orElseThrow(() -> {
                            logger.error("Role 'patient' not found");
                            return new RuntimeException("Error: Role is not found.");
                        });
                roles.add(patientRole);
            } else {
                for (String role : requestRoles) {
                    ERole eRole = ERole.valueOf(role);
                    Role dbRole = roleRepository.findByName(eRole)
                            .orElseThrow(() -> {
                                logger.error("Role '{}' not found", role);
                                return new RuntimeException("Error: Role " + role + " not found.");
                            });
                    roles.add(dbRole);
                }
            }

            User user;
            if (requestRoles != null && requestRoles.contains("doctor")) {
                // Validate doctor-specific fields
                if (request.getSpeciality() == null || request.getBio() == null) {
                    logger.warn("Create user failed: speciality and bio are required for doctors");
                    return ResponseEntity.badRequest().body(new MessageResponse("Error: speciality and bio are required for doctors!"));
                }
                user = new Doctor(
                        request.getUsername(),
                        request.getEmail(),
                        request.getNumtel(),
                        request.getNom(),
                        request.getPrenom(),
                        request.getDateNaissance(),
                        request.getAdresse(),
                        request.getCin(),
                        passwordEncoder.encode(request.getPassword()),
                        imagePath,
                        request.getSpeciality(),
                        request.getBio()
                );
                ((Doctor) user).setApproved(false);
            } else {
                // Create patient - make numCnss and numDossier optional for creation
                user = new Patient(
                        request.getUsername(),
                        request.getEmail(),
                        request.getNumtel(),
                        request.getNom(),
                        request.getPrenom(),
                        request.getDateNaissance(),
                        request.getAdresse(),
                        request.getCin(),
                        passwordEncoder.encode(request.getPassword()),
                        imagePath,
                        request.getNumCnss(),
                        request.getNomDocteurFamille(),
                        request.getMpsi(),
                        request.getNumDossier(),
                        new HashSet<>()
                );

                // Handle dossierfile (maladies)
                Set<Maladie> maladies = new HashSet<>();
                if (request.getDossierfile() != null) {
                    for (Long maladieId : request.getDossierfile()) {
                        Maladie maladie = maladieRepository.findById(maladieId)
                                .orElseThrow(() -> {
                                    logger.error("Maladie with ID {} not found", maladieId);
                                    return new RuntimeException("Error: Maladie with ID " + maladieId + " not found.");
                                });
                        maladies.add(maladie);
                    }
                    ((Patient) user).setDossierfile(maladies);
                }
            }

            user.setRoles(roles);
            userRepository.save(user);

            logger.info("User {} created successfully with roles: {}", request.getEmail(), requestRoles);
            return ResponseEntity.ok(new MessageResponse("User created successfully!"));
        } catch (RuntimeException e) {
            logger.error("Failed to create user. Error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to create user. Error: {}", e.getMessage());
            return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    // JSON-only update endpoint
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> updateUserWithoutImage(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {
        return updateUserInternal(id, request, null);
    }

    // Multipart update endpoint (with image)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> updateUserWithImage(
            @PathVariable Long id,
            @Valid @RequestPart("userRequest") UserRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return updateUserInternal(id, request, image);
    }

    private ResponseEntity<?> updateUserInternal(Long id, UserRequest request, MultipartFile image) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> {
                        logger.error("User not found with ID: {}", id);
                        return new RuntimeException("User not found with ID: " + id);
                    });

            // Validate unique constraints (excluding current user)
            if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
                logger.warn("Update user failed: Username {} is already taken", request.getUsername());
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
            }
            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                logger.warn("Update user failed: Email {} is already in use", request.getEmail());
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
            }
            if (request.getNumtel() != null && !user.getNumtel().equals(request.getNumtel()) && userRepository.existsByNumtel(request.getNumtel())) {
                logger.warn("Update user failed: Phone number {} is already in use", request.getNumtel());
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Phone number is already in use!"));
            }
            if (request.getCin() != null && !user.getCin().equals(request.getCin()) && userRepository.existsByCin(request.getCin())) {
                logger.warn("Update user failed: CIN {} is already in use", request.getCin());
                return ResponseEntity.badRequest().body(new MessageResponse("Error: CIN is already in use!"));
            }

            // Handle image upload if present
            if (image != null && !image.isEmpty()) {
                String imagePath = handleImageUpload(image, request.getUsername());
                if (imagePath == null) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Error: Image upload failed."));
                }
                user.setImage(imagePath);
            }

            // Update common fields
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setNumtel(request.getNumtel());
            user.setNom(request.getNom());
            user.setPrenom(request.getPrenom());
            user.setDateNaissance(request.getDateNaissance());
            user.setAdresse(request.getAdresse());
            user.setCin(request.getCin());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            // Handle roles update
            Set<String> requestRoles = request.getRoles();
            if (requestRoles != null) {
                Set<Role> roles = new HashSet<>();
                for (String role : requestRoles) {
                    ERole eRole = ERole.valueOf(role);
                    Role dbRole = roleRepository.findByName(eRole)
                            .orElseThrow(() -> {
                                logger.error("Role '{}' not found", role);
                                return new RuntimeException("Error: Role " + role + " not found.");
                            });
                    roles.add(dbRole);
                }
                user.setRoles(roles);
            }

            // Handle type-specific fields based on user type
            if (user instanceof Doctor) {
                Doctor doctor = (Doctor) user;
                if (request.getSpeciality() != null) {
                    doctor.setSpeciality(request.getSpeciality());
                }
                if (request.getBio() != null) {
                    doctor.setBio(request.getBio());
                }
                // Note: Don't update approved status here - that should be handled by admin separately
            } else if (user instanceof Patient) {
                Patient patient = (Patient) user;
                if (request.getNumCnss() != null) {
                    patient.setNumCnss(request.getNumCnss());
                }
                if (request.getNomDocteurFamille() != null) {
                    patient.setNomDocteurFamille(request.getNomDocteurFamille());
                }
                if (request.getMpsi() != null) {
                    patient.setMpsi(request.getMpsi());
                }
                if (request.getNumDossier() != null) {
                    patient.setNumDossier(request.getNumDossier());
                }

                // Handle dossierfile (maladies) update
                if (request.getDossierfile() != null) {
                    Set<Maladie> maladies = new HashSet<>();
                    for (Long maladieId : request.getDossierfile()) {
                        Maladie maladie = maladieRepository.findById(maladieId)
                                .orElseThrow(() -> {
                                    logger.error("Maladie with ID {} not found", maladieId);
                                    return new RuntimeException("Error: Maladie with ID " + maladieId + " not found.");
                                });
                        maladies.add(maladie);
                    }
                    patient.setDossierfile(maladies);
                }
            }

            userRepository.saveAndFlush(user);

            logger.info("User {} updated successfully", request.getEmail());
            return ResponseEntity.ok(new MessageResponse("User updated successfully!"));
        } catch (RuntimeException e) {
            logger.error("Failed to update user with ID: {}. Error: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to update user with ID: {}. Error: {}", id, e.getMessage());
            return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Helper method for image upload
    private String handleImageUpload(MultipartFile image, String username) {
        try {
            // Validate file type
            String contentType = image.getContentType();
            if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType)) {
                logger.warn("Image upload failed: Invalid file type for user {}", username);
                return null;
            }

            // Create storage directory
            Path directory = Paths.get(uploadDir);
            Files.createDirectories(directory);

            // Generate unique filename
            String sanitizedUsername = username.replaceAll("[^a-zA-Z0-9]", "_");
            String originalFileName = image.getOriginalFilename();
            String fileExtension = originalFileName != null && originalFileName.contains(".")
                    ? originalFileName.substring(originalFileName.lastIndexOf("."))
                    : ".jpg";
            String fileName = sanitizedUsername + "_" + System.currentTimeMillis() + fileExtension;
            Path filePath = directory.resolve(fileName);
            String imagePath = filePath.toString();

            // Save file
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Image saved at: {}", imagePath);

            return imagePath;
        } catch (Exception e) {
            logger.error("Failed to upload image for user {}: {}", username, e.getMessage());
            return null;
        }
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> updateUserImage(@PathVariable Long id, @RequestPart(value = "image", required = true) MultipartFile image) {
        try {
            // Verify user exists
            User user = userRepository.findById(id)
                    .orElseThrow(() -> {
                        logger.error("User not found with ID: {}", id);
                        return new RuntimeException("User not found with ID: " + id);
                    });

            // Validate file
            if (image.isEmpty()) {
                logger.warn("Image upload failed: No file provided for user ID {}", id);
                return ResponseEntity.badRequest().body(new MessageResponse("Error: No file provided."));
            }

            // Validate file type
            String contentType = image.getContentType();
            if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType)) {
                logger.warn("Image upload failed: Invalid file type for user ID {}", id);
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Only JPEG or PNG files are allowed."));
            }

            // Create storage directory
            Path directory = Paths.get(uploadDir);
            Files.createDirectories(directory);

            // Sanitize username to avoid spaces or invalid characters
            String sanitizedUsername = user.getUsername().replaceAll("[^a-zA-Z0-9]", "_");
            // Sanitize original file name or use a default suffix
            String originalFileName = image.getOriginalFilename();
            String fileExtension = originalFileName != null && originalFileName.contains(".")
                    ? originalFileName.substring(originalFileName.lastIndexOf("."))
                    : ".jpg";
            String fileName = sanitizedUsername + "_" + System.currentTimeMillis() + fileExtension;

            // Normalize path using Paths.get for correct separators
            Path filePath = directory.resolve(fileName);
            String imagePath = filePath.toString();

            // Save file
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Image saved at: {}", imagePath);

            // Update user image path
            user.setImage(imagePath);
            userRepository.saveAndFlush(user);

            logger.info("Image updated successfully for user ID: {}", id);
            return ResponseEntity.ok(new MessageResponse("Image updated successfully!"));
        } catch (RuntimeException e) {
            logger.error("Failed to update image for user ID: {}. Error: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to update image for user ID: {}. Error: {}", id, e.getMessage());
            return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> {
                        logger.error("User not found with ID: {}", id);
                        return new RuntimeException("User not found with ID: " + id);
                    });

            userRepository.delete(user);
            logger.info("User with ID {} deleted successfully", id);
            return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
        } catch (RuntimeException e) {
            logger.error("Failed to delete user with ID: {}. Error: {}", id, e.getMessage());
            return ResponseEntity.status(404).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to delete user with ID: {}. Error: {}", id, e.getMessage());
            return ResponseEntity.status(500).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}

// Helper class to return paginated response
class PageResponse {
    private List<UserResponse> content;
    private int totalPages;

    public PageResponse(List<UserResponse> content, int totalPages) {
        this.content = content;
        this.totalPages = totalPages;
    }

    public List<UserResponse> getContent() {
        return content;
    }

    public int getTotalPages() {
        return totalPages;
    }
}