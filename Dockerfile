FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Variables d'environnement par défaut (à surcharger en production)
ENV NODE_ENV=production
ENV OAUTH_ISSUER=https://auth.paiecashplay.com
ENV OAUTH_REDIRECT_URI=https://fundation.paiecashplay.com/api/auth/callback

# Build de l'application
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]