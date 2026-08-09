FROM node:20-alpine
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --production

# Copy source
COPY . .

RUN npm run build

EXPOSE 5000
CMD [ "node", "dist/index.js" ]
