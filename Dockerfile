FROM node:10.15.0

MAINTAINER Maximiliano Escobar

WORKDIR /home/mean
ADD . /home/mean/
RUN yarn global add grunt-cli \
    && yarn install \
    && grunt build

CMD ["node", "server.js"]
