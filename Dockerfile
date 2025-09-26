FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . ./

ENV PORT=3012

RUN npm run build

EXPOSE 3012
CMD ["node", "build/index.js"]