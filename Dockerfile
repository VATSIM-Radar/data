FROM node:26-slim
WORKDIR /radar

COPY package.json package.json
COPY yarn.lock yarn.lock
COPY .yarn /radar/.yarn/
COPY .yarnrc.yml .yarnrc.yml

RUN npm i -g yarn
RUN yarn

COPY . /radar
RUN yarn build

EXPOSE 3000
#CMD ["sh", "-c", "export $(grep -v '^#' /radar/.env | xargs) && node /radar/.output/server/index.mjs"]
CMD ["sh", "-c", "node /radar/.output/server/index.mjs"]
