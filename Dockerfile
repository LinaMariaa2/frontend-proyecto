# Etapa 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Instala dependencias necesarias para compilar
RUN apk add --no-cache python3 make g++

# Copia dependencias e instala
COPY package*.json ./
RUN npm install --include=dev

# Copia todo el código fuente
COPY . .

# Construye la app para producción con npx (usa el binario local)
RUN npx next build --no-lint

# Etapa 2: Producción
FROM node:18-alpine
WORKDIR /app

# Copiamos solo lo necesario desde builder
COPY --from=builder /app/package*.json ./ 
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./  # soporta js o ts

# Exponemos el puerto que Railway asigna
EXPOSE 3000

# Comando de inicio usando variable $PORT de Railway
CMD ["sh", "-c", "npm start"]
