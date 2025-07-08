package com.bezkoder.spring.security.jwt.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bezkoder.spring.security.jwt.models.Maladie;

@Repository
public interface MaladieRepository extends JpaRepository<Maladie, Long> {
    boolean existsByName(String name);
}