// frontend/src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Users, Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '../utils/helpers';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      if (isAdmin()) {
        const response = await dashboardService.getAdminDashboard();
        setData(response);
      } else {
        const response = await dashboardService.getEmployeeDashboard();
        setData(response);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 pt-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour, {user?.employee?.firstName} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenue sur votre tableau de bord
        </p>
      </div>

      {isAdmin() ? <AdminDashboard data={data} /> : <EmployeeDashboard data={data} />}
    </div>
  );
};

// Dashboard Admin
const AdminDashboard = ({ data }) => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employés"
          value={data.employees.total}
          icon={Users}
          color="blue"
          subtitle={`${data.employees.active} actifs`}
        />
        <StatCard
          title="Présents Aujourd'hui"
          value={data.attendance.today.present}
          icon={CheckCircle}
          color="green"
          subtitle={`${data.attendance.today.late} en retard`}
        />
        <StatCard
          title="Absents"
          value={data.attendance.today.absent}
          icon={XCircle}
          color="red"
          subtitle={`${data.attendance.today.onLeave} en congé`}
        />
        <StatCard
          title="Demandes en Attente"
          value={data.leaves.pending}
          icon={AlertCircle}
          color="yellow"
          subtitle={`${data.leaves.approvedThisMonth} approuvées ce mois`}
        />
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Présences - 7 Derniers Jours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.attendance.last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => formatDate(date, 'dd/MM')}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => formatDate(date)}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Présents"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Departments */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Employés par Département</h3>
          <div className="space-y-3">
            {data.departments.map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{dept.name}</span>
                <span className="badge badge-info">{dept.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Demandes de Congé Récentes</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Date Début</th>
                <th>Date Fin</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {data.leaves.recentRequests.map((leave) => (
                <tr key={leave.id}>
                  <td>
                    {leave.employee.firstName} {leave.employee.lastName}
                  </td>
                  <td className="capitalize">{leave.leaveType.toLowerCase()}</td>
                  <td>{formatDate(leave.startDate)}</td>
                  <td>{formatDate(leave.endDate)}</td>
                  <td>
                    <span className="badge badge-warning">En attente</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// Dashboard Employee
const EmployeeDashboard = ({ data }) => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Jours Présents"
          value={data.thisMonth.attendance.presentDays}
          icon={CheckCircle}
          color="green"
          subtitle="Ce mois"
        />
        <StatCard
          title="Jours en Retard"
          value={data.thisMonth.attendance.lateDays}
          icon={Clock}
          color="yellow"
          subtitle="Ce mois"
        />
        <StatCard
          title="Heures Travaillées"
          value={data.thisMonth.attendance.totalWorkHours}
          icon={Clock}
          color="blue"
          subtitle="Ce mois"
        />
        <StatCard
          title="Congés Approuvés"
          value={data.thisMonth.leaves.approved}
          icon={Calendar}
          color="purple"
          subtitle={`${data.thisMonth.leaves.pending} en attente`}
        />
      </div>

      {/* Today's Attendance */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Ma Présence Aujourd'hui</h3>
        {data.today.attendance ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Arrivée :</span>
              <span className="font-semibold">
                {new Date(data.today.attendance.checkIn).toLocaleTimeString('fr-FR')}
              </span>
            </div>
            {data.today.attendance.checkOut && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Départ :</span>
                <span className="font-semibold">
                  {new Date(data.today.attendance.checkOut).toLocaleTimeString('fr-FR')}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Statut :</span>
              <span className={`badge ${
                data.today.attendance.status === 'PRESENT' ? 'badge-success' : 'badge-warning'
              }`}>
                {data.today.attendance.status === 'PRESENT' ? 'Présent' : 'En retard'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Vous n'avez pas encore pointé aujourd'hui</p>
        )}
      </div>

      {/* Last 7 Days */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Présences - 7 Derniers Jours</h3>
        <div className="space-y-2">
          {data.last7Days.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{formatDate(day.date)}</span>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{day.workHours}h</span>
                <span className={`badge ${
                  day.status === 'PRESENT' ? 'badge-success' :
                  day.status === 'LATE' ? 'badge-warning' : 'badge-danger'
                }`}>
                  {day.status === 'PRESENT' ? 'Présent' :
                   day.status === 'LATE' ? 'Retard' : 'Absent'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leave Requests */}
      {data.recentLeaveRequests.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Mes Demandes de Congé</h3>
          <div className="space-y-3">
            {data.recentLeaveRequests.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium capitalize">{leave.leaveType.toLowerCase()}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </p>
                </div>
                <span className={`badge ${
                  leave.status === 'APPROVED' ? 'badge-success' :
                  leave.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {leave.status === 'APPROVED' ? 'Approuvé' :
                   leave.status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;