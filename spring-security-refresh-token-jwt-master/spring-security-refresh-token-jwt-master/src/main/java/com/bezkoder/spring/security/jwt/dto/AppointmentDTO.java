package com.bezkoder.spring.security.jwt.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class AppointmentDTO {
    private Long id;
    @NotNull
    private Long doctorId;
    @NotNull
    private Long patientId;
    @NotNull
    @FutureOrPresent
    private LocalDateTime date;
    private Long ordonnanceId;

    // Constructors
    public AppointmentDTO() {
    }

    public AppointmentDTO(Long id, Long doctorId, Long patientId, LocalDateTime date, Long ordonnanceId) {
        this.id = id;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.date = date;
        this.ordonnanceId = ordonnanceId;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public Long getOrdonnanceId() {
        return ordonnanceId;
    }

    // No setter for ordonnanceId to make it read-only
}