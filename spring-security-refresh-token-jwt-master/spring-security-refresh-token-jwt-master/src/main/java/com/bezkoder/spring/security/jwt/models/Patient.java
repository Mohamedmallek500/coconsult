package com.bezkoder.spring.security.jwt.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "patients")
public class Patient extends User {
    @Size(max = 20)
    private String numCnss;

    @Size(max = 100)
    private String nomDocteurFamille;

    @Size(max = 20)
    private String mpsi;

    @Size(max = 20)
    private String numDossier;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "patient_maladies",
            joinColumns = @JoinColumn(name = "patient_id"),
            inverseJoinColumns = @JoinColumn(name = "maladie_id"))
    private Set<Maladie> dossierfile = new HashSet<>();

    public Patient() {
    }

    public Patient(String username, String email, String numtel, String nom, String prenom,
                   LocalDate dateNaissance, String adresse, String cin, String password,
                   String image, String numCnss, String nomDocteurFamille, String mpsi,
                   String numDossier, Set<Maladie> dossierfile) {
        super(username, email, numtel, nom, prenom, dateNaissance, adresse, cin, password, image);
        this.numCnss = numCnss;
        this.nomDocteurFamille = nomDocteurFamille;
        this.mpsi = mpsi;
        this.numDossier = numDossier;
        this.dossierfile = dossierfile;
    }

    // Getters et setters existants
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

    public String getMpsi() {
        return mpsi;
    }

    public void setMpsi(String mpsi) {
        this.mpsi = mpsi;
    }

    public String getNumDossier() {
        return numDossier;
    }

    public void setNumDossier(String numDossier) {
        this.numDossier = numDossier;
    }

    public Set<Maladie> getDossierfile() {
        return dossierfile;
    }

    public void setDossierfile(Set<Maladie> dossierfile) {
        this.dossierfile = dossierfile;
    }
}