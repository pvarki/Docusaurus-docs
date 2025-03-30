# filepath: /home/lonimokio/Programming/testing/docs/dockerfile
FROM node:18 AS builder

WORKDIR /app

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

# Copy Marp slides and build script so that npm run build:marp works
COPY slides ./slides
COPY marp.build.js ./

# Build the site (this runs "npm run build", which first runs build:marp)
RUN npm run build -- --config docusaurus.config.js --out-dir build

# Use Nginx to serve the static files
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
