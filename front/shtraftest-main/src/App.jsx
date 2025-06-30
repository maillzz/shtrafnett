// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { decodeJwt } from 'jose';
import Home from './pages/Home';
import SubmitComplaint from './pages/SubmitComplaint';
import About from './pages/About';
import MyComplaints from './pages/MyComplaints';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Header from './components/Header';
import Footer from './components/Footer';
import Admin from './pages/Admin';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = decodeJwt(token);
          setIsAuthenticated(true);
          setIsAdmin(decoded.role === 'admin');
        } catch (error) {
          console.error('Ошибка декодирования токена:', error);
          setIsAuthenticated(false);
          setIsAdmin(false);
          localStorage.removeItem('token');
        }
      } else {
        setIsAuthenticated(!!localStorage.getItem('isAuthenticated')); // Фallback
        setIsAdmin(false);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    const interval = setInterval(checkAuth, 100);

    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const ProtectedRoute = ({ children }) => {
    console.log('ProtectedRoute isAuthenticated:', isAuthenticated); // Для отладки
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  const AdminRoute = ({ children }) => {
    return isAuthenticated && isAdmin ? children : <Navigate to="/my-complaints" replace />;
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header isAuthenticated={isAuthenticated} isAdmin={isAdmin} /> {/* Передаем пропы */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
            <Route path="/home" element={<Home isAuthenticated={isAuthenticated} />} />
            <Route path="/submit-complaint" element={<SubmitComplaint />} />
            <Route path="/about" element={<About />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-complaints"
              element={
                <ProtectedRoute>
                  <MyComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;