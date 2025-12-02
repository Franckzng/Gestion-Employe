// frontend/src/pages/Notifications.jsx

import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, Calendar, Check, X, Trash2, CheckCheck } from 'lucide-react';
import { formatDate, formatTime } from '../utils/helpers';

const Notifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotifications();

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);

    if (notification.type === 'leave_request' || 
        notification.type === 'leave_approved' || 
        notification.type === 'leave_rejected') {
      navigate('/leaves');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave_request':
        return <Calendar className="w-6 h-6 text-blue-600" />;
      case 'leave_approved':
        return <Check className="w-6 h-6 text-green-600" />;
      case 'leave_rejected':
        return <X className="w-6 h-6 text-red-600" />;
      default:
        return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'leave_request':
        return 'bg-blue-100';
      case 'leave_approved':
        return 'bg-green-100';
      case 'leave_rejected':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 
              ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Aucune nouvelle notification'
            }
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-secondary">
            <CheckCheck className="w-4 h-4 mr-2" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aucune notification
          </h3>
          <p className="text-gray-500">
            Vous n'avez pas de notifications pour le moment
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card hover:shadow-lg transition-all cursor-pointer ${
                !notification.read ? 'border-l-4 border-primary-600' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`p-3 rounded-full ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="badge badge-info ml-2">Nouveau</span>
                    )}
                  </div>

                  <p className="text-gray-600 mb-3">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {formatDate(notification.date)} à {formatTime(notification.date)}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;