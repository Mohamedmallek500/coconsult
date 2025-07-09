package com.bezkoder.spring.security.jwt.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@NoArgsConstructor
public class UserRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    @Getter
    @Setter
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    @Getter
    @Setter
    private String email;

    @Size(min = 6, max = 40)
    @Getter
    @Setter
    private String password;

    @Getter
    @Setter
    private String numtel;

    @Getter
    @Setter
    private String nom;

    @Getter
    @Setter
    private String prenom;

    @Getter
    @Setter
    private LocalDate dateNaissance;

    @Getter
    @Setter
    private String adresse;

    @Getter
    @Setter
    private String cin;

    @Getter
    private Set<String> roles = new HashSet<>();

    @Getter
    @Setter
    private String speciality;

    @Getter
    @Setter
    private String bio;

    @Getter
    @Setter
    private String numCnss;

    @Getter
    @Setter
    private String nomDocteurFamille;

    @Getter
    @Setter
    private String mpsi;

    @Getter
    @Setter
    private String numDossier;

    @Getter
    @Setter
    private List<Long> dossierfile;

    @JsonProperty("role")
    public void setRole(String role) {
        this.roles.clear();
        if (role != null && !role.isEmpty()) {
            this.roles.add(role);
        }
    }
}