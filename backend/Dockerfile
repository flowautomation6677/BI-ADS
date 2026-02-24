FROM node:20-alpine

WORKDIR /app

# Copia dependências primeiro (cache de camadas)
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o restante do código
COPY . .

# Gera o Prisma Client para o target correto
RUN npx prisma generate

EXPOSE 3001

# Roda migration e depois inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
