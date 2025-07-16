import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, NavLink } from 'react-router-dom';
import { FaUser, FaPhone, FaCalendarAlt, FaBuilding, FaClock, FaCar, FaCamera, FaCheck, FaArrowLeft, FaArrowRight, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';

function SubmitComplaint() {
  const [formData, setFormData] = useState({
    userType: 'individual',
    step: 1,
    name: '',
    address: '',
    phone: '',
    client_full_name: '',
    resolutionNumber: '',
    resolutionDate: '',
    issuingAuthority: '',
    receivedDate: '',
    violationDate: '',
    violationTime: '',
    violationAddress: '',
    carModel: '',
    carPlate: '',
    detectionMethod: '',
    photo: null,
    agreement: false,
    terms: false,
    contractNumber: '',
    companyName: '',
    inn: '',
    violationDescription: '',
    receivedDetails: '',
    finePhoto: null,
    controllerName: '',
    parkingNumber: '',
    serialNumber: '',
    certificateNumber: '',
    fineAmount: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const finePhotoInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, []);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    if (name === 'phone' && value) {
      // Расширенная проверка для номера телефона, допускающая +, () и пробелы
      const phoneRegex = /^(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4,5}$/;
      newErrors.phone = phoneRegex.test(value) ? '' : 'Введите корректный номер телефона (например, +7(999)123-45-67)';
    }
    if (name === 'carPlate' && value) {
      const plateRegex = /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/;
      newErrors.carPlate = plateRegex.test(value) ? '' : 'Введите корректный госномер (например, А123ВС77)';
    }
    if (name === 'inn' && value) {
      const innRegex = /^\d{10}$|^\d{12}$/;
      newErrors.inn = innRegex.test(value) ? '' : 'ИНН должен содержать 10 или 12 цифр';
    }
    if ((name === 'photo' || name === 'finePhoto') && value) {
      if (value.size > 5 * 1024 * 1024) {
        newErrors[name] = 'Файл слишком большой. Максимальный размер — 5 МБ.';
      } else {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        newErrors[name] = allowedTypes.includes(value.type) ? '' : 'Недопустимый формат файла. Используйте JPEG, PNG или PDF.';
      }
    }
    // Обновленная валидация для полей юридического лица
    if (['name', 'address', 'resolutionNumber', 'resolutionDate', 'issuingAuthority', 'receivedDate', 'violationDate', 'violationTime', 'violationAddress', 'carModel', 'detectionMethod', 'contractNumber', 'inn', 'violationDescription', 'receivedDetails', 'controllerName', 'parkingNumber', 'serialNumber', 'certificateNumber', 'fineAmount'].includes(name) && !value) {
      newErrors[name] = 'Это поле обязательно';
    }
    // Добавляем 'companyName' и 'phone' (для юр. лиц) в список обязательных, если они пустые
    if ((name === 'companyName' || (name === 'phone' && formData.userType === 'legal')) && !value) {
      newErrors[name] = 'Это поле обязательно';
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const validateIndividualStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = 'Это поле обязательно';
      if (!formData.address) newErrors.address = 'Это поле обязательно';
      if (!formData.phone) newErrors.phone = 'Это поле обязательно';
      else validateField('phone', formData.phone);
      if (!formData.resolutionNumber) newErrors.resolutionNumber = 'Это поле обязательно';
      if (!formData.resolutionDate) newErrors.resolutionDate = 'Это поле обязательно';
    }
    if (step === 2) {
      if (!formData.issuingAuthority) newErrors.issuingAuthority = 'Это поле обязательно';
      if (!formData.receivedDate) newErrors.receivedDate = 'Это поле обязательно';
      if (!formData.violationDate) newErrors.violationDate = 'Это поле обязательно';
      if (!formData.violationTime) newErrors.violationTime = 'Это поле обязательно';
      if (!formData.violationAddress) newErrors.violationAddress = 'Это поле обязательно';
    }
    if (step === 3) {
      if (!formData.carModel) newErrors.carModel = 'Это поле обязательно';
      if (!formData.carPlate) newErrors.carPlate = 'Это поле обязательно';
      else validateField('carPlate', formData.carPlate);
      if (!formData.detectionMethod) newErrors.detectionMethod = 'Это поле обязательно';
      if (!formData.controllerName) newErrors.controllerName = 'Это поле обязательно';
      if (!formData.parkingNumber) newErrors.parkingNumber = 'Это поле обязательно';
      if (!formData.serialNumber) newErrors.serialNumber = 'Это поле обязательно';
      if (!formData.certificateNumber) newErrors.certificateNumber = 'Это поле обязательно';
      if (!formData.fineAmount) newErrors.fineAmount = 'Это поле обязательно';
    }
    if (step === 4) {
      if (!formData.photo) newErrors.photo = 'Это поле обязательно';
      else validateField('photo', formData.photo);
    }
    if (step === 5) {
      if (!formData.agreement) newErrors.agreement = 'Необходимо согласиться';
      if (!formData.terms) newErrors.terms = 'Необходимо согласиться';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLegalForm = () => {
    const newErrors = {};
    if (!formData.companyName) newErrors.companyName = 'Это поле обязательно';
    if (!formData.phone) newErrors.phone = 'Это поле обязательно'; // Добавлено поле телефона для юр. лиц
    else validateField('phone', formData.phone); // Валидация телефона для юр. лиц
    if (!formData.finePhoto) newErrors.finePhoto = 'Это поле обязательно'; // 'Фото постановления' будет соответствовать 'finePhoto'
    else validateField('finePhoto', formData.finePhoto);
    if (!formData.agreement) newErrors.agreement = 'Необходимо согласиться';
    if (!formData.terms) newErrors.terms = 'Необходимо согласиться';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    validateField(name, type === 'checkbox' ? checked : value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    validateField('photo', file);
  };

  const handleFinePhotoChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, finePhoto: file });
    validateField('finePhoto', file);
  };

  const handleUserTypeChange = (type) => {
    setFormData({
      userType: type,
      step: 1,
      name: '',
      address: '',
      phone: '', // Сбрасываем phone при смене типа пользователя
      resolutionNumber: '',
      resolutionDate: '',
      issuingAuthority: '',
      receivedDate: '',
      violationDate: '',
      violationTime: '',
      violationAddress: '',
      carModel: '',
      carPlate: '',
      detectionMethod: '',
      photo: null,
      agreement: false,
      terms: false,
      contractNumber: '',
      companyName: '',
      inn: '',
      violationDescription: '',
      receivedDetails: '',
      finePhoto: null,
      controllerName: '',
      parkingNumber: '',
      serialNumber: '',
      certificateNumber: '',
      fineAmount: '',
    });
    setErrors({});
    setSuccess('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (finePhotoInputRef.current) finePhotoInputRef.current.value = '';
  };

  const handleNextStep = () => {
    if (validateIndividualStep(formData.step)) {
      setFormData({ ...formData, step: formData.step + 1 });
    }
  };

  const handlePreviousStep = () => {
    setFormData({ ...formData, step: formData.step - 1 });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setIsSubmitting(true);

    if (formData.userType === 'individual' && !validateIndividualStep(formData.step)) {
      setIsSubmitting(false);
      return;
    }
    if (formData.userType === 'legal' && !validateLegalForm()) {
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();

    formData.client_full_name = formData.name;

    // Сопоставление camelCase → snake_case
    const camelToSnakeMap = {
      client_full_name: 'client_full_name',
      name: 'userName',
      address: 'userAddress',
      phone: 'userPhone', // Здесь 'phone' для юр. лиц будет userPhone на бэкенде
      resolutionNumber: 'resolution_number',
      resolutionDate: 'resolution_date',
      issuingAuthority: 'issuing_authority',
      receivedDate: 'received_date',
      violationDate: 'violation_date',
      violationTime: 'violation_time',
      violationAddress: 'violation_address',
      carModel: 'car_model',
      carPlate: 'car_plate',
      detectionMethod: 'detection_method',
      controllerName: 'controller_name',
      parkingNumber: 'parking_number',
      serialNumber: 'serial_number',
      certificateNumber: 'certificate_number',
      fineAmount: 'fine_amount',
      contractNumber: 'contract_number',
      companyName: 'company_name',
      inn: 'inn',
      violationDescription: 'violation_description',
      receivedDetails: 'received_details',
      photo: 'photo',
      finePhoto: 'fine_photo'
    };

    for (const key in formData) {
      
      if (formData.userType === 'legal' && !['companyName', 'phone', 'finePhoto', 'userType', 'agreement', 'terms'].includes(key)) {
        continue;
      }
      if (key !== 'step') {
        const value = formData[key];
        const formKey = camelToSnakeMap[key] || key;
        if ((key === 'photo' || key === 'finePhoto') && value instanceof File) {
          data.append(formKey, value);
        } else if (value !== null && value !== undefined) {
          data.append(formKey, value);
        }
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setIsSubmitting(false);
      navigate('/login');
      return;
    }

    try {
      const endpoint =
        formData.userType === 'legal'
          ? 'http://localhost:8000/api/submit-legal-complaint/'
          : 'http://localhost:8000/api/submit-complaint/';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message || 'Форма успешно отправлена!');
        const pdfUrl = result.pdf_url;
        if (pdfUrl) {
          const link = document.createElement('a');
          link.href = `http://localhost:8000${pdfUrl}`;
          link.download = `complaint_${Date.now()}.pdf`;
          link.click();
        }
        navigate('/');
        // Сброс формы
        setFormData({
          userType: formData.userType,
          step: 1,
          name: '',
          address: '',
          client_full_name: '',
          phone: '', // Сброс телефона
          resolutionNumber: '',
          resolutionDate: '',
          issuingAuthority: '',
          receivedDate: '',
          violationDate: '',
          violationTime: '',
          violationAddress: '',
          carModel: '',
          carPlate: '',
          detectionMethod: '',
          photo: null,
          agreement: false,
          terms: false,
          contractNumber: '',
          companyName: '',
          inn: '',
          violationDescription: '',
          receivedDetails: '',
          finePhoto: null,
          controllerName: '',
          parkingNumber: '',
          serialNumber: '',
          certificateNumber: '',
          fineAmount: '',
        });

        if (fileInputRef.current) fileInputRef.current.value = '';
        if (finePhotoInputRef.current) finePhotoInputRef.current.value = '';

      } else {
        setErrors({ general: result.message || 'Ошибка при отправке.' });
      }
    } catch (err) {
      setErrors({ general: 'Ошибка при отправке: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' },
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="bg-gray-50 min-h-[80vh] flex flex-col items-center justify-center py-12 sm:py-16">
      <div className="w-full max-w-2xl mx-auto p-6 sm:p-8">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 text-center font-manrope"
          initial="initial"
          animate="animate"
          variants={fadeInVariants}
        >
          Подать жалобу на штраф
        </motion.h1>

        <motion.div
          className="bg-white p-6 sm:p-8 rounded-lg shadow-sm"
          initial="initial"
          animate="animate"
          variants={fadeInVariants}
        >
          {errors.general && (
            <motion.p
              className="text-red-500 text-sm sm:text-base font-inter mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {errors.general}
            </motion.p>
          )}
          {success && (
            <motion.p
              className="text-green-500 text-sm sm:text-base font-inter mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {success}
            </motion.p>
          )}

          {!localStorage.getItem('token') && (
            <div className="text-center mb-6">
              <p className="text-gray-600 text-lg font-inter mb-4">Зарегистрируйтесь или войдите, чтобы подать жалобу</p>
              <div className="flex justify-center gap-4">
                <NavLink
                  to="/login"
                  className="inline-flex items-center justify-center border border-gray-900 text-gray-900 px-3 py-2 rounded-lg font-semibold hover:bg-gray-100"
                  aria-label="Войти в аккаунт"
                >
                  <FaSignInAlt className="mr-1" /> Войти
                </NavLink>
                <NavLink
                  to="/register"
                  className="inline-flex items-center justify-center bg-amber-400 text-gray-900 px-3 py-2 rounded-lg font-semibold hover:bg-amber-500"
                  aria-label="Перейти к регистрации"
                >
                  <FaUserPlus className="mr-1" /> Регистрация
                </NavLink>
              </div>
            </div>
          )}
          {localStorage.getItem('token') && (
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center border border-gray-900 text-gray-900 px-3 py-2 rounded-lg font-semibold hover:bg-gray-100"
                aria-label="Выйти из аккаунта"
              >
                <FaSignOutAlt className="mr-1" /> Выйти
              </button>
            </div>
          )}

          {localStorage.getItem('token') && (
            <>
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                  <motion.button
                    onClick={() => handleUserTypeChange('individual')}
                    className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm sm:text-base font-inter transition duration-300 cursor-pointer ${formData.userType === 'individual' ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-900 hover:bg-indigo-100'
                      }`}
                    whileHover="hover"
                    variants={buttonVariants}
                    aria-label="Физическое лицо"
                  >
                    <FaUser className="mr-2" /> Физическое лицо
                  </motion.button>
                  <motion.button
                    onClick={() => handleUserTypeChange('legal')}
                    className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm sm:text-base font-inter transition duration-300 cursor-pointer ${formData.userType === 'legal' ? 'bg-amber-400 text-gray-900' : 'bg-transparent text-gray-900 hover:bg-amber-100'
                      }`}
                    whileHover="hover"
                    variants={buttonVariants}
                    aria-label="Юридическое лицо"
                  >
                    <FaBuilding className="mr-2" /> Юридическое лицо
                  </motion.button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {formData.userType === 'individual' && (
                  <>
                    <progress value={formData.step} max={5} className="w-full mb-4 h-2 rounded-lg"></progress>
                    {formData.step === 1 && <p className="text-lg sm:text-xl text-gray-600 mb-6 text-center font-inter">Введите данные.<br />Давай начнем!</p>}
                    {formData.step === 2 && <p className="text-lg sm:text-xl text-gray-600 mb-6 text-center font-inter">Введите данные.<br />Осталось немного!</p>}
                    {formData.step === 3 && <p className="text-lg sm:text-xl text-gray-600 mb-6 text-center font-inter">Введите данные.<br />Вы почти у цели!</p>}
                    {formData.step === 4 && <p className="text-lg sm:text-xl text-gray-600 mb-6 text-center font-inter">Загрузите фото.<br />Последний шаг перед отправкой!</p>}
                    {formData.step === 5 && <p className="text-lg sm:text-xl text-gray-600 mb-6 text-center font-inter">Подтвердите согласие.<br />Готово к отправке!</p>}

                    {formData.step === 1 && (
                      <>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">ФИО</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            autoComplete="name"
                            placeholder="Иванов Иван Иванович"
                            aria-label="Введите ваше ФИО"
                          />
                          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Адрес для корреспонденции</label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            autoComplete="address"
                            placeholder="г. Москва, ул. Ленина, д. 10, кв. 5"
                            aria-label="Введите адрес для корреспонденции"
                          />
                          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Телефон</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            autoComplete="off"
                            placeholder="+7(999)123-45-67"
                            aria-label="Введите ваш номер телефона"
                          />
                          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Номер постановления</label>
                          <input
                            type="text"
                            name="resolutionNumber"
                            value={formData.resolutionNumber}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            placeholder="Укажите номер постановления"
                            aria-label="Введите номер постановления"
                          />
                          {errors.resolutionNumber && <p className="text-red-500 text-sm mt-1">{errors.resolutionNumber}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Дата постановления</label>
                          <input
                            type="date"
                            name="resolutionDate"
                            value={formData.resolutionDate}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            aria-label="Введите дату постановления"
                          />
                          {errors.resolutionDate && <p className="text-red-500 text-sm mt-1">{errors.resolutionDate}</p>}
                        </div>
                      </>
                    )}

                    {formData.step === 2 && (
                      <>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Орган и должностное лицо</label>
                          <input
                            type="text"
                            name="issuingAuthority"
                            value={formData.issuingAuthority}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            placeholder="Например, ГИБДД, Иванов И.И."
                            aria-label="Укажите орган и должностное лицо"
                          />
                          {errors.issuingAuthority && <p className="text-red-500 text-sm mt-1">{errors.issuingAuthority}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Дата получения постановления</label>
                          <input
                            type="date"
                            name="receivedDate"
                            value={formData.receivedDate}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            aria-label="Введите дату получения постановления"
                          />
                          {errors.receivedDate && <p className="text-red-500 text-sm mt-1">{errors.receivedDate}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Дата правонарушения</label>
                          <input
                            type="date"
                            name="violationDate"
                            value={formData.violationDate}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            aria-label="Введите дату правонарушения"
                          />
                          {errors.violationDate && <p className="text-red-500 text-sm mt-1">{errors.violationDate}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Время правонарушения</label>
                          <input
                            type="time"
                            name="violationTime"
                            value={formData.violationTime}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            aria-label="Введите время правонарушения"
                          />
                          {errors.violationTime && <p className="text-red-500 text-sm mt-1">{errors.violationTime}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Адрес места правонарушения</label>
                          <input
                            type="text"
                            name="violationAddress"
                            value={formData.violationAddress}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            placeholder="г. Москва, ул. Тверская, д. 1"
                            aria-label="Введите адрес места правонарушения"
                          />
                          {errors.violationAddress && <p className="text-red-500 text-sm mt-1">{errors.violationAddress}</p>}
                        </div>
                      </>
                    )}

                    {formData.step === 3 && (
                      <>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Марка автомобиля</label>
                          <input
                            type="text"
                            name="carModel"
                            value={formData.carModel}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            placeholder="Toyota Camry"
                            aria-label="Введите марку автомобиля"
                          />
                          {errors.carModel && <p className="text-red-500 text-sm mt-1">{errors.carModel}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Госномер</label>
                          <input
                            type="text"
                            name="carPlate"
                            value={formData.carPlate}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            placeholder="А123ВС77"
                            aria-label="Введите госномер"
                          />
                          {errors.carPlate && <p className="text-red-500 text-sm mt-1">{errors.carPlate}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Способ фиксации</label>
                          <input
                            type="text"
                            name="detectionMethod"
                            value={formData.detectionMethod}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            placeholder="Камера, радар и т.д."
                            aria-label="Укажите способ фиксации правонарушения"
                          />
                          {errors.detectionMethod && <p className="text-red-500 text-sm mt-1">{errors.detectionMethod}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">ФИО контролера</label>
                          <input
                            type="text"
                            name="controllerName"
                            value={formData.controllerName}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            placeholder="Петров П.П."
                            aria-label="Введите ФИО контролера"
                          />
                          {errors.controllerName && <p className="text-red-500 text-sm mt-1">{errors.controllerName}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Номер парковки</label>
                          <input
                            type="text"
                            name="parkingNumber"
                            value={formData.parkingNumber}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            placeholder="Парковка №1"
                            aria-label="Введите номер парковки"
                          />
                          {errors.parkingNumber && <p className="text-red-500 text-sm mt-1">{errors.parkingNumber}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Серийный номер АПК</label>
                          <input
                            type="text"
                            name="serialNumber"
                            value={formData.serialNumber}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            placeholder="SN123456"
                            aria-label="Введите серийный номер АПК"
                          />
                          {errors.serialNumber && <p className="text-red-500 text-sm mt-1">{errors.serialNumber}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Номер свидетельства о поверке</label>
                          <input
                            type="text"
                            name="certificateNumber"
                            value={formData.certificateNumber}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            placeholder="СВ123456"
                            aria-label="Введите номер свидетельства о поверке"
                          />
                          {errors.certificateNumber && <p className="text-red-500 text-sm mt-1">{errors.certificateNumber}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-900 font-semibold mb-1 font-inter">Сумма штрафа</label>
                          <input
                            type="number"
                            name="fineAmount"
                            value={formData.fineAmount}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                            required
                            placeholder="5000"
                            aria-label="Введите сумму штрафа"
                          />
                          {errors.fineAmount && <p className="text-red-500 text-sm mt-1">{errors.fineAmount}</p>}
                        </div>
                      </>
                    )}

                    {formData.step === 4 && (
                      <div>
                        <label className="block text-gray-900 font-semibold mb-1 font-inter">Фото постановления</label>
                        <motion.label
                          className="flex items-center justify-center w-full p-2 sm:p-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-600 transition duration-300"
                          htmlFor="photo-upload"
                          whileHover="hover"
                          variants={buttonVariants}
                        >
                          <FaCamera className="text-indigo-600 mr-2" />
                          <span className="text-gray-600 text-sm sm:text-base font-inter">
                            {formData.photo ? formData.photo.name : 'Выберите файл (JPEG, PNG, PDF)'}
                          </span>
                          <input
                            id="photo-upload"
                            type="file"
                            name="photo"
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/jpeg,image/png,application/pdf"
                            ref={fileInputRef}
                            aria-label="Загрузите фото постановления (JPEG, PNG, PDF)"
                          />
                        </motion.label>
                        {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
                      </div>
                    )}

                    {formData.step === 5 && (
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="agreement"
                            checked={formData.agreement}
                            onChange={handleInputChange}
                            className="mr-2"
                            required
                            aria-label="Согласен на обработку персональных данных"
                          />
                          <label className="text-gray-600 text-sm sm:text-base font-inter">
                            Согласен на обработку персональных данных
                          </label>
                        </div>
                        {errors.agreement && <p className="text-red-500 text-sm mt-1">{errors.agreement}</p>}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="terms"
                            checked={formData.terms}
                            onChange={handleInputChange}
                            className="mr-2"
                            required
                            aria-label="Согласен с пользовательским соглашением"
                          />
                          <label className="text-gray-600 text-sm sm:text-base font-inter">
                            Согласен с{' '}
                            <a href="/terms" className="text-indigo-600 hover:underline">пользовательским соглашением</a>
                          </label>
                        </div>
                        {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
                      </div>
                    )}
                  </>
                )}

                {formData.userType === 'legal' && (
                  <>
                    <p className="text-lg sm:text-xl text-gray-600 mb-6 font-inter">
                      Форма заполняется подключёнными организациями. Если вы ещё не наш клиент – заполните{' '}
                      <a href="/feedback-form" className="text-indigo-600 hover:underline">форму обратной связи</a>.
                    </p>
                    <div>
                      <label className="block text-gray-900 font-semibold mb-1 font-inter">Наименование организации</label>
                      <input
                        type="text"
                        name="companyName" // Используем companyName для наименования организации
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                        required
                        placeholder="ООО Ромашка"
                        aria-label="Введите наименование организации"
                      />
                      {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-900 font-semibold mb-1 font-inter">Контактные данные (номер телефона)</label>
                      <input
                        type="tel"
                        name="phone" // Используем phone для контактных данных
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-inter"
                        required
                        autoComplete="off"
                        placeholder="+7(XXX) XXX-XX-XX"
                        aria-label="Введите контактный номер телефона"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-900 font-semibold mb-1 font-inter">Фото постановления</label>
                      <motion.label
                        className="flex items-center justify-center w-full p-2 sm:p-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-600 transition duration-300"
                        htmlFor="fine-photo-upload" // Используем finePhoto для фото постановления
                        whileHover="hover"
                        variants={buttonVariants}
                      >
                        <FaCamera className="text-indigo-600 mr-2" />
                        <span className="text-gray-600 text-sm sm:text-base font-inter">
                          {formData.finePhoto ? formData.finePhoto.name : 'Выберите файл (JPEG, PNG, PDF)'}
                        </span>
                        <input
                          id="fine-photo-upload"
                          type="file"
                          name="finePhoto"
                          onChange={handleFinePhotoChange}
                          className="hidden"
                          accept="image/jpeg,image/png,application/pdf"
                          ref={finePhotoInputRef}
                          aria-label="Загрузите фото постановления (JPEG, PNG, PDF)"
                        />
                      </motion.label>
                      {errors.finePhoto && <p className="text-red-500 text-sm mt-1">{errors.finePhoto}</p>}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="agreement"
                          checked={formData.agreement}
                          onChange={handleInputChange}
                          className="mr-2"
                          required
                          aria-label="Согласен на обработку персональных данных"
                        />
                        <label className="text-gray-600 text-sm sm:text-base font-inter">
                          Согласен на обработку персональных данных
                        </label>
                      </div>
                      {errors.agreement && <p className="text-red-500 text-sm mt-1">{errors.agreement}</p>}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="terms"
                          checked={formData.terms}
                          onChange={handleInputChange}
                          className="mr-2"
                          required
                          aria-label="Согласен с пользовательским соглашением"
                        />
                        <label className="text-gray-600 text-sm sm:text-base font-inter">
                          Согласен с{' '}
                          <a href="/terms" className="text-indigo-600 hover:underline">пользовательским соглашением</a>
                        </label>
                      </div>
                      {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
                    </div>
                  </>
                )}

                <div className="flex space-x-4">
                  {formData.userType === 'individual' && formData.step > 1 && formData.step < 5 && (
                    <motion.button
                      type="button"
                      onClick={handlePreviousStep}
                      whileHover="hover"
                      variants={buttonVariants}
                      className="w-full bg-gray-300 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition duration-300 hover:bg-gray-400 cursor-pointer"
                      aria-label="Вернуться на предыдущий шаг"
                    >
                      <FaArrowLeft className="inline mr-2" />
                      Назад
                    </motion.button>
                  )}
                  {formData.userType === 'individual' && formData.step < 5 && (
                    <motion.button
                      type="button"
                      onClick={handleNextStep}
                      whileHover="hover"
                      variants={buttonVariants}
                      className="w-full bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition duration-300 hover:bg-indigo-700 cursor-pointer"
                      aria-label="Перейти к следующему шагу"
                    >
                      Далее
                      <FaArrowRight className="inline ml-2" />
                    </motion.button>
                  )}
                  {(formData.userType === 'legal' || (formData.userType === 'individual' && formData.step === 5)) && (
                    <motion.button
                      type="submit"
                      whileHover="hover"
                      variants={buttonVariants}
                      className={`w-full bg-amber-400 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition duration-300 ${isSubmitting || (formData.userType === 'individual' && (!formData.agreement || !formData.terms)) || (formData.userType === 'legal' && (!formData.agreement || !formData.terms)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-500 cursor-pointer'
                        }`}
                      disabled={isSubmitting || (formData.userType === 'individual' && (!formData.agreement || !formData.terms)) || (formData.userType === 'legal' && (!formData.agreement || !formData.terms))}
                      aria-label="Отправить жалобу или форму"
                    >
                      {isSubmitting ? 'Отправка...' : formData.userType === 'individual' ? 'Отправить жалобу' : 'Отправить форму'}
                    </motion.button>
                  )}
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default SubmitComplaint;