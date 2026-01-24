import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

import AdminDashboard from './pages/admin/AdminDashboard';
import OwnerDashboard from './pages/admin/OwnerDashboard';
import TelecallerDashboard from './pages/telecaller/TelecallerDashboard';

// Placeholders for now

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/owner" element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route index element={<OwnerDashboard />} />
              </Route>

              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'branch_admin']} />}>
                <Route index element={<AdminDashboard />} />
              </Route>

              <Route path="/telecaller" element={<ProtectedRoute allowedRoles={['telecaller']} />}>
                <Route index element={<TelecallerDashboard />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
