import { useState } from 'react';
import api from '../api/axiosInstance';

type ChangePasswordModalProps = {
  onClose: () => void;
};

function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await api.patch('/users/change-password', { oldPassword, newPassword });
      setMessage(response.data.message);
      setTimeout(onClose, 2000); // Закрываем модальное окно через 2 секунды
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка смены пароля');
    }
  };

  return (
    <div className="modal login">
      <div className="modal-content">
        <h1>Смена пароля</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}
        <form className='form' onSubmit={handleChangePassword}>
          <div>
            <label>Старый пароль:</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
          </div>
          <div>
            <label>Новый пароль:</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <button className='button' type="submit" style={{ marginBottom: '0px' }}>Сменить</button>
          <button type="button" onClick={onClose}>Отмена</button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
