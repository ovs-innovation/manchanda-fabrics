FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --production

# Copy application files
COPY . .

# Expose backend port
EXPOSE 8092

ENV PORT=8092
ENV NODE_ENV=production

CMD ["node", "api/index.js"]
