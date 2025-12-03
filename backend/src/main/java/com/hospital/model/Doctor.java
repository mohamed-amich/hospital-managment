package com.hospital.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class Doctor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false)
    private String nom;
    
    @NotBlank(message = "Le prénom est obligatoire")
    @Column(nullable = false)
    private String prenom;
    
    @NotBlank(message = "La spécialité est obligatoire")
    @Column(nullable = false)
    private String specialite;
    
    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^[0-9]{8}$", message = "Le téléphone doit contenir 8 chiffres")
    private String telephone;
}