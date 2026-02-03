import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Carteira from './pages/Carteira';
import Duelo from './pages/Duelo';
import Mercado from './pages/Mercado';
import AdminPanel from './pages/AdminPanel';

// Componente para proteger rotas
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Pode colocar um spinner ou loading screen aqui
    return <div>Carregando...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPanel />
              </PrivateRoute>
            }
          />

          <Route
            path="/carteira"
            element={
              <PrivateRoute>
                <Carteira />
              </PrivateRoute>
            }
          />
          <Route
            path="/mercado"
            element={
              <PrivateRoute>
                <Mercado />
              </PrivateRoute>
            }
          />
          <Route
            path="/duelo"
            element={
              <PrivateRoute>
                <Duelo />
              </PrivateRoute>
            }
          />

          {/* Qualquer rota inválida */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;