FROM node:18-alpine AS builder

WORKDIR /app


COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate



FROM node:18-alpine

WORKDIR /app


COPY --from=builder /app/node_modules ./node_modules


COPY --from=builder /app/package*.json ./

COPY --from=builder /app .

EXPOSE 8000

CMD ["npm", "start"]