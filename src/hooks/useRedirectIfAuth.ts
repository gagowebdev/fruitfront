import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function useRedirectIfAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/profile'); // Если токен есть, отправляем в профиль
    }
  }, [navigate]);
}

export default useRedirectIfAuth;
