// frontend/src/pages/Attendance.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import attendanceService from '../services/attendanceService';
import employeeService from '../services/employeeService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { Clock, LogIn, LogOut, Download, Calendar } from 'lucide-react';
import { formatDate, formatTime } from '../utils/helpers';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import toast from '../utils/toast';

const Attendance = () => {
  const { user, isAdmin } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    employeeId: ''
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isAdmin()) {
      loadAttendances();
    }
  }, [filters]);

  const loadData = async () => {
    try {
      const today = await attendanceService.getToday();
      setTodayAttendance(today);

      if (isAdmin()) {
        const empsData = await employeeService.getAll();
        setEmployees(empsData.employees);
        loadAttendances();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendances = async () => {
    try {
      const response = await attendanceService.getAll(filters);
      setAttendances(response.attendances);
    } catch (error) {
      console.error('Error loading attendances:', error);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const response = await attendanceService.checkIn();
      setTodayAttendance(response.attendance);
      toast.success('Arrivée enregistrée avec succès !');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors du pointage');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      const response = await attendanceService.checkOut();
      setTodayAttendance(response.attendance);
      toast.success('Départ enregistré avec succès !');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors du pointage');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleExport = (format) => {
    const data = attendances.map(att => ({
      'Employé': `${att.employee.firstName} ${att.employee.lastName}`,
      'Date': formatDate(att.date),
      'Arrivée': att.checkIn ? formatTime(att.checkIn) : '-',
      'Départ': att.checkOut ? formatTime(att.checkOut) : '-',
      'Heures': att.workHours || 0,
      'Statut': att.status
    }));

    if (format === 'excel') {
      exportToExcel(data, 'presences');
    } else {
      exportToPDF(data, 'Rapport de Présences', 'presences');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 pt-16">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Présences</h1>
        {isAdmin() && (
          <div className="flex space-x-3">
            <button onClick={() => handleExport('excel')} className="btn btn-secondary">
              <Download className="w-4 h-4 mr-2" />
              Excel
            </button>
            <button onClick={() => handleExport('pdf')} className="btn btn-secondary">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
          </div>
        )}
      </div>

      {/* Check In/Out Card */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Pointage du Jour</h3>
            <div className="text-4xl font-bold text-primary-600">
              {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-gray-600 mt-1">{formatDate(new Date())}</p>
          </div>

          <div className="flex space-x-4">
            {!todayAttendance ? (
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="btn btn-success flex items-center space-x-2 px-8 py-4 text-lg"
              >
                <LogIn className="w-6 h-6" />
                <span>Pointer Arrivée</span>
              </button>
            ) : !todayAttendance.checkOut ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Arrivée</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatTime(todayAttendance.checkIn)}
                  </p>
                </div>
                <button
                  onClick={handleCheckOut}
                  disabled={checkingIn}
                  className="btn btn-danger flex items-center space-x-2 px-8 py-4 text-lg"
                >
                  <LogOut className="w-6 h-6" />
                  <span>Pointer Départ</span>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="flex space-x-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Arrivée</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatTime(todayAttendance.checkIn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Départ</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatTime(todayAttendance.checkOut)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Total : {todayAttendance.workHours}h
                </p>
                <span className="badge badge-success">Journée terminée</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Section */}
      {isAdmin() && (
        <>
          {/* Filters */}
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Date Début</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Date Fin</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Employé</label>
                <select
                  value={filters.employeeId}
                  onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                  className="input"
                >
                  <option value="">Tous les employés</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Attendances Table */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Historique des Présences</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Date</th>
                    <th>Arrivée</th>
                    <th>Départ</th>
                    <th>Heures</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((attendance) => (
                    <tr key={attendance.id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {attendance.employee.firstName[0]}{attendance.employee.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {attendance.employee.firstName} {attendance.employee.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{attendance.employee.department}</p>
                          </div>
                        </div>
                      </td>
                      <td>{formatDate(attendance.date)}</td>
                      <td>{attendance.checkIn ? formatTime(attendance.checkIn) : '-'}</td>
                      <td>{attendance.checkOut ? formatTime(attendance.checkOut) : '-'}</td>
                      <td>{attendance.workHours || 0}h</td>
                      <td>
                        <span className={`badge ${
                          attendance.status === 'PRESENT' ? 'badge-success' :
                          attendance.status === 'LATE' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {attendance.status === 'PRESENT' ? 'Présent' :
                           attendance.status === 'LATE' ? 'Retard' : 'Absent'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;