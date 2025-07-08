package com.bezkoder.spring.security.jwt.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "username"),
                @UniqueConstraint(columnNames = "email"),
                @UniqueConstraint(columnNames = "numtel"),
                @UniqueConstraint(columnNames = "cin")
        })
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Size(max = 20)
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

  @NotBlank
  @Size(max = 120)
  private String password;

  @Size(max = 255)
  private String image; // Nouveau champ pour le chemin de l'image

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "user_roles",
          joinColumns = @JoinColumn(name = "user_id"),
          inverseJoinColumns = @JoinColumn(name = "role_id"))
  private Set<Role> roles = new HashSet<>();

  public User() {
  }

  public User(String username, String email, String numtel, String nom, String prenom,
              LocalDate dateNaissance, String adresse, String cin, String password, String image) {
    this.username = username;
    this.email = email;
    this.numtel = numtel;
    this.nom = nom;
    this.prenom = prenom;
    this.dateNaissance = dateNaissance;
    this.adresse = adresse;
    this.cin = cin;
    this.password = password;
    this.image = image;
  }

  // Getters et setters pour le nouveau champ
  public String getImage() {
    return image;
  }

  public void setImage(String image) {
    this.image = image;
  }

  // Autres getters et setters existants
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

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

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public Set<Role> getRoles() {
    return roles;
  }

  public void setRoles(Set<Role> roles) {
    this.roles = roles;
  }
}