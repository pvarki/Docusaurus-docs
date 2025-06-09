FROM node:18 AS builder

WORKDIR /app

# Accept build arguments for TinaCMS
ARG TINA_TOKEN
ARG TINA_PUBLIC_CLIENT_ID

# Set environment variables for build and runtime using the ARGs
ENV TINA_TOKEN=$TINA_TOKEN
ENV TINA_PUBLIC_CLIENT_ID=$TINA_PUBLIC_CLIENT_ID

# Copy package.json and package-lock.json (if exists)
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy configuration and source files
COPY docusaurus.config.js ./
COPY sidebar.js ./
COPY src ./src
COPY docs ./docs
COPY i18n ./i18n
COPY custom.css ./
COPY tina ./tina

# Copy the static folder so that assets are available to Docusaurus
COPY static ./static

# Copy build script so that npm run build:reveal works
COPY reveal.build.cjs ./
COPY build.sh ./

# Build the site
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 3001
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]