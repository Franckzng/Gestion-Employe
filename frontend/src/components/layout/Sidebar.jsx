// frontend/src/components/layout/Sidebar.jsx

import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Clock 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen }) => {
  const { isAdmin } = useAuth();

  const menuItems = [
    {
      name: 'Tableau de Bord',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'HR', 'EMPLOYEE']
    },
    {
      name: 'Employés',
      path: '/employees',
      icon: Users,
      roles: ['ADMIN', 'HR']
    },
    {
      name: 'Présences',
      path: '/attendance',
      icon: Clock,
      roles: ['ADMIN', 'HR', 'EMPLOYEE']
    },
    {
      name: 'Demandes de Congé',
      path: '/leaves',
      icon: Calendar,
      roles: ['ADMIN', 'HR', 'EMPLOYEE']
    }
  ];

  const filteredMenuItems = isAdmin()
    ? menuItems
    : menuItems.filter(item => item.roles.includes('EMPLOYEE'));

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 z-40 ${
        isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
      }`}
    >
      <nav className="p-4 space-y-2">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;