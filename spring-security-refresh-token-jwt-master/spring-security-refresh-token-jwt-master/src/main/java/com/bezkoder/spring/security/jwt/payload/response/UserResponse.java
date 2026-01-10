package com.bezkoder.spring.security.jwt.payload.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String numtel;
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private String adresse;
    private String cin;
    private String image;
    private List<String> roles;
    private Boolean isApproved;
    private String speciality;
    private String bio;
    private String numCnss;
    private String nomDocteurFamille;
    private String mpsi;
    private String numDossier;
    private List<Long> dossierfile;
}