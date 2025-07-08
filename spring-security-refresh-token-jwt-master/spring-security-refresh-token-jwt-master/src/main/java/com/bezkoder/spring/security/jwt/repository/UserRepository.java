package com.bezkoder.spring.security.jwt.repository;

import com.bezkoder.spring.security.jwt.models.Doctor;
import com.bezkoder.spring.security.jwt.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
  Optional<User> findByUsername(String username);

  Optional<User> findByEmail(String email);

  Boolean existsByUsername(String username);

  Boolean existsByEmail(String email);

  Boolean existsByNumtel(String numtel);

  Boolean existsByCin(String cin);

  default Page<Doctor> findDoctorsByCriteria(String nom, String prenom, String speciality, String adresse, Pageable pageable) {
    return findAll(DoctorSpecification.findDoctorsByCriteria(nom, prenom, speciality, adresse), pageable)
            .map(user -> (Doctor) user);
  }

  default Page<User> findUsersByCriteria(String nom, String prenom, String role, Pageable pageable) {
    return findAll(UserSpecification.findUsersByCriteria(nom, prenom, role), pageable);
  }

  @Query("SELECT DISTINCT d.speciality FROM Doctor d WHERE d.speciality IS NOT NULL")
  List<String> findAllDistinctSpecialities();


}
