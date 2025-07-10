package com.bezkoder.spring.security.jwt.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @NotNull
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @NotNull
    private Patient patient;

    @NotNull
    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    @NotNull
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordonnance_id")
    private Ordonnance ordonnance;

    public Appointment(Doctor doctor, Patient patient, LocalDateTime date) {
        this.doctor = doctor;
        this.patient = patient;
        this.date = date;
        this.status = AppointmentStatus.PENDING;
    }

    public enum AppointmentStatus {
        PENDING,
        CONFIRMED
    }
}