# Etapa 1: Builder
FROM node:18 AS builder
WORKDIR /app

# Copia package.json y package-lock.json para instalar dependencias
COPY package*.json ./
RUN npm install

# Copia todo el código fuente
COPY . .

# Construye la app para producción
RUN npm run build

# Etapa 2: Producción
FROM node:18-alpine
WORKDIR /app

# Copiamos solo lo necesario del builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Exponemos el puerto que Railway asigna
EXPOSE 3000

# Comando de inicio usando variable PORT de Railway
ENV PORT 3000
CMD ["sh", "-c", "next start -p $PORT"]
