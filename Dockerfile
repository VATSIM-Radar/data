FROM node:26
WORKDIR /radar

COPY package.json package.json
COPY yarn.lock yarn.lock
COPY .yarn /radar/.yarn/
COPY .yarnrc.yml .yarnrc.yml

RUN yarn

COPY . /radar
RUN yarn build

EXPOSE 3000
#CMD ["sh", "-c", "export $(grep -v '^#' /radar/.env | xargs) && node /radar/.output/server/index.mjs"]
CMD ["sh", "-c", "node /radar/.output/server/index.mjs"]
