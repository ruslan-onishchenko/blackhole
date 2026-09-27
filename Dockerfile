# --- Stage 1: сборка сайта ---
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Angie ---
FROM docker.angie.software/angie:1.12.2-minimal
COPY docker/angie.conf /etc/angie/angie.conf.template
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
COPY --from=builder /app/dist /usr/share/angie/html
ENV DOMAIN=localhost
EXPOSE 80 443
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["angie", "-g", "daemon off;"]
