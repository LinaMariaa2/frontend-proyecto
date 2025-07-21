# Crea una imagen a partir de node con acronimo builder 

FROM node:18 AS builder
WORKDIR /app 
COPY package*.json ./
RUN npm install
COPY . .
# Compila la app para producción.
RUN npm run build 

# Etapa 2: Producción
FROM node:18

WORKDIR /app
# Copia todo el contenido generado en la etapa de builder hacia esta nueva imagen, mucho mas liviano
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]

# CORREGIR LOS ERRORES ESLINT SI NO NO DESPLEGARA EN PRODUCCION!!

