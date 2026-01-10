package com.bezkoder.spring.security.jwt.payload.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
public class SignupRequest {
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @Size(max = 15)
    private String numtel;

    @Size(max = 50)
    private String nom;

    @Size(max = 50)
    private String prenom;

    private LocalDate dateNaissance;

    @Size(max = 255)
    private String adresse;

    @Size(max = 20)
    private String cin;

    @Size(max = 20)
    private String numCnss;

    @Size(max = 100)
    private String nomDocteurFamille;

    @Size(max = 500)
    private String bio;

    @Size(max = 100)
    private String speciality;

    @Size(max = 20)
    private String mpsi;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    @NotEmpty
    private Set<String> role;

    @Size(max = 20)
    private String numDossier;

    private Set<Long> dossierfile;

    @Size(max = 255)
    private String image;
}