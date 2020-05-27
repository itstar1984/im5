# Idees Manager

## Requirements
  - Docker 18+
  - Docker Compose 1.22+

## First Run
1. Run `docker-compose build`
2. Run `docker-compose up`
3. There should now be 2 servers running:
  - [http://localhost:3000](http://localhost:3000) is the app
  - [http://localhost:42333](http://localhost:27017-) is the Mongo DB.

## Usefull Docker Commands
 * List all containers
`docker ps`
 * List all containers (only IDs)
`docker ps -aq`
 * Stop all running containers
`docker stop $(docker ps -aq)`
 * Remove all containers
`docker rm $(docker ps -aq)`
 * Remove all images
`docker rmi $(docker images -aq)`
 * Remove an image
`docker images -a` and `docker rmi <image id>`
 * Log into Docker container
`docker exec -it <container id> /bin/bash`

## Using `docker-compose run` to issue one-off commands
If you want to run a one-off command, like installing dependencies, you can use the `docker-compose run <service_name> <cmd>`.

For example, to install a Javascript dependency and save that information to `package.json` we could run:
`docker-compose run --rm frontend npm install --save axios`

If you want to be on a shell for one of the Docker services, you can do something like:
`docker-compose run --rm frontend bash`
