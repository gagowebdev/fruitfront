import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';
import Modal from '../components/Modal'; // ✅ Импортируем модалку
import PackageIcon from '../assets/icons/package.svg';
import LimitIcon from '../assets/icons/limit.svg';
import EarningIcon from '../assets/icons/earning.svg';
import CopyIcon from '../assets/icons/copy.svg'; // Иконка копирования
import { toast } from 'react-toastify';

type PackageType = {
  id: number;
  name: string;
  price: number;
  referral_bonus: number;
  earnings_limit: number;
};

type ReferralType = {
  id: number;
  login: string;
  package: string | null;
};

type UserType = {
  id: number;
  login: string;
  balance: number;
  package: { id: number; name: string } | null;
  referralLimit: { totalLimit: number; used: number; remaining: number };
};

function ReferralPage() {
  useAuth();

  const [user, setUser] = useState<UserType | null>(null);
  const [referrals, setReferrals] = useState<ReferralType[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null); // ✅ Состояние для модалки

  // Градиенты для пакетов
  const gradients = [
    'linear-gradient(-90deg, #38C91C, #1C630E)',
    'linear-gradient(-90deg, #307BDF, #1A4379)',
    'linear-gradient(-90deg, #F164F9, #8E3B93)',
    'linear-gradient(-90deg, #FFC889, #E38110)',
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await api.get('/users/me');
        setUser(userResponse.data);

        const referralsResponse = await api.get('/referrals');
        setReferrals(referralsResponse.data);

        const packagesResponse = await api.get('/packages');
        setPackages(packagesResponse.data);
      } catch (err) {
        toast.error('Ошибка загрузки данных');
      }
    };

    fetchData();
  }, []);

  const handleBuyPackage = async () => {
    if (!selectedPackage) return;

    try {
      const response = await api.post('/packages/buy', { packageId: selectedPackage.id });
      toast.success(response.data.message || 'Пакет успешно куплен!');

      const userResponse = await api.get('/users/me');
      setUser(userResponse.data);

      setSelectedPackage(null); // ✅ Закрываем модалку после покупки
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка при покупке пакета');
    }
  };

  const copyToClipboard = () => {
    if (user) {
      navigator.clipboard.writeText(String(user.id));
      toast.success('Код скопирован!');
    }
  };

  function formatNumber(value: number | string): string {
    return Math.floor(Number(value)) // Убираем .00
      .toLocaleString('ru-RU') // Форматируем с пробелами
      .replace(',', ' '); // На всякий случай заменяем запятые на пробелы
  }

  return (
    <div className='referralActive'>

      {user?.package ? (
        <div className='referralActive__inner'>
          <div className="referralActive__info">
            <p><img src={PackageIcon} alt="" />Ваш пакет: {user.package.name}</p>
            <p><img src={LimitIcon} alt="" />Лимит дохода: {formatNumber(user.referralLimit.remaining)} AMD</p>
            <p><img src={EarningIcon} alt="" />Заработано: {formatNumber(user.referralLimit.used)} AMD</p>
            <button onClick={copyToClipboard}>
            <img src={CopyIcon} alt="" /> Код приглашения
            </button>
          </div>
          <div className="referralActive__list">
            <h1>Ваши рефералы</h1>
            {referrals.length > 0 ? (
              <ul>
                {referrals.map((ref) => (
                  <li key={ref.id}>
                    {ref.login} — {ref.package ? ref.package : 'Без пакета'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>У вас пока нет рефералов</p>
            )}
          </div>
        </div>
      ) : (
        <div className='referral__packages'>
          <div className='referral__packages-list'>
            {packages.map((pkg, index) => (
              <button 
                className='referral__package' 
                key={pkg.id} 
                style={{ background: gradients[index % gradients.length] }} 
                onClick={() => setSelectedPackage(pkg)} // ✅ Открываем модалку
              >
                <p className='package__name'>{pkg.name}</p>
                <p className='package__price-label'>Цена</p>
                <p className='package__price'>{formatNumber(pkg.price)} AMD</p>
                <div className="package__info">
                  <div className="package__info-item">
                    <img src={LimitIcon} alt="" />
                    <div>
                      <p>Лимит</p>
                      <span>{formatNumber(pkg.earnings_limit)} AMD</span>
                    </div>
                  </div>
                  <div className="package__info-item">
                    <img src={PackageIcon} alt="" />
                    <div>
                      <p>БОНУС</p>
                      <span>{formatNumber(pkg.referral_bonus)} AMD</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Модальное окно подтверждения покупки */}
      {/* ✅ Модальное окно подтверждения покупки */}
      {selectedPackage && (
        <Modal title="Подтверждение покупки" status="confirm" onClose={() => setSelectedPackage(null)}>
          <div className="modal-info">
            <p>1.В случае приглашения пользователя с другим пакетом вы получаете бонус пакета пользователя которого пригласили 
            Пример: имея лимит 15 000 драм, пользователь может получить бонус от VIP пакета 50 000 драм, после чего лимит дохода обнуляется и придется создавать новый аккаунт</p>
            <p>2.Возможность зарабатывать работает до того момента пока не исчерпается или не превзойдётся( за одну попытку) лимит дохода
      Пример: имея пакет "новичок" пользователь заработал 13 500 драм благодаря 9 пользователям с таким же пакетом. Имея возможность ещё приглашать в игру, пользователь может пригласить другого пользователя который приобретет "VIP" пакет, в этом случае вы получаете бонус 50 000 к своим 13 500. Тем самым общий доход с пакета "новичка" может составить 63 500 драм</p>
            <p>Вы действительно хотите купить пакет <strong>{selectedPackage.name}</strong> за <strong>{formatNumber(selectedPackage.price)} AMD</strong>?</p>
          </div>
          <div className="modal-actions">
            <button className='btn-success' onClick={handleBuyPackage}>Купить</button>
            <button className='btn-danger' onClick={() => setSelectedPackage(null)}>Отмена</button>
          </div>
        </Modal>
      )}


    </div>
  );
}

export default ReferralPage;
