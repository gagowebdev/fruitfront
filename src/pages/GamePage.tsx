import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import ProgressBar from '../components/ProgressBar';
import 'react-toastify/dist/ReactToastify.css';
import GameCoinIcon from '../assets/icons/gamecoin.svg';

type StoreItem = {
  id: number;
  name: string;
  type: string;
  price: number;
  multiplier: number | null;
  bonus: number | null;
  duration: number | null;
};

// 🔥 Фиксированный список скинов (с изображениями)
const skins = [
  { id: 1, url: '/skins/skin1.png' },
  { id: 2, url: '/skins/skin2.png' },
  { id: 3, url: '/skins/skin3.png' },
  { id: 4, url: '/skins/skin5.png' },
  { id: 5, url: '/skins/skin6.png' },
  { id: 6, url: '/skins/skin8.png' },
  // { id: 7, url: '/skins/skin8.png' },
];

function GamePage() {
  const [gameBalance, setGameBalance] = useState(0);
  const [level, setLevel] = useState(1);
  const [clicks, setClicks] = useState(0);
  const [skinId, setSkinId] = useState(1);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; value: number }[]>([]);


  // Определяем URL скина по skinId
  const skinUrl = skins.find(skin => skin.id === skinId)?.url || '/skins/skin1.png';

  // Формулы расчёта кликов для уровней
  const clicksForLevel = (lvl: number) => Math.floor(100 * Math.pow(1.3, lvl - 1));
  const prevClicksToNextLevel = level > 1 ? clicksForLevel(level - 1) : 0;
  const clicksToNextLevel = clicksForLevel(level);

  // ✅ Новый расчет прогресса
  const progress = Math.min(((clicks - prevClicksToNextLevel) / (clicksToNextLevel - prevClicksToNextLevel)) * 100, 100);


  useEffect(() => {
    if (!socketRef.current) {
      // socketRef.current = io('https://fruitqwest.onrender.com', {
      socketRef.current = io('http://localhost:3000', {
        auth: { userId: localStorage.getItem('userId') },
      });

      socketRef.current.on('game_balance_update', (data: { gameBalance: number; clickValue: number }) => {
        setGameBalance(data.gameBalance);
      
        // 🔥 Анимация всплывающего числа с реальным `clickValue`
        const newNumber = { id: Date.now(), value: data.clickValue };
        setFloatingNumbers(prev => [...prev, newNumber]);
      
        // Удаляем число через 500ms
        setTimeout(() => {
          setFloatingNumbers(prev => prev.filter(num => num.id !== newNumber.id));
        }, 500);
      });
      
      socketRef.current.on('level_up', (data: { level: number; gameBalance: number; bonus: number }) => {
        setLevel(data.level);
        setGameBalance(data.gameBalance);
        toast.success(`🎉 Новый уровень: ${data.level} 🏆\n💰 Бонус: +${data.bonus}`, { autoClose: 3000 });
      });
      socketRef.current.on('error', (error) => console.error('❌ WebSocket Ошибка:', error));
    }

    const fetchData = async () => {
      try {
        const response = await api.get('/users/me');
        setGameBalance(response.data.gameBalance);
        setUserId(response.data.id);
        setLevel(response.data.level);
        setClicks(response.data.clicks);
        setSkinId(response.data.skinId);

        const storeResponse = await api.get('/store/items');
        setStoreItems(storeResponse.data);

        socketRef.current?.emit('subscribe', { userId: response.data.id });
      } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
      }
    };

    fetchData();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);


  const handleClick = () => {
    if (userId) {
      socketRef.current?.emit('click', { userId });
      setClicks(prevClicks => prevClicks + 1);
    }
  };
  
  
  
  

  const handleBuyItem = async (item: StoreItem) => {
    if (gameBalance < item.price) {
      toast.error('❌ Недостаточно средств!');
      return;
    }

    try {
      const response = await api.post('/store/buy', { itemId: item.id });
      toast.success(`🎉 Покупка успешна: ${response.data.message}`);

      if (item.type === 'SKIN') {
        setSkinId(item.id);
      }

      setGameBalance(prev => prev - item.price);
    } catch (error: any) {
      toast.error(`❌ Ошибка при покупке: ${error.response?.data?.message || 'Неизвестная ошибка'}`);
    }
  };

  // Фильтруем товары по категориям
  const allSkins = storeItems.filter(item => item.type === 'SKIN'); // Получаем все скины
  const currentSkinIndex = allSkins.findIndex(item => item.id === skinId); // Ищем индекс текущего скина
  const nextSkin = allSkins[currentSkinIndex + 1] || null; // Следующий скин (если есть)
  
  
  const skinsCategory = allSkins.filter(item => item.id === skinId || (nextSkin && item.id === nextSkin.id));


  // const skinsCategory = storeItems.filter(item => item.type === 'SKIN' && (item.id === skinId || item.id === skinId + 1));
  const multipliersCategory = storeItems.filter(item => item.type === 'MULTIPLIER');
  const referralBoostsCategory = storeItems.filter(item => item.type === 'REFERRAL_LIMIT_BOOST');

  function formatNumber(value: number | string): string {
    return (Number(value)) // Убираем .00
      .toLocaleString('ru-RU') // Форматируем с пробелами
      .replace(',', '.'); // На всякий случай заменяем запятые на пробелы
  }
  
  return (
    <div className="game-container">
      <div className="balance-container">
        <h1><img src={GameCoinIcon} alt="" /> {formatNumber(gameBalance)}</h1>

        {/* 🔥 Всплывающие числа */}
        {floatingNumbers.map(num => (
          <div key={num.id} className="floating-number">{`+${num.value}`}</div>
        ))}
      </div>


      <div className="level-info">
        <div>
          <p>{formatNumber(clicks)} / {formatNumber(clicksToNextLevel)}</p>
          <p>Уровень {level}</p>
        </div>
        <ProgressBar progress={progress} />
      </div>

      <div className="clicker">
        <img src={skinUrl} alt="Игровой скин" onClick={handleClick} />
      </div>

      {/* Магазин */}
      <div className="shop">
        {/* Категория: Скины */}
        {/* Категория: Скины */}
<div className="shop-category skins">
  <h3>Скины</h3>
  <div className="shop-items">
    {skinsCategory.map(item => {
      const skin = skins.find(s => s.id === item.id);
      return (
        <button key={item.id} className={`shop-item ${item.id === skinId ? 'owned' : 'next'}`} onClick={() => handleBuyItem(item)} disabled={item.id === skinId}>
          <img src={skin?.url} alt={item.name} className="shop-skin-img" />
          <p>X{item.multiplier}</p>
          {!(item.type === 'SKIN' && item.id === skinId) && (
            <div className='price'><img src={GameCoinIcon} alt="" />{formatNumber(item.price)}</div>
          )}
        </button>
      );
    })}
  </div>
</div>

{/* Категория: Бустеры */}
<div className="shop-category multipliers">
  <h3>Бустеры</h3>
  <div className="shop-items">
    {multipliersCategory.map(item => (
      <button key={item.id} className="shop-item" onClick={() => handleBuyItem(item)}>
        <p className='multiplier'>X{item.multiplier}</p>
        <p className='name'>{item.name}</p>
        <p className='price'><img src={GameCoinIcon} alt="" />{formatNumber(item.price)}</p>
      </button>
    ))}
  </div>
</div>

{/* Категория: Реферальные бонусы */}
<div className="shop-category referral-boosts">
  <h3>Реферальные бонусы</h3>
  <div className="shop-items">
    {referralBoostsCategory.map(item => (
      <button key={item.id} className="shop-item" onClick={() => handleBuyItem(item)}>
        <p className='percent'>{item.bonus}%</p>
        <p className='percent-label'>К реферальному лимиту</p>
        <p className='price'><img src={GameCoinIcon} alt="" />{formatNumber(item.price)}</p>
      </button>
    ))}
  </div>
</div>


      </div>
    </div>
  );
}

export default GamePage;
