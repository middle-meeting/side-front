FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --legacy-peer-deps --ignore-scripts

COPY . .

RUN npm run compile && npm run build

EXPOSE 3000

CMD ["npx", "next", "start"]
