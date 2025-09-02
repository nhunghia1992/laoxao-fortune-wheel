FROM node:22.17.0 as builder

# set working directory
WORKDIR /app

# build app
COPY . .
RUN npm install
RUN npm run build
# copy build to nginx
FROM nginx:1.25.3
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist ./