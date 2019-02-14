FROM node:8.11.3

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

EXPOSE 3031
CMD [ "yarn", "start" ]