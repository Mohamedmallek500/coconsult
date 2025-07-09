package com.bezkoder.spring.security.jwt.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ordonnances")
public class Ordonnance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @NotNull
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @NotNull
    private Doctor doctor;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "ordonnance_medicaments",
            joinColumns = @JoinColumn(name = "ordonnance_id"),
            inverseJoinColumns = @JoinColumn(name = "medicament_id"))
    private Set<Medicament> medicaments = new HashSet<>();

    public Ordonnance() {
    }

    public Ordonnance(Patient patient, Doctor doctor, Set<Medicament> medicaments) {
        this.patient = patient;
        this.doctor = doctor;
        this.medicaments = medicaments;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Set<Medicament> getMedicaments() {
        return medicaments;
    }

    public void setMedicaments(Set<Medicament> medicaments) {
        this.medicaments = medicaments;
    }
}