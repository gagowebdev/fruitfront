import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ReferralPage from './pages/ReferralPage';
import GamePage from './pages/GamePage';
import WalletPage from './pages/WalletPage';

function App() {
  return (
    <main className="page">
      <div className="page__container">
        <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/referrals" element={<ReferralPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/wallet" element={<WalletPage />} />
        </Routes>
      </div>
    </main>
  );
}

export default App;
