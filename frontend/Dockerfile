FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for client-side embedding
ARG NEXT_PUBLIC_API_BASE_URL=https://api.manchandafabric.in/api
ARG NEXT_PUBLIC_API_SOCKET_URL=https://api.manchandafabric.in
ARG NEXT_PUBLIC_STORE_DOMAIN=https://manchandafabric.in
ARG NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/detqbiabu/image/upload
ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
ARG NEXT_PUBLIC_CLOUDINARY_API_KEY=988826349828863
ARG NEXT_PUBLIC_PHONE_OTP_PROVIDER=firebase

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_SOCKET_URL=$NEXT_PUBLIC_API_SOCKET_URL
ENV NEXT_PUBLIC_STORE_DOMAIN=$NEXT_PUBLIC_STORE_DOMAIN
ENV NEXT_PUBLIC_CLOUDINARY_URL=$NEXT_PUBLIC_CLOUDINARY_URL
ENV NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=$NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
ENV NEXT_PUBLIC_CLOUDINARY_API_KEY=$NEXT_PUBLIC_CLOUDINARY_API_KEY
ENV NEXT_PUBLIC_PHONE_OTP_PROVIDER=$NEXT_PUBLIC_PHONE_OTP_PROVIDER
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/i18n.json ./i18n.json
COPY --from=builder /app/locales ./locales

USER nextjs

EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3000"]
