import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import AdminDashboard from './pages/admin/AdminDashboard';
import TelecallerDashboard from './pages/telecaller/TelecallerDashboard';

// Placeholders for now

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            {/* Routes wrapped in Layout */}
            <Route element={<Layout />}>
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
