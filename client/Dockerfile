# Stage 1: Build the Vite app
FROM node:18-alpine AS builder
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config:
#  - Serves the React SPA for all non-API routes
#  - Proxies /api/* to the backend server container
RUN printf 'server {\n\
 listen 80;\n\
 root /usr/share/nginx/html;\n\
 index index.html;\n\
 \n\
 # Forward API calls to the Express backend\n\
 location /api {\n\
 proxy_pass http://server:5001;\n\
 proxy_http_version 1.1;\n\
 proxy_set_header Host $host;\n\
 proxy_set_header X-Real-IP $remote_addr;\n\
 }\n\
 \n\
 # Serve React app for everything else (client-side routing)\n\
 location / {\n\
 try_files $uri $uri/ /index.html;\n\
 }\n\
 }\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

