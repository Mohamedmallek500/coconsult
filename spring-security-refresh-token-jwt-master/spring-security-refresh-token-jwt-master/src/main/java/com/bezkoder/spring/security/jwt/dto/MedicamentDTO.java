package com.bezkoder.spring.security.jwt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicamentDTO {
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String nomMedicament;

    @Size(max = 500)
    private String notes;
}