FROM node:16.16.0

ENV TZ=Asia/Ho_Chi_Minh

WORKDIR /app

COPY . .
RUN cp .env.production .env
RUN yarn global add @nestjs/cli
RUN yarn install
RUN yarn build

EXPOSE 3000

ENV REDIS_HOST=redis_cache
ENV REDIS_PORT=6379

CMD ["yarn", "start:prod" ]