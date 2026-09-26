# Stage 1: Build demo application
FROM node:lts-alpine AS build-stage

WORKDIR /app

# Copy root package (for building the library) and demo package
COPY package*.json ./
COPY demo/package*.json ./demo/

# Install dependencies
RUN npm ci
WORKDIR /app/demo
RUN npm install

# Copy complete source code
WORKDIR /app
COPY . .

# Build library then demo
RUN npm run build
WORKDIR /app/demo
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/demo/dist /usr/share/nginx/html
COPY demo/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
