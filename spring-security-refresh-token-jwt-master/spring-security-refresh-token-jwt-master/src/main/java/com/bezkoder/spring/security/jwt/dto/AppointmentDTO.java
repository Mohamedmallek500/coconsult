package com.bezkoder.spring.security.jwt.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AllArgsConstructor;
import com.bezkoder.spring.security.jwt.models.Appointment.AppointmentStatus;

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

    // Status is included in responses but not required in requests
    private AppointmentStatus status;

    private Long ordonnanceId;
}