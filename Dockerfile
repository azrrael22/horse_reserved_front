# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json .npmrc ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration staging

# Stage 2: Serve with nginx
FROM nginx:1.27-alpine

COPY --from=builder /app/dist/horse-reserved-front/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
