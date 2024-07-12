FROM node:lts

RUN npm install -g npm && npm install -g pm2

RUN mkdir /app && mkdir /app/webapp \
    && mkdir /app/logs && chmod 777 /app/logs
    
COPY ./package.json /app/webapp/package.json
COPY ./yarn.lock /app/webapp/yarn.lock

WORKDIR /app/webapp

RUN yarn install
COPY ./ ./

EXPOSE 80

ENV PORT=80
ENV NODE_ENV=production

CMD ["pm2-runtime", "start", "pm2prod.config.js"]