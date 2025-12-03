import React, { useState, useEffect, useCallback } from 'react';
import { Users, Calendar, FileText, Activity, Plus, Edit, Trash2, Search } from 'lucide-react';
import './index.css'

const API_BASE_URL = 'http://localhost:8080/api';


const HospitalManagement = () => {
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({});


  const fetchData = useCallback(async (endpoint, setter) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${endpoint}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
      }
      const data = await response.json();
      setter(data);
    } catch (err) {
      console.error(`Erreur lors du chargement des ${endpoint}:`, err);
      setError('Erreur lors du chargement des données. Veuillez vérifier la connexion au backend.');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    if (activeTab === 'patients') {
      fetchData('patients', setPatients);
    } else if (activeTab === 'doctors') {
      fetchData('doctors', setDoctors);
    } else if (activeTab === 'appointments') {
      fetchData('appointments', setAppointments);
    }
  }, [activeTab, fetchData]);

  // --- Modal Management ---

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  };

  // 2. CRUD Operations (Create/Update)
  const handleSubmit = async () => {
    const isEditing = !!editingItem;
    let url, method, body;
    let refreshData = () => {};

    if (modalType === 'patient') {
      url = `${API_BASE_URL}/patients${isEditing ? '/' + editingItem.id : ''}`;
      method = isEditing ? 'PUT' : 'POST';
      body = JSON.stringify(formData);
      refreshData = () => fetchData('patients', setPatients);
      
      // Patient phone validation from Patient.java: "^[0-9]{10}$" (10 digits)
      if (formData.telephone && formData.telephone.length !== 10) {
        alert("Le numéro de téléphone du patient doit contenir 10 chiffres.");
        return;
      }

    } else if (modalType === 'doctor') {
      url = `${API_BASE_URL}/doctors${isEditing ? '/' + editingItem.id : ''}`;
      method = isEditing ? 'PUT' : 'POST';
      body = JSON.stringify(formData);
      refreshData = () => fetchData('doctors', setDoctors);
      
      // Doctor phone validation from Doctor.java: "^[0-9]{8}$" (8 digits)
      if (formData.telephone && formData.telephone.length !== 8) {
        alert("Le numéro de téléphone du médecin doit contenir 8 chiffres.");
        return;
      }
      
    } else if (modalType === 'appointment') {
      url = `${API_BASE_URL}/appointments${isEditing ? '/' + editingItem.id : ''}`;
      method = isEditing ? 'PUT' : 'POST';
      
      // Adjust keys for backend: heure (time string) -> LocalTime, date (date string) -> LocalDate
      // The backend expects patientId and doctorId as Longs, but they come from <select> as strings, so we ensure they are numbers.
      const appointmentData = {
        ...formData,
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
      };
      
      body = JSON.stringify(appointmentData);
      refreshData = () => fetchData('appointments', setAppointments);
    } else {
      return;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      if (!response.ok) {
        // Log details for debugging. Spring validation errors are often 400.
        const errorText = await response.text();
        console.error('Erreur API:', response.status, errorText);
        throw new Error(`Échec de l'opération ${isEditing ? 'de modification' : "d'ajout"}. Statut: ${response.status}`);
      }

      refreshData();
      closeModal();
    } catch (e) {
      alert(`Erreur: ${e.message}. Veuillez vérifier les données du formulaire et le statut du backend.`);
      console.error(e);
    }
  };

  // 3. Delete Operation
  const handleDelete = async (type, id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return;
    }

    let url;
    let refreshData = () => {};

    if (type === 'patient') {
      url = `${API_BASE_URL}/patients/${id}`;
      refreshData = () => fetchData('patients', setPatients);
    } else if (type === 'doctor') {
      url = `${API_BASE_URL}/doctors/${id}`;
      refreshData = () => fetchData('doctors', setDoctors);
    } else if (type === 'appointment') {
      url = `${API_BASE_URL}/appointments/${id}`;
      refreshData = () => fetchData('appointments', setAppointments);
    } else {
      return;
    }

    try {
      const response = await fetch(url, { method: 'DELETE' });

      if (response.status !== 204) { // 204 No Content is expected for successful DELETE
        throw new Error(`Échec de la suppression. Statut: ${response.status}`);
      }

      refreshData();
    } catch (e) {
      alert(`Erreur de suppression: ${e.message}`);
      console.error(e);
    }
  };

  // --- Helper Functions (Keep original logic) ---

  const getPatientName = (id) => {
    const patient = patients.find(p => p.id === id);
    return patient ? `${patient.prenom} ${patient.nom}` : 'N/A (Patient non trouvé)';
  };

  const getDoctorName = (id) => {
    const doctor = doctors.find(d => d.id === id);
    return doctor ? `Dr. ${doctor.prenom} ${doctor.nom}` : 'N/A (Médecin non trouvé)';
  };

  // --- Filtering (Keep original logic, now filtering fetched data) ---

  const filteredPatients = patients.filter(p => 
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDoctors = doctors.filter(d => 
    d.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.specialite.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // No filtering for appointments in the original code, so we keep the appointments array directly.
  const filteredAppointments = appointments.filter(a => {
    const patientName = getPatientName(a.patientId).toLowerCase();
    const doctorName = getDoctorName(a.doctorId).toLowerCase();
    const term = searchTerm.toLowerCase();

    return (
      patientName.includes(term) ||
      doctorName.includes(term) ||
      a.date.includes(term)
    );
  });
  
  // --- Rendering ---
  
  // Render loading/error state
  if (loading && patients.length === 0 && doctors.length === 0 && appointments.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-blue-600">Chargement des données...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">Erreur: {error}</div>;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8" />
            Système de Gestion Hospitalière
          </h1>
          <p className="text-blue-100 mt-2">Gestion complète des patients, médecins et rendez-vous</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg mb-6">
          {/* Tab buttons */}
          <div className="flex border-b">
            <button
              onClick={() => { setActiveTab('patients'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'patients' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              Patients
            </button>
            <button
              onClick={() => { setActiveTab('doctors'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'doctors' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              Médecins
            </button>
            <button
              onClick={() => { setActiveTab('appointments'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'appointments' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Rendez-vous
            </button>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => openModal(activeTab === 'patients' ? 'patient' : activeTab === 'doctors' ? 'doctor' : 'appointment')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                Ajouter
              </button>
            </div>

            {/* Patients Table */}
            {activeTab === 'patients' && (
              <div className="overflow-x-auto">
                {filteredPatients.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun patient trouvé.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Âge</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnostic</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.nom}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.prenom}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.telephone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.diagnostic}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openModal('patient', patient)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('patient', patient.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Doctors Table */}
            {activeTab === 'doctors' && (
              <div className="overflow-x-auto">
                {filteredDoctors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun médecin trouvé.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spécialité</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDoctors.map((doctor) => (
                        <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.nom}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.prenom}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {doctor.specialite}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.telephone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openModal('doctor', doctor)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('doctor', doctor.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Appointments Table */}
            {activeTab === 'appointments' && (
              <div className="overflow-x-auto">
                {filteredAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun rendez-vous trouvé.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médecin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getPatientName(appointment.patientId)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getDoctorName(appointment.doctorId)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.heure}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appointment.statut === 'Confirmé' ? 'bg-green-100 text-green-800' : 
                              appointment.statut === 'Annulé' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openModal('appointment', appointment)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('appointment', appointment.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal - The modal logic is mostly kept the same, but the data is fetched from state */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {editingItem ? 'Modifier' : 'Ajouter'} {modalType === 'patient' ? 'un Patient' : modalType === 'doctor' ? 'un Médecin' : 'un Rendez-vous'}
            </h2>
            <div>
              {modalType === 'patient' && (
                <>
                  <input
                    type="text"
                    placeholder="Nom"
                    value={formData.nom || ''}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={formData.prenom || ''}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Âge"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || '' })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone (10 chiffres)"
                    value={formData.telephone || ''}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Diagnostic"
                    value={formData.diagnostic || ''}
                    onChange={(e) => setFormData({ ...formData, diagnostic: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}
              {modalType === 'doctor' && (
                <>
                  <input
                    type="text"
                    placeholder="Nom"
                    value={formData.nom || ''}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={formData.prenom || ''}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Spécialité"
                    value={formData.specialite || ''}
                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone (8 chiffres)"
                    value={formData.telephone || ''}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}
              {modalType === 'appointment' && (
                <>
                  <select
                    value={formData.patientId || ''}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                    ))}
                  </select>
                  <select
                    value={formData.doctorId || ''}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un médecin</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>Dr. {d.prenom} {d.nom} - {d.specialite}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="time"
                    value={formData.heure || ''}
                    onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={formData.statut || 'En attente'}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="En attente">En attente</option>
                    <option value="Confirmé">Confirmé</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingItem ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalManagement;