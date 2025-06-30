import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '', // Только одно поле пароля
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    console.log('Отправляемые данные:', formData); // Для отладки

    try {
      const response = await axios.post('http://127.0.0.1:8000/accounts/register/', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        setSuccess(response.data.message);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', formData.email);
        setTimeout(() => navigate(response.data.redirect || '/Home'), 2000)
      } else {
        setError(response.data.message || 'Ошибка регистрации');
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.response?.data?.errors?.[Object.keys(error.response?.data?.errors || {})[0]]?.[0] ||
        'Ошибка сервера'
      );
    }
  };

  const fadeInVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.02, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    hover: { scale: 1.05, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' },
  };

  return (
    <div className="bg-gray-50 min-h-[80vh] flex flex-col items-center justify-center py-12 sm:py-16">
      <div className="w-full max-w-md mx-auto p-6 sm:p-8">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 text-center font-manrope"
          initial="initial"
          animate="animate"
          variants={fadeInVariants}
        >
          Регистрация
        </motion.h1>

        <motion.div
          className="bg-white p-6 sm:p-8 rounded-lg shadow-sm"
          initial="initial"
          animate="animate"
          variants={fadeInVariants}
        >
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-gray-900 font-semibold mb-1 font-inter">Имя пользователя</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                required
              />
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-1 font-inter">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                required
              />
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-1 font-inter">Телефон</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
              />
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-1 font-inter">Пароль</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm sm:text-base font-inter">{error}</p>}
            {success && <p className="text-green-500 text-sm sm:text-base font-inter">{success}</p>}

            <motion.button
              type="submit"
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              className="w-full bg-amber-400 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-amber-500 transition duration-300 font-inter"
            >
              Зарегистрироваться
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;