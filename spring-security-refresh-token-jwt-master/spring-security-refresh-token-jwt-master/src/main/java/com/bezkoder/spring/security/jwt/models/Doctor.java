package com.bezkoder.spring.security.jwt.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Entity
@Table(name = "doctors")
public class Doctor extends User {
    @Size(max = 100)
    private String speciality;

    @Size(max = 500)
    private String bio;

    private boolean isApproved = false;

    public Doctor() {
    }

    public Doctor(String username, String email, String numtel, String nom, String prenom,
                  LocalDate dateNaissance, String adresse, String cin, String password,
                  String image, String speciality, String bio) {
        super(username, email, numtel, nom, prenom, dateNaissance, adresse, cin, password, image);
        this.speciality = speciality;
        this.bio = bio;
    }

    // Getters et setters
    public String getSpeciality() {
        return speciality;
    }

    public void setSpeciality(String speciality) {
        this.speciality = speciality;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public boolean isApproved() {
        return isApproved;
    }

    public void setApproved(boolean approved) {
        isApproved = approved;
    }
}