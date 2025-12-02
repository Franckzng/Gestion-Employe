// frontend/src/pages/Employees.jsx

import { useState, useEffect } from 'react';
import employeeService from '../services/employeeService';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Search, Edit, Trash2, Eye, Download } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { exportToExcel } from '../utils/exportUtils';
import toast from '../utils/toast';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  useEffect(() => {
    loadEmployees();
  }, [search, filterDepartment]);

  const loadEmployees = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterDepartment) params.department = filterDepartment;
      
      const response = await employeeService.getAll(params);
      setEmployees(response.employees);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await employeeService.delete(id);
        loadEmployees();
        toast.success('Employé supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleExport = () => {
    const data = employees.map(emp => ({
      'Nom': emp.firstName,
      'Prénom': emp.lastName,
      'Email': emp.user.email,
      'Poste': emp.position,
      'Département': emp.department,
      'Date d\'embauche': formatDate(emp.hireDate),
      'Statut': emp.isActive ? 'Actif' : 'Inactif'
    }));
    
    exportToExcel(data, 'employes');
  };

  const departments = [...new Set(employees.map(e => e.department))];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 pt-16">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Employés</h1>
        <div className="flex space-x-3">
          <button onClick={handleExport} className="btn btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
          <button
            onClick={() => {
              setEditingEmployee(null);
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Employé
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nom, prénom, poste..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label">Département</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="input"
            >
              <option value="">Tous les départements</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Email</th>
                <th>Poste</th>
                <th>Département</th>
                <th>Date d'embauche</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                        <p className="text-sm text-gray-500">{employee.user.role}</p>
                      </div>
                    </div>
                  </td>
                  <td>{employee.user.email}</td>
                  <td>{employee.position}</td>
                  <td>{employee.department}</td>
                  <td>{formatDate(employee.hireDate)}</td>
                  <td>
                    <span className={`badge ${employee.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {employee.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingEmployee(employee);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => {
            setShowModal(false);
            setEditingEmployee(null);
          }}
          onSuccess={() => {
            loadEmployees();
            setShowModal(false);
            setEditingEmployee(null);
          }}
        />
      )}
    </div>
  );
};

// Employee Form Modal
const EmployeeModal = ({ employee, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: employee?.user?.email || '',
    password: '',
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    phone: employee?.phone || '',
    address: employee?.address || '',
    position: employee?.position || '',
    department: employee?.department || '',
    salary: employee?.salary || '',
    role: employee?.user?.role || 'EMPLOYEE',
    birthDate: employee?.birthDate ? employee.birthDate.split('T')[0] : '',
    hireDate: employee?.hireDate ? employee.hireDate.split('T')[0] : new Date().toISOString().split('T')[0],
    isActive: employee?.isActive !== undefined ? employee.isActive : true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (employee) {
        await employeeService.update(employee.id, formData);
        toast.success('Employé modifié avec succès');
      } else {
        await employeeService.create(formData);
        toast.success('Employé créé avec succès');
      }
      onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erreur lors de l\'enregistrement';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={employee ? 'Modifier l\'employé' : 'Nouvel employé'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Prénom *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Nom *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              required
            />
            {employee && (
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ La modification de l'email changera l'identifiant de connexion
              </p>
            )}
          </div>

          {!employee && (
            <div>
              <label className="label">Mot de passe *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                required={!employee}
                minLength={6}
              />
            </div>
          )}

          <div>
            <label className="label">Téléphone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Poste *</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Département *</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input"
            >
              <option value="EMPLOYEE">Employé</option>
              <option value="HR">RH</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="label">Date de naissance</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Date d'embauche</label>
            <input
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              className="input"
            />
          </div>

          {employee && (
            <div>
              <label className="label">Statut</label>
              <select
                value={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="input"
              >
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="label">Adresse</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
              rows="2"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default Employees;