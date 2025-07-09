package com.bezkoder.spring.security.jwt.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "medicaments")
@Getter
@Setter
@NoArgsConstructor
public class Medicament {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String nomMedicament;

    @Size(max = 500)
    private String notes;

    public Medicament(String nomMedicament, String notes) {
        this.nomMedicament = nomMedicament;
        this.notes = notes;
    }
}