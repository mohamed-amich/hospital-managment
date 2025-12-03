package com.hospital.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class Appointment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "L'ID du patient est obligatoire")
    @Column(name = "patient_id", nullable = false)
    private Long   patientId;
    
    @NotNull(message = "L'ID du médecin est obligatoire")
    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;
    
    @NotNull(message = "La date est obligatoire")
    @Column(nullable = false)
    private LocalDate date;
    
    @NotNull(message = "L'heure est obligatoire")
    @Column(nullable = false)
    private LocalTime heure;
    
    @NotBlank(message = "Le statut est obligatoire")
    @Pattern(regexp = "En attente|Confirmé|Annulé", 
             message = "Le statut doit être: En attente, Confirmé ou Annulé")
    @Column(nullable = false)
    private String statut;
}