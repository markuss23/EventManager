FROM node:20-alpine

WORKDIR /frontend

COPY package.json .

RUN npm install

COPY . .

EXPOSE 4173

CMD [ "npm", "run", "dev", "--", "--host"]
