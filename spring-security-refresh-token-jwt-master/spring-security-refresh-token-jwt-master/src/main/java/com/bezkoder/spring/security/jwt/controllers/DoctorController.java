package com.bezkoder.spring.security.jwt.controllers;

import com.bezkoder.spring.security.jwt.models.Doctor;
import com.bezkoder.spring.security.jwt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class DoctorController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<List<Doctor>> searchDoctors(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String prenom,
            @RequestParam(required = false) String speciality,
            @RequestParam(required = false) String adresse,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Doctor> doctors = userRepository.findDoctorsByCriteria(nom, prenom, speciality, adresse, PageRequest.of(page, size));
        return ResponseEntity.ok(doctors.getContent());
    }

    @GetMapping("/specialities")
    public ResponseEntity<List<String>> getAllSpecialities() {
        List<String> specialities = userRepository.findAllDistinctSpecialities();
        return ResponseEntity.ok(specialities);
    }
}
