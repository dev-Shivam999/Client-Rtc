
FROM node:20


WORKDIR /usr/app


COPY tsconfig*.json ./
COPY package*.json ./


RUN npm install


COPY . .


RUN npm run build


EXPOSE 4173


CMD ["npm", "run", "preview"]
