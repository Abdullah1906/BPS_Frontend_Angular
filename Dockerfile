
# 1. BUILD STAGE

FROM node:20-alpine AS build

WORKDIR /app

# Package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Angular production build
RUN npm run build



# 2. NGINX STAGE

FROM nginx:alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular build
COPY --from=build /app/dist/bps-angular/browser /usr/share/nginx/html

# Custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]