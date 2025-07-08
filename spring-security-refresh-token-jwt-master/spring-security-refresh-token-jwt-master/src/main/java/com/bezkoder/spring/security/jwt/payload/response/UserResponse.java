package com.bezkoder.spring.security.jwt.payload.response;

import java.time.LocalDate;
import java.util.List;

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

    public UserResponse(Long id, String username, String email, String numtel, String nom, String prenom,
                        LocalDate dateNaissance, String adresse, String cin, String image, List<String> roles,
                        Boolean isApproved, String speciality, String bio, String numCnss, String nomDocteurFamille,
                        String mpsi, String numDossier, List<Long> dossierfile) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.numtel = numtel;
        this.nom = nom;
        this.prenom = prenom;
        this.dateNaissance = dateNaissance;
        this.adresse = adresse;
        this.cin = cin;
        this.image = image;
        this.roles = roles;
        this.isApproved = isApproved;
        this.speciality = speciality;
        this.bio = bio;
        this.numCnss = numCnss;
        this.nomDocteurFamille = nomDocteurFamille;
        this.mpsi = mpsi;
        this.numDossier = numDossier;
        this.dossierfile = dossierfile;
    }

    // Getters
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getNumtel() { return numtel; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public LocalDate getDateNaissance() { return dateNaissance; }
    public String getAdresse() { return adresse; }
    public String getCin() { return cin; }
    public String getImage() { return image; }
    public List<String> getRoles() { return roles; }
    public Boolean getIsApproved() { return isApproved; }
    public String getSpeciality() { return speciality; }
    public String getBio() { return bio; }
    public String getNumCnss() { return numCnss; }
    public String getNomDocteurFamille() { return nomDocteurFamille; }
    public String getMpsi() { return mpsi; }
    public String getNumDossier() { return numDossier; }
    public List<Long> getDossierfile() { return dossierfile; }
}