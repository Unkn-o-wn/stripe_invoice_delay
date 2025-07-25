FROM node:18-alpine

WORKDIR /app

# Копируем только необходимые файлы из этапа сборки
COPY package*.json ./
COPY tsconfig*.json ./


RUN npm ci

COPY src/ ./src/
COPY nest-cli.json ./

# Определяем переменные среды
ENV NODE_ENV=production
ENV PORT=3000

# Открываем порт
EXPOSE ${PORT}

RUN npm run build

# Запускаем приложение
CMD ["node", "dist/main"]
