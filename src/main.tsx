import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // 🎨 Подключаем стили уведомлений
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} /> {/* 🔥 Добавляем уведомления */}
      <App />
      <Navbar />
    </BrowserRouter>
  </React.StrictMode>
);
