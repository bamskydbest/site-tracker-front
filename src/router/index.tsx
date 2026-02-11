import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.js';
import TechnicianFlow from '../pages/TechnicianFlow.js';
import AdminLogin from '../pages/AdminLogin.js';
import AdminDashboard from '../pages/AdminDashboard.js';
import AdminVisitDetail from '../pages/AdminVisitDetail.js';
import TechnicianLayout from '../components/layout/TechnicianLayout.js';
import AdminLayout from '../components/layout/AdminLayout.js';
import ProtectedRoute from './ProtectedRoute.js';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/technician',
    element: <TechnicianLayout />,
    children: [
      { index: true, element: <TechnicianFlow /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'visits/:id', element: <AdminVisitDetail /> },
    ],
  },
]);

export default router;
