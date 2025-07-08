package com.bezkoder.spring.security.jwt.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Data
public class UserRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;


    @Size(min = 6, max = 40)
    private String password;

    private String numtel;
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private String adresse;
    private String cin;

    // Changed to handle both single role string and role set
    @JsonProperty("roles")
    private Set<String> roles = new HashSet<>();

    private String speciality;
    private String bio;
    private String numCnss;
    private String nomDocteurFamille;
    private String mpsi;
    private String numDossier;
    private List<Long> dossierfile;

    public UserRequest() {}

    // Getters and setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNumtel() { return numtel; }
    public void setNumtel(String numtel) { this.numtel = numtel; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public LocalDate getDateNaissance() { return dateNaissance; }
    public void setDateNaissance(LocalDate dateNaissance) { this.dateNaissance = dateNaissance; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles != null ? roles : new HashSet<>();
    }

    // Additional setter to handle single role string
    @JsonProperty("role")
    public void setRole(String role) {
        this.roles.clear();
        if (role != null && !role.isEmpty()) {
            this.roles.add(role);
        }
    }

    public String getSpeciality() { return speciality; }
    public void setSpeciality(String speciality) { this.speciality = speciality; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getNumCnss() { return numCnss; }
    public void setNumCnss(String numCnss) { this.numCnss = numCnss; }

    public String getNomDocteurFamille() { return nomDocteurFamille; }
    public void setNomDocteurFamille(String nomDocteurFamille) { this.nomDocteurFamille = nomDocteurFamille; }

    public String getMpsi() { return mpsi; }
    public void setMpsi(String mpsi) { this.mpsi = mpsi; }

    public String getNumDossier() { return numDossier; }
    public void setNumDossier(String numDossier) { this.numDossier = numDossier; }

    public List<Long> getDossierfile() { return dossierfile; }
    public void setDossierfile(List<Long> dossierfile) {
        this.dossierfile = dossierfile != null ? dossierfile : List.of();
    }
}