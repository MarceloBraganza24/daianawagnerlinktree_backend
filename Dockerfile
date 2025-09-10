# Imagen base oficial de Node
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto (Cloud Run usará el puerto 8081)
ENV PORT=5000
EXPOSE 5000

# Copiar y renombrar el .env.production si es necesario
# O puedes cargarlo desde la configuración de variables de entorno de Cloud Run

# Comando de inicio
CMD ["npm", "start"]