# backend/Dockerfile
FROM python:3.12-slim

# Устанавливаем переменные окружения
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости
COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код проекта
COPY backend/ /app/

# Указываем команду для запуска приложения
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "shtrafovnet.wsgi"]