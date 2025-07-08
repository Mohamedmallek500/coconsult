package com.bezkoder.spring.security.jwt.payload.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.Set;

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
    private String image; // Nouveau champ

    // Getters et setters pour le nouveau champ
    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    // Autres getters et setters existants
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNumtel() {
        return numtel;
    }

    public void setNumtel(String numtel) {
        this.numtel = numtel;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public LocalDate getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(LocalDate dateNaissance) {
        this.dateNaissance = dateNaissance;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getCin() {
        return cin;
    }

    public void setCin(String cin) {
        this.cin = cin;
    }

    public String getNumCnss() {
        return numCnss;
    }

    public void setNumCnss(String numCnss) {
        this.numCnss = numCnss;
    }

    public String getNomDocteurFamille() {
        return nomDocteurFamille;
    }

    public void setNomDocteurFamille(String nomDocteurFamille) {
        this.nomDocteurFamille = nomDocteurFamille;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getSpeciality() {
        return speciality;
    }

    public void setSpeciality(String speciality) {
        this.speciality = speciality;
    }

    public String getMpsi() {
        return mpsi;
    }

    public void setMpsi(String mpsi) {
        this.mpsi = mpsi;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<String> getRole() {
        return role;
    }

    public void setRole(Set<String> role) {
        this.role = role;
    }

    public String getNumDossier() {
        return numDossier;
    }

    public void setNumDossier(String numDossier) {
        this.numDossier = numDossier;
    }

    public Set<Long> getDossierfile() {
        return dossierfile;
    }

    public void setDossierfile(Set<Long> dossierfile) {
        this.dossierfile = dossierfile;
    }
}