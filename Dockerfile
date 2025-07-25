FROM node:18-alpine AS production

WORKDIR /app

# Копируем только необходимые файлы из этапа сборки
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist/ ./dist/

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Определяем переменные среды
ENV NODE_ENV=production
ENV PORT=3000

# Открываем порт
EXPOSE ${PORT}

# Запускаем приложение
CMD ["node", "dist/main"]
