FROM lambci/lambda:build-nodejs8.10
LABEL maintainer="Allandhino pattras <allandhino.pattras@hara.ag>"

# Add package.json before rest of repo for caching
ADD package.json /app/
WORKDIR /app
RUN npm install

ADD . /app

ADD . .

RUN npm install -g serverless@1.28.0
RUN npm link nodemon