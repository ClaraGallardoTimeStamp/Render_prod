// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importamos nuestros archivos de estilos
import './styles/tailwind.css';
import './styles/globals.css';

// Importamos nuestras pantallas
import { Login } from './app/Login.tsx';
import { DataAnalysis } from './app/DataAnalysis';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Si entran a la raíz, los mandamos al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Asignamos cada componente a una URL */}
        <Route path="/login" element={<Login />} />
        <Route path="/analisis" element={<DataAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}