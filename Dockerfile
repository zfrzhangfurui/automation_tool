FROM ghcr.io/puppeteer/puppeteer:24.1.1 AS base

USER root

RUN apt-get update -y && apt-get install vim -y && apt-get install iproute2 -y

WORKDIR /home/pptruser/app

COPY . ./

FROM base AS develop

RUN npm install -g @nestjs/cli && npm install

RUN mkdir csv_download && mkdir logger 

RUN chown -R pptruser:pptruser /home/pptruser/app

USER pptruser

CMD ["npm", "start"]

FROM base AS build

RUN npm install -g @nestjs/cli && npm install --omit=dev && npm run build

FROM base AS prod

COPY --from=build /home/pptruser/app/node_modules /home/pptruser/app/node_modules/

COPY package.json ./

COPY .env ./

COPY projection-rule.json ./

COPY --from=build /home/pptruser/app/dist /home/pptruser/app/dist/

RUN mkdir csv_download && mkdir logger 

RUN chown -R pptruser:pptruser /home/pptruser/app

USER pptruser

ENTRYPOINT ["node"]

CMD ["dist/main.js", "--env-file .env"]


