FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Build arguments for Vite bundling
ARG VITE_APP_API_BASE_URL=https://api.manchandafabric.in/api
ARG VITE_APP_API_SOCKET_URL=https://api.manchandafabric.in
ARG VITE_APP_CLOUD_NAME=detqbiabu
ARG VITE_APP_CLOUDINARY_API_KEY=988826349828863
ARG VITE_APP_CLOUDINARY_UPLOAD_PRESET=ml_default
ARG VITE_APP_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/detqbiabu/image/upload
ARG VITE_APP_ENCRYPT_PASSWORD=your_32_byte_hex_key

ENV VITE_APP_API_BASE_URL=$VITE_APP_API_BASE_URL
ENV VITE_APP_API_SOCKET_URL=$VITE_APP_API_SOCKET_URL
ENV VITE_APP_CLOUD_NAME=$VITE_APP_CLOUD_NAME
ENV VITE_APP_CLOUDINARY_API_KEY=$VITE_APP_CLOUDINARY_API_KEY
ENV VITE_APP_CLOUDINARY_UPLOAD_PRESET=$VITE_APP_CLOUDINARY_UPLOAD_PRESET
ENV VITE_APP_CLOUDINARY_URL=$VITE_APP_CLOUDINARY_URL
ENV VITE_APP_ENCRYPT_PASSWORD=$VITE_APP_ENCRYPT_PASSWORD

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
