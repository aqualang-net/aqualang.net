FROM node:15-alpine

WORKDIR /app
COPY . .
RUN npm install -g prisma
RUN npm install
RUN cd client && npm install
RUN cd server && npm install
RUN npm run build
EXPOSE 3000
