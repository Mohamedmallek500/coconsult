package com.bezkoder.spring.security.jwt.controllers;

import com.bezkoder.spring.security.jwt.models.Maladie;
import com.bezkoder.spring.security.jwt.repository.MaladieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/maladies")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowCredentials = "true")
public class MaladieController {

    @Autowired
    private MaladieRepository maladieRepository;

    // Get all maladies (accessible to authenticated users)
    @GetMapping
    public ResponseEntity<List<Maladie>> getAllMaladies() {
        List<Maladie> maladies = maladieRepository.findAll();
        return ResponseEntity.ok(maladies);
    }

    // Get a single maladie by ID (accessible to authenticated users)
    @GetMapping("/{id}")
    public ResponseEntity<?> getMaladieById(@PathVariable Long id) {
        Optional<Maladie> maladie = maladieRepository.findById(id);
        if (maladie.isPresent()) {
            return ResponseEntity.ok(maladie.get());
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Maladie with ID " + id + " not found."));
        }
    }

    // Create a new maladie (restricted to admin or doctor)
    @PostMapping
    @PreAuthorize("hasAuthority('admin') or hasAuthority('doctor')")
    public ResponseEntity<?> createMaladie(@Valid @RequestBody Maladie maladie) {
        if (maladieRepository.existsByName(maladie.getName())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Maladie with name " + maladie.getName() + " already exists."));
        }
        Maladie savedMaladie = maladieRepository.save(maladie);
        return ResponseEntity.ok(savedMaladie);
    }

    // Update an existing maladie (restricted to admin or doctor)
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('admin') or hasAuthority('doctor')")
    public ResponseEntity<?> updateMaladie(@PathVariable Long id, @Valid @RequestBody Maladie maladieDetails) {
        Optional<Maladie> maladie = maladieRepository.findById(id);
        if (maladie.isPresent()) {
            Maladie existingMaladie = maladie.get();
            // Check if another maladie has the same name
            if (!existingMaladie.getName().equals(maladieDetails.getName()) &&
                    maladieRepository.existsByName(maladieDetails.getName())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Maladie with name " + maladieDetails.getName() + " already exists."));
            }
            existingMaladie.setName(maladieDetails.getName());
            existingMaladie.setDescription(maladieDetails.getDescription());
            Maladie updatedMaladie = maladieRepository.save(existingMaladie);
            return ResponseEntity.ok(updatedMaladie);
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Maladie with ID " + id + " not found."));
        }
    }

    // Delete a maladie (restricted to admin or doctor)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('admin') or hasAuthority('doctor')")
    public ResponseEntity<?> deleteMaladie(@PathVariable Long id) {
        Optional<Maladie> maladie = maladieRepository.findById(id);
        if (maladie.isPresent()) {
            maladieRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Maladie with ID " + id + " deleted successfully."));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Maladie with ID " + id + " not found."));
        }
    }
}

// MessageResponse class for consistent error responses
class MessageResponse {
    private String message;

    public MessageResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
