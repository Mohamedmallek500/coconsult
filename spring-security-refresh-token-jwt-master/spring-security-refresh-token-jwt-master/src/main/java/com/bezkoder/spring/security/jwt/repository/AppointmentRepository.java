package com.bezkoder.spring.security.jwt.repository;

import com.bezkoder.spring.security.jwt.models.Appointment;
import com.bezkoder.spring.security.jwt.models.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByDoctorAndDate(Doctor doctor, LocalDateTime date);
    boolean existsByDoctorAndDateAndIdNot(Doctor doctor, LocalDateTime date, Long id);
}