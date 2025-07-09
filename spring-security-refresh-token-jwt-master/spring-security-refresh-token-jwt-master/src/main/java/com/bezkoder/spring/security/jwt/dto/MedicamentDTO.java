package com.bezkoder.spring.security.jwt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class MedicamentDTO {
    private Long id;
    @NotBlank
    @Size(max = 100)
    private String nomMedicament;
    @Size(max = 500)
    private String notes;

    // Constructors
    public MedicamentDTO() {
    }

    public MedicamentDTO(Long id, String nomMedicament, String notes) {
        this.id = id;
        this.nomMedicament = nomMedicament;
        this.notes = notes;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomMedicament() {
        return nomMedicament;
    }

    public void setNomMedicament(String nomMedicament) {
        this.nomMedicament = nomMedicament;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}