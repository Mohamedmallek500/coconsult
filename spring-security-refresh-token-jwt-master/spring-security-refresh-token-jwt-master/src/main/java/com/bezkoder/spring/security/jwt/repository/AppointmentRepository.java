package com.bezkoder.spring.security.jwt.repository;

import com.bezkoder.spring.security.jwt.models.Appointment;
import com.bezkoder.spring.security.jwt.models.AppointmentStatus;
import com.bezkoder.spring.security.jwt.models.Doctor;
import com.bezkoder.spring.security.jwt.models.Patient; // Import Patient instead of User
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByDoctorAndDate(Doctor doctor, LocalDateTime date);
    boolean existsByDoctorAndDateAndIdNot(Doctor doctor, LocalDateTime date, Long id);
    boolean existsByDoctorAndDateAndStatus(Doctor doctor, LocalDateTime date, AppointmentStatus status);
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByPatientId(Long patientId); // Added to retrieve appointments by patient ID
}