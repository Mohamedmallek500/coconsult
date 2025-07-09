package com.bezkoder.spring.security.jwt.repository;

import com.bezkoder.spring.security.jwt.models.Medicament;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicamentRepository extends JpaRepository<Medicament, Long> {
}