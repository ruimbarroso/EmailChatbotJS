FROM node:18-alpine

RUN apk add --no-cache gcompat

WORKDIR /app

COPY package.json .
COPY tsconfig.json .

RUN npm install

COPY . .

EXPOSE 3000
