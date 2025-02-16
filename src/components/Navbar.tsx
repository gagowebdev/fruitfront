import { NavLink, useLocation } from 'react-router-dom';
import ProfileFillIcon from '../assets/icons/profile-fill.svg';
import ReferralFillIcon from '../assets/icons/referral-fill.svg';
import WalletFillIcon from '../assets/icons/wallet-fill.svg';
import GameIcon from '../assets/icons/game.svg';

function Navbar() {
  const location = useLocation();

  // Не показываем Navbar на страницах авторизации и регистрации
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <div className="navbar">
      <div className="navbar__container">
        <div className="navbar__inner">
          <NavLink to="/profile" className={({ isActive }) => (isActive ? '_active' : '')}>
            <img src={ProfileFillIcon} alt="" />Профиль
          </NavLink>
          <NavLink to="/referrals" className={({ isActive }) => (isActive ? '_active' : '')}>
            <img src={ReferralFillIcon} alt="" />Рефералы
          </NavLink>
          <NavLink to="/wallet" className={({ isActive }) => (isActive ? '_active' : '')}>
            <img src={WalletFillIcon} alt="" />Кошелек
          </NavLink>
          <NavLink to="/game" className={({ isActive }) => (isActive ? '_active' : '')}>
            <img src={GameIcon} alt="" />Игра
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
