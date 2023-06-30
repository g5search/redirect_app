# bin/bash

GREEN='\033[0;32m';
NC='\033[0m';

IMAGE_NAME="redirect_app";
NODE_ENV="development";
TAG="latest";

HandleError ()
{
  set -e;
  echo "Error: An error occurred in script at line: $1.";
  exit 1;
}

Init ()
{
  while getopts c:e:t: flag
  do
    case "${flag}" in
      c) CONTEXT=${OPTARG};;
      e) NODE_ENV=${OPTARG};;
      t) TAG=${OPTARG};;
    esac
  done
}

Build ()
{
  trap 'HandleError $LINENO' ERR;
  Init;
  printf "Building ${GREEN}$IMAGE_NAME ${NC}NODE_ENV=$NODE_ENV \n";
  docker build -t $IMAGE_NAME:$TAG --build-arg NODE_ENV=$NODE_ENV .;
}

Run ()
{
  Build;
  printf "Running ${GREEN}$IMAGE_NAME:$TAG ${NC}NODE_ENV=$NODE_ENV \n";
  DOCKER_ID=$(docker run -d --name $IMAGE_NAME -p 8085:8080 -p 880:80 -p 8443:443 $IMAGE_NAME:$TAG);
}

Run;
