import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ProfileIcon from '../assets/icons/profile.svg';
import WalletIcon from '../assets/icons/wallet.svg';
import PackageIcon from '../assets/icons/package.svg';
import LimitIcon from '../assets/icons/limit.svg';
import ChangePasswordModal from '../components/ChangePasswordModal';

type PackageType = {
  id: number;
  name: string;
};

type ReferralLimitType = {
  totalLimit: number;
  used: number;
  remaining: number;
};

type UserType = {
  id: number;
  login: string;
  balance: number;
  referrerId: number | null;
  package: PackageType | null;
  referralLimit: ReferralLimitType;
};

function ProfilePage() {
  useAuth(); // Проверяем авторизацию
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
      } catch (err) {
        setError('Ошибка загрузки данных');
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!user) return <p>Загрузка...</p>;

  function formatNumber(value: number | string): string {
    return Math.floor(Number(value)) // Убираем .00
      .toLocaleString('ru-RU') // Форматируем с пробелами
      .replace(',', ' '); // На всякий случай заменяем запятые на пробелы
  }

  return (
    <div className='profile'>
      <ul className='profile__info'>
        <li><img src={ProfileIcon} alt="" /><p>Пользователь: {user.login}</p></li>
        <li><img src={WalletIcon} alt="" /><p>Баланс: {formatNumber(user.balance)} AMD</p></li>
        {user.package ? (
        <li><img src={PackageIcon} alt="" /><p>Пакет: {user.package.name}</p></li>
      ) : (
        <li><img src={PackageIcon} alt="" /><p>Пакет: Отсутствует</p></li>
      )}
        <li><img src={LimitIcon} alt="" /><p>Оставшиеся лимит: {formatNumber(user.referralLimit.remaining)} AMD</p></li>
      </ul>
      {/* <p><strong>Использовано:</strong> {user.referralLimit.used}</p> */}
      <div className="profile-btns">
        {/* Кнопки */}
        <button className='resetPass' onClick={() => setShowChangePassword(true)}>Сменить пароль</button>
        <button className='logout' onClick={handleLogout}>Выйти</button>

      </div>
        {/* Модальное окно смены пароля */}
        {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}

export default ProfilePage;
