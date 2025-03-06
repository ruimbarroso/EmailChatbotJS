FROM node:18-alpine

# Install gcompat for glibc compatibility
RUN apk add --no-cache gcompat

WORKDIR /app

COPY package.json .
COPY tsconfig.json .

RUN npm install

COPY . .

EXPOSE 3000

# CMD [ "npm", "run", "dev" ]
