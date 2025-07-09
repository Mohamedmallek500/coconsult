package com.bezkoder.spring.security.jwt.controllers;

import com.bezkoder.spring.security.jwt.dto.OrdonnanceDTO;
import com.bezkoder.spring.security.jwt.security.services.OrdonnanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordonnances")
public class OrdonnanceController {

    @Autowired
    private OrdonnanceService ordonnanceService;


    @GetMapping("/{id}")
    public ResponseEntity<OrdonnanceDTO> getOrdonnanceById(@PathVariable Long id) {
        OrdonnanceDTO ordonnance = ordonnanceService.getOrdonnanceById(id);
        return ResponseEntity.ok(ordonnance);
    }

    @GetMapping
    public ResponseEntity<List<OrdonnanceDTO>> getAllOrdonnances() {
        List<OrdonnanceDTO> ordonnances = ordonnanceService.getAllOrdonnances();
        return ResponseEntity.ok(ordonnances);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrdonnanceDTO> updateOrdonnance(@PathVariable Long id, @Valid @RequestBody OrdonnanceDTO ordonnanceDTO) {
        OrdonnanceDTO updatedOrdonnance = ordonnanceService.updateOrdonnance(id, ordonnanceDTO);
        return ResponseEntity.ok(updatedOrdonnance);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrdonnance(@PathVariable Long id) {
        ordonnanceService.deleteOrdonnance(id);
        return ResponseEntity.noContent().build();
    }
}