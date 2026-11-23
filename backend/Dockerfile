FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps --production

# Copy application files
COPY . .

# Expose backend port
EXPOSE 8092

ENV PORT=8092
ENV NODE_ENV=production

CMD ["node", "api/index.js"]
