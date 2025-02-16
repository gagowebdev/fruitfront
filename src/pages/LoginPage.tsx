import { useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import useRedirectIfAuth from '../hooks/useRedirectIfAuth';
import { Link } from "react-router-dom";

function LoginPage() {
  useRedirectIfAuth();
  
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { login, password }); // Отправляем login вместо email
      const token = response.data.token;

      localStorage.setItem('token', token); // Сохраняем JWT
      navigate('/profile'); // Перенаправляем в профиль
    } catch (err) {
      setError('Ошибка: неверные данные'); // Обрабатываем ошибку
    }
  };

  return (
    <div className="login">
      <h1>Вход</h1>
      {error && <p className='login__error'>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Логин:</label>
          <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} required />
        </div>
        <div>
          <label>Пароль:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Войти</button>
      </form>
      <p>Еще нету аккаунта? <Link to="/register">Регистрация</Link></p>
    </div>
  );
}

export default LoginPage;
