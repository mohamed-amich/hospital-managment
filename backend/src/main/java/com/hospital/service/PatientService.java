package com.hospital.service;

import com.hospital.model.Patient;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientService {
    
    private final PatientRepository patientRepository;
    
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }
    
    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }
    
    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }
    
    public Patient updatePatient(Long id, Patient patientDetails) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé avec l'id: " + id));
        
        patient.setNom(patientDetails.getNom());
        patient.setPrenom(patientDetails.getPrenom());
        patient.setAge(patientDetails.getAge());
        patient.setTelephone(patientDetails.getTelephone());
        patient.setDiagnostic(patientDetails.getDiagnostic());
        
        return patientRepository.save(patient);
    }
    
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
    
    public List<Patient> searchPatients(String keyword) {
        return patientRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(
            keyword, keyword
        );
    }
}