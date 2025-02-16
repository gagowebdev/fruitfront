import { useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import useRedirectIfAuth from '../hooks/useRedirectIfAuth';
import { Link } from "react-router-dom";

function RegisterPage() {
  useRedirectIfAuth();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [referrerId, setReferrerId] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register', { 
        login, 
        password, 
        referrerId: referrerId ? Number(referrerId) : undefined 
      });

      setSuccess('Регистрация успешна! Перенаправление...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className="login">
      <h2>Регистрация</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form className='form' onSubmit={handleRegister}>
        <div>
          <label>Логин:</label>
          <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} required />
        </div>
        <div>
          <label>Пароль:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>ID рефера:</label>
          <input type="number" value={referrerId} onChange={(e) => setReferrerId(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <button className='button' type="submit">Зарегистрироваться</button>
      </form>
      <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </div>
  );
}

export default RegisterPage;
