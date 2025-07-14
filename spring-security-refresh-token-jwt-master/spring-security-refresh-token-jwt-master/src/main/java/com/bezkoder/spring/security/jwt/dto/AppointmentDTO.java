package com.bezkoder.spring.security.jwt.dto;

import com.bezkoder.spring.security.jwt.models.AppointmentStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

    private AppointmentStatus status; // Ajout du champ status
}