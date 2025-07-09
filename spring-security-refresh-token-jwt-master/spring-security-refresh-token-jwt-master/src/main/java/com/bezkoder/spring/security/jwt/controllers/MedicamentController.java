package com.bezkoder.spring.security.jwt.controllers;

import com.bezkoder.spring.security.jwt.dto.MedicamentDTO;
import com.bezkoder.spring.security.jwt.security.services.MedicamentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicaments")
public class MedicamentController {

    @Autowired
    private MedicamentService medicamentService;

    @PostMapping
    public ResponseEntity<MedicamentDTO> createMedicament(@Valid @RequestBody MedicamentDTO medicamentDTO) {
        MedicamentDTO createdMedicament = medicamentService.createMedicament(medicamentDTO);
        return ResponseEntity.ok(createdMedicament);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicamentDTO> getMedicamentById(@PathVariable Long id) {
        MedicamentDTO medicament = medicamentService.getMedicamentById(id);
        return ResponseEntity.ok(medicament);
    }

    @GetMapping
    public ResponseEntity<List<MedicamentDTO>> getAllMedicaments() {
        List<MedicamentDTO> medicaments = medicamentService.getAllMedicaments();
        return ResponseEntity.ok(medicaments);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicamentDTO> updateMedicament(@PathVariable Long id, @Valid @RequestBody MedicamentDTO medicamentDTO) {
        MedicamentDTO updatedMedicament = medicamentService.updateMedicament(id, medicamentDTO);
        return ResponseEntity.ok(updatedMedicament);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicament(@PathVariable Long id) {
        medicamentService.deleteMedicament(id);
        return ResponseEntity.noContent().build();
    }
}