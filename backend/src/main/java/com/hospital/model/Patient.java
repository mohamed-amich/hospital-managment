package com.hospital.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class Patient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false)
    private String nom;
    
    @NotBlank(message = "Le prénom est obligatoire")
    @Column(nullable = false)
    private String prenom;
    
    @NotNull(message = "L'âge est obligatoire")
    @Min(value = 0, message = "L'âge doit être positif")
    @Max(value = 150, message = "L'âge doit être réaliste")
    private Integer age;
    
    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^[0-9]{10}$", message = "Le téléphone doit contenir 10 chiffres")
    private String telephone;
    
    @NotBlank(message = "Le diagnostic est obligatoire")
    @Column(length = 500)
    private String diagnostic;
}
