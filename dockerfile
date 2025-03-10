# filepath: /home/lonimokio/Programming/testing/docs/dockerfile
FROM node:18 AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY MainDocs/docusaurus.config.js ./
COPY MainDocs/sidebar.js ./
COPY MainDocs/src ./src
COPY MainDocs/docs ./docs

# Build the Docusaurus site
RUN npm run build -- --config docusaurus.config.js --out-dir docs/build

# Use Nginx to serve the static files
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/docs/build /usr/share/nginx/html
EXPOSE 80
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]