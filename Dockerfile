##########################################################################
# First Stage buider                                                     #
# for dev, please run: docker build --target=builder -t backend-dev:v1 . # 
##########################################################################
FROM node:lts as builder

ENV DEBIAN_FRONTEND noninteractive

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

ENV NODE_ENV=development
RUN npm i --location=global npm@latest \
  && npm config set unsafe-perm true \
  && npm install

COPY . .

ENTRYPOINT ["/bin/sh"]
CMD ["-c", "echo Container started\ntrap \"exit 0\" 15\n\nexec \"$@\"\nwhile sleep 1 & wait $!; do :; done","-"]

##########################################################################
# Second Stage: For production                                           #
##########################################################################
FROM node:lts-slim

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y
RUN apt-get install -y tzdata

ENV TZ=America/Sao_Paulo

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime
RUN echo $TZ > /etc/timezone

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

ENV NODE_ENV=production
RUN npm i --location=global npm@latest
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/build ./build
COPY .env.sample .env

CMD [ "node", "build/index.js" ]
