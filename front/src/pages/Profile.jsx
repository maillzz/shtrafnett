import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaEdit } from 'react-icons/fa';

function Profile({ onLogout }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [logoutMessage, setLogoutMessage] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    setError('');

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser && Object.keys(storedUser).length > 0) {
      const updatedUser = {
        ...storedUser,
        lastLogin: storedUser.lastLogin || new Date().toLocaleDateString('ru-RU'),
        phone: storedUser.phone || '+7 (XXX) XXX-XX-XX', // Пример замаскированного номера
      };
      setUser(updatedUser);
      setNewName(updatedUser.fullName || '');
    } else {
      setUser({
        fullName: 'Иванов Иван',
        email: 'ivanov@example.com',
        phone: '+7 (XXX) XXX-XX-XX',
        registrationDate: '01.01.2023',
        lastLogin: new Date().toLocaleDateString('ru-RU'),
      });
      setNewName('Иванов Иван');
    }
    setIsLoading(false);
  }, []);

  const handleSaveName = () => {
    if (newName.trim()) {
      setUser((prevUser) => ({ ...prevUser, fullName: newName }));
      localStorage.setItem('user', JSON.stringify({ ...user, fullName: newName }));
      setIsEditingName(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      setLogoutMessage('Вы успешно вышли из системы');
      setTimeout(() => setLogoutMessage(''), 3000);
    }
    navigate('/login');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center py-12 sm:py-16 bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="w-full max-w-2xl mx-auto p-6 sm:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <motion.h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white bg-blue-900 p-4 rounded-lg text-center mb-6">
            Профиль пользователя
          </motion.h1>
          {isLoading ? (
            <div className="flex justify-center items-center">
              <motion.div
                className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="ml-2 text-gray-600">Данные загружаются...</p>
            </div>
          ) : error ? (
            <p className="text-lg font-inter mb-4 text-center text-red-500" role="alert">{error}</p>
          ) : user ? (
            <AnimatePresence>
              <motion.div
                key="profile-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="p-6 bg-white rounded-xl shadow-lg border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-6 mb-6">
                  <div className="w-full">
                    <div className="space-y-3">
                      {isEditingName ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                            placeholder="Введите имя"
                            aria-label="Введите новое имя"
                          />
                          <motion.button
                            onClick={handleSaveName}
                            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"
                            whileHover={{ scale: 1.05 }}
                            aria-label="Сохранить имя"
                          >
                            Сохранить
                          </motion.button>
                          <motion.button
                            onClick={() => setIsEditingName(false)}
                            className="bg-gray-300 text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-400"
                            whileHover={{ scale: 1.05 }}
                            aria-label="Отменить редактирование"
                          >
                            Отмена
                          </motion.button>
                        </div>
                      ) : (
                        <>
                          <p className="text-lg font-inter text-gray-600 flex items-center">
                            Имя: {user.fullName}{' '}
                            <motion.button
                              onClick={() => setIsEditingName(true)}
                              className="ml-2 text-indigo-600 hover:text-indigo-800"
                              whileHover={{ scale: 1.1 }}
                              aria-label="Редактировать имя"
                            >
                              <FaEdit />
                            </motion.button>
                          </p>
                        </>
                      )}
                      <p className="text-lg font-inter text-gray-600">Телефон: {user.phone}</p>
                      <p className="text-lg font-inter text-gray-600">Дата регистрации: {user.registrationDate}</p>
                      <p className="text-lg font-inter text-gray-600">Последний вход: {user.lastLogin}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Настройки</h3>
                  <p className="text-md text-gray-500">Смена пароля и уведомления будут доступны позже.</p>
                </div>
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Мои жалобы</h3>
                  <p className="text-md text-gray-500">Список ваших поданных жалоб будет отображён здесь.</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                  <motion.button
                    className="flex-1 bg-amber-400 text-gray-900 px-6 py-3 rounded-lg font-semibold flex items-center justify-center hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    onClick={handleLogout}
                    aria-label="Выйти из системы"
                  >
                    <FaSignOutAlt className="mr-2" /> Выйти
                  </motion.button>
                </div>
                {logoutMessage && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-green-500 text-sm mt-4 text-center"
                    role="status"
                  >
                    {logoutMessage}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;