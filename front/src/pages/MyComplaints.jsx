import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { decodeJwt } from 'jose';

function MyAllComplaints() {
  const [individual, setIndividual] = useState([]);
  const [legal, setLegal] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const decoded = decodeJwt(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [res1, res2] = await Promise.all([
          fetch(`${V_BASE_URL}/complaints/`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${V_BASE_URL}/legal-complaints/`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();

        if (res1.ok) setIndividual(data1);
        if (res2.ok) setLegal(data2);
        if (!res1.ok || !res2.ok) {
          setError(data1.message || data2.message || 'Ошибка загрузки жалоб');
        }
      } catch (e) {
        setError('Ошибка запроса: ' + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-500';
      case 'pending': return 'text-orange-500';
      case 'rejected': return 'text-red-500';
      default: return 'text-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted': return 'Принято';
      case 'pending': return 'В обработке';
      case 'rejected': return 'Отклонено';
      default: return 'Не указан';
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const renderComplaint = (c, type) => (
    <motion.li key={`${type}-${c.id}`} className="border-b border-gray-200 pb-4 last:border-b-0" variants={fadeIn}>
      <p className="text-gray-900 font-semibold text-base sm:text-lg font-inter">
        Дата:{' '}
        {new Date(c.created_at).toLocaleDateString('ru-RU', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })}
      </p>
      <p className={`text-sm sm:text-base font-inter ${getStatusColor(c.status)}`}>
        Статус: {getStatusLabel(c.status)}
      </p>
    </motion.li>
  );

  return (
    <div className="bg-gray-50 min-h-[80vh] flex flex-col items-center py-12 sm:py-16">
      <div className="w-full max-w-4xl mx-auto p-6 sm:p-8">
        <motion.div initial="initial" animate="animate" variants={{ animate: { staggerChildren: 0.2 } }}>
          <motion.h1 className="text-4xl font-bold text-gray-900 mb-8 text-center" variants={fadeIn}>
            Все мои жалобы
          </motion.h1>

          {loading ? (
            <p className="text-gray-600 text-center">Загрузка...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <>
              {individual.length > 0 && (
                <motion.div className="mb-6" variants={fadeIn}>
                  <h2 className="text-xl font-semibold mb-4">Физические лица</h2>
                  <ul className="space-y-4">{individual.map(c => renderComplaint(c, 'ind'))}</ul>
                </motion.div>
              )}

              {legal.length > 0 && (
                <motion.div className="mb-6" variants={fadeIn}>
                  <h2 className="text-xl font-semibold mb-4">Юридические лица</h2>
                  <ul className="space-y-4">{legal.map(c => renderComplaint(c, 'leg'))}</ul>
                </motion.div>
              )}

              {individual.length === 0 && legal.length === 0 && (
                <p className="text-gray-600 text-center">Жалобы отсутствуют.</p>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default MyAllComplaints;
