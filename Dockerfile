FROM node:14

WORKDIR /app
COPY . .
RUN npm install -g @prisma/cli
RUN npm install
RUN cd client && npm install
RUN cd server && npm install
RUN npm run build
EXPOSE 3000
