FROM node:20-alpine AS builder

WORKDIR /app/frontend

# Build-time arguments coming from Jenkins
ARG APP_VERSION="v1.0.0"
ARG BUILD_NUMBER="0"
ARG DEPLOY_TIME="unknown"
ARG ENVIRONMENT="Kubernetes"

# Step 1: Copy only package files first (better layer caching)
COPY frontend/package.json frontend/package-lock.json* ./

# Step 2: Install ALL dependencies (vite lives in devDependencies)
RUN npm install

# Step 3: Copy source AFTER install (node_modules will NOT be overwritten)
COPY frontend/ ./

# Step 4: Create build-info.json that the React app will fetch at runtime
RUN mkdir -p public && \
    printf '{\n  "appVersion": "%s",\n  "buildNumber": "%s",\n  "deployTime": "%s",\n  "environment": "%s"\n}\n' \
    "$APP_VERSION" "$BUILD_NUMBER" "$DEPLOY_TIME" "$ENVIRONMENT" > public/build-info.json

# Step 5: Build production bundle
RUN npm run build

# --- Runtime image ---
FROM nginx:stable-alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]