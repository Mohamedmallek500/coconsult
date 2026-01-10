package com.bezkoder.spring.security.jwt.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrdonnanceDTO {
    private Long id;

    @NotNull
    private Long patientId;

    @NotNull
    private Long doctorId;

    private Set<Long> medicamentIds;
}