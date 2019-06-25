FROM node:lts-alpine

# copy static files
WORKDIR /usr/app

RUN apk --no-cache add curl

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install

COPY . .
RUN yarn build

RUN chmod +x docker-run-tests.sh

ENTRYPOINT ["/usr/app/docker-run-tests.sh"]