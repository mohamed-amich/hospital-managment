
package com.hospital.service;
import com.hospital.model.Appointment;
import com.hospital.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
    
    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }
    
    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }
    
    public Appointment updateAppointment(Long id, Appointment appointmentDetails) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé avec l'id: " + id));

        appointment.setPatientId(appointmentDetails.getPatientId());
        appointment.setDoctorId(appointmentDetails.getDoctorId());
        appointment.setDate(appointmentDetails.getDate());
        appointment.setHeure(appointmentDetails.getHeure());
        appointment.setStatut(appointmentDetails.getStatut());

        return appointmentRepository.save(appointment);
    }
    
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
    
    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }
    
    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }
    
    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByDate(date);
    }
}