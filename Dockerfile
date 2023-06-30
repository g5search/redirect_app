FROM "node:12.22.9-bullseye"

WORKDIR /usr/src/app

ARG NODE_ENV

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080

CMD [ "node", "server.js" ]
