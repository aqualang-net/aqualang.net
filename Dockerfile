FROM node:15-alpine

ARG NODE_ENV=development

WORKDIR /app
COPY . .
RUN npm install -g prisma
RUN npm install
RUN cd client && npm install
RUN cd server && npm install
EXPOSE 3000
