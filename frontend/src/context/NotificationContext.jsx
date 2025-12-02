// frontend/src/context/NotificationContext.jsx

import { createContext, useState, useEffect } from 'react';
import leaveService from '../services/leaveService';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Charger les notifications
  useEffect(() => {
    if (user) {
      loadNotifications();
      // Rafraîchir toutes les 2 minutes
      const interval = setInterval(loadNotifications, 120000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const notifs = [];

      // Pour les admins : demandes de congé en attente
      if (isAdmin()) {
        const leavesResponse = await leaveService.getAll({ status: 'PENDING' });
        const pendingLeaves = leavesResponse.leaveRequests;

        pendingLeaves.forEach(leave => {
          notifs.push({
            id: `leave-${leave.id}`,
            type: 'leave_request',
            title: 'Nouvelle demande de congé',
            message: `${leave.employee.firstName} ${leave.employee.lastName} a demandé un congé`,
            date: leave.createdAt,
            read: false,
            data: leave
          });
        });
      }

      // Pour les employés : réponses aux demandes
      if (!isAdmin()) {
        const myLeavesResponse = await leaveService.getMyRequests();
        const reviewedLeaves = myLeavesResponse.leaveRequests.filter(
          l => l.status !== 'PENDING' && isRecent(l.reviewedAt)
        );

        reviewedLeaves.forEach(leave => {
          notifs.push({
            id: `leave-response-${leave.id}`,
            type: leave.status === 'APPROVED' ? 'leave_approved' : 'leave_rejected',
            title: leave.status === 'APPROVED' ? 'Congé approuvé' : 'Congé rejeté',
            message: `Votre demande de congé du ${new Date(leave.startDate).toLocaleDateString('fr-FR')} a été ${leave.status === 'APPROVED' ? 'approuvée' : 'rejetée'}`,
            date: leave.reviewedAt,
            read: false,
            data: leave
          });
        });
      }

      // Trier par date décroissante
      notifs.sort((a, b) => new Date(b.date) - new Date(a.date));

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Vérifier si une date est récente (moins de 7 jours)
  const isRecent = (date) => {
    if (!date) return false;
    const daysDiff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  };

  // Marquer comme lu
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Marquer toutes comme lues
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Supprimer une notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notif = notifications.find(n => n.id === notificationId);
      return notif && !notif.read ? Math.max(0, prev - 1) : prev;
    });
  };

  // Ajouter une notification manuelle
  const addNotification = (notification) => {
    const newNotif = {
      id: `manual-${Date.now()}`,
      read: false,
      date: new Date(),
      ...notification
    };
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const value = {
    notifications,
    unreadCount,
    showNotifications,
    setShowNotifications,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};