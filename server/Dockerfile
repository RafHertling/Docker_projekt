# Node-Image (Debian-basiert, stabil)
FROM node:18

# Arbeitsverzeichnis setzen
WORKDIR /app

# Abhängigkeiten installieren
COPY package*.json ./
RUN npm install

# App-Code kopieren
COPY . .

# Port freigeben
EXPOSE 3000

# Start der App
CMD ["node", "index.js"]
