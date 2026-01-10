package com.bezkoder.spring.security.jwt.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
@Getter
@Setter
@NoArgsConstructor
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
  private String image;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "user_roles",
          joinColumns = @JoinColumn(name = "user_id"),
          inverseJoinColumns = @JoinColumn(name = "role_id"))
  private Set<Role> roles = new HashSet<>();

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
}