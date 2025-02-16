import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function useAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Если нет токена, отправляем на логин
    }
  }, [navigate]);
}

export default useAuth;
