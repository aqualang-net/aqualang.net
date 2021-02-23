FROM node:15-alpine

ARG NODE_ENV=production

WORKDIR /app
COPY . .
RUN npm install -g prisma
RUN npm install
RUN cd client && npm install
RUN cd server && npm install
RUN npm run build
EXPOSE 3000
