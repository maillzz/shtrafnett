# front/Dockerfile

# Шаг 1: Используем официальный образ Node.js для сборки
FROM node:18-alpine as builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь остальной код фронтенда
COPY . .

# Собираем приложение в статические файлы
RUN npm run build