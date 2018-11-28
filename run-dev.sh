# bin bash

#generate documentation
#serverless openapi -o openapi$(date +%Y%m%d%H%M%S).yml  generate

# start docker machine first
docker-machine start

# build docker image with tag hara:dynamodb_local will be used on docker-compose
docker build -t hara:scan .

# now run local env 
docker-compose up