import React, { useEffect } from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Components
import Layout from './components/Layout';
import LoginForm from './components/auth/LoginForm';
import AdminDashboard from './components/dashboard/AdminDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import CloudStorageSetup from './components/storage/CloudStorageSetup';
import EssaySubmission from './components/essays/EssaySubmission';
import SecureFileSharing from './components/security/SecureFileSharing';

// Define theme
const theme = extendTheme({
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

// Protected route component
interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  element, 
  allowedRoles = [] 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{element}</>;
};

function App() {
  const { refreshToken } = useAuthStore();
  
  // Check for existing auth token on app load
  useEffect(() => {
    refreshToken();
  }, [refreshToken]);
  
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <DashboardRouter />
                  </Layout>
                }
              />
            }
          />
          
          <Route
            path="/storage"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <CloudStorageSetup />
                  </Layout>
                }
                allowedRoles={['admin']}
              />
            }
          />
          
          <Route
            path="/essays"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <EssaySubmission />
                  </Layout>
                }
                allowedRoles={['teacher', 'admin']}
              />
            }
          />
          
          <Route
            path="/my-essays"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <EssaySubmission />
                  </Layout>
                }
                allowedRoles={['student']}
              />
            }
          />
          
          <Route
            path="/shared"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <SecureFileSharing />
                  </Layout>
                }
                allowedRoles={['teacher', 'admin']}
              />
            }
          />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

// Dashboard router component to show the appropriate dashboard based on user role
const DashboardRouter: React.FC = () => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;