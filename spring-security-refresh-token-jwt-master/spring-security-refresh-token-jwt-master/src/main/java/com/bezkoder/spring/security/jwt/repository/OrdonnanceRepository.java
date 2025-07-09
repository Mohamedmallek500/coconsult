package com.bezkoder.spring.security.jwt.repository;

import com.bezkoder.spring.security.jwt.models.Ordonnance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdonnanceRepository extends JpaRepository<Ordonnance, Long> {
}