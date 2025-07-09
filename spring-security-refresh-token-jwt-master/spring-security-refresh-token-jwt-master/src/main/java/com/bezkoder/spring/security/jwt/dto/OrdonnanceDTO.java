package com.bezkoder.spring.security.jwt.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

public class OrdonnanceDTO {
    private Long id;
    @NotNull
    private Long patientId;
    @NotNull
    private Long doctorId;
    private Set<Long> medicamentIds;

    // Constructors
    public OrdonnanceDTO() {
    }

    public OrdonnanceDTO(Long id, Long patientId, Long doctorId, Set<Long> medicamentIds) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.medicamentIds = medicamentIds;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Set<Long> getMedicamentIds() {
        return medicamentIds;
    }

    public void setMedicamentIds(Set<Long> medicamentIds) {
        this.medicamentIds = medicamentIds;
    }
}