import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/tailwind.css';
import './styles/globals.css';
import { Login } from './app/Login';
import { DataAnalysis } from './app/DataAnalysis';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/analisis" element={<DataAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}
