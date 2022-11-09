FROM node:current-slim
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
ENV NODE_ENV production
RUN npm install
COPY . /usr/src/app
EXPOSE 80/tcp
CMD [ "npm", "run", "start" ]
