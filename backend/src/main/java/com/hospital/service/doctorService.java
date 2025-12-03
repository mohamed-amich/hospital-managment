package com.hospital.service;

import com.hospital.model.Doctor;
import com.hospital.repository.DoctorRepository;

import lombok.AllArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class doctorService {
    
    private final DoctorRepository doctorRepository;
    
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
    
    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }
    
    public Doctor createDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }
    
    public Doctor updateDoctor(Long id, Doctor doctorDetails) {
        Doctor doctor = doctorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Médecin non trouvé avec l'id: " + id));
        
        doctor.setNom(doctorDetails.getNom());
        doctor.setPrenom(doctorDetails.getPrenom());
        doctor.setSpecialite(doctorDetails.getSpecialite());
        doctor.setTelephone(doctorDetails.getTelephone());
        
        return doctorRepository.save(doctor);
    }
    
    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }
    
    public List<Doctor> searchBySpeciality(String specialite) {
        
        List<Doctor> allDoctors = getAllDoctors();
        return allDoctors.stream()
            .filter(d -> d.getSpecialite() != null && d.getSpecialite().toLowerCase().contains(specialite.toLowerCase()))
            .toList();
    }
}
