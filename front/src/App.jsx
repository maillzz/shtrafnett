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
import {V_BASE_URL} from "./constans.js";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = decodeJwt(token);
          const currentTime = Date.now() / 1000; // Время в секундах
          if (decoded.exp && decoded.exp > currentTime) {
            setIsAuthenticated(true);
            setIsAdmin(decoded?.is_staff === true || decoded?.role === 'admin');

            // Обновляем lastLogin в localStorage, если токен валиден
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user && user.lastLogin) {
              localStorage.setItem(
                'user',
                JSON.stringify({ ...user, lastLogin: new Date().toLocaleDateString('ru-RU') })
              );
            }
            console.log('Decoded token:', decoded);
          } else {
            console.warn('Token expired or invalid');
            setIsAuthenticated(false);
            setIsAdmin(false);
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Ошибка декодирования токена:', error);
          setIsAuthenticated(false);
          setIsAdmin(false);
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogin = (accessToken, refreshToken) => {
    setIsAuthenticated(true);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh_token', refreshToken); // Сохраняем refresh_token
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const response = await fetch(`${V_BASE_URL}/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (response.ok) {
          console.log('Logout successful');
        } else {
          console.error('Logout failed:', await response.json());
        }
      } catch (error) {
        console.error('Logout server error:', error);
      }
    }
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userRole');
    window.dispatchEvent(new Event('storage')); // Обновляем состояние после логаута
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  const AdminRoute = ({ children }) => {
    return isAuthenticated && isAdmin ? children : <Navigate to="/my-complaints" replace />;
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header isAuthenticated={isAuthenticated} isAdmin={isAdmin} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit-complaint" element={<ProtectedRoute><SubmitComplaint /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login login={handleLogin} />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile onLogout={handleLogout} />
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