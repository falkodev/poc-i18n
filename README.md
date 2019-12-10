<a id="contents"></a>

# PoC i18n in Apostrophe

1. [Context](#1)<br>
2. [Installation](#3)<br>
   2.1 [First time process](#2-1)<br>
   2.2 [Usual process](#2-2)
3. [Commands](#4)<br>
   3.1 [Main commands](#3-1)<br>
   3.2 [Other commands](#3-2)

<a id="1"></a>

## 1 Context [&#x2B06;](#contents)

The goal of this PoC is to have an Apostrophe project with editable pieces for translation through i18n.

<a id="2"></a>

## 2 Installation [&#x2B06;](#contents)

First, you need to have docker and docker-compose installed and launched on your machine. Then:

- run `git clone`
- run `make build && make users && make`

Alternatively, you can run the project locally with `npm i && npm run dev`.

<a id="2-1"></a>

### 2.1 First time process [&#x2B06;](#contents)

The first time you run `make` (or `docker-compose up`), all Docker images will be downloaded and built.

There is a dependency between the containers `poc-backend` and `poc-db`: the DB needs to be started to enable the server to start (otherwise, Apostrophe does not have a Mongo connection and is stuck).

<a id="2-2"></a>

### 2.2 Usual process [&#x2B06;](#contents)

Run simply `make` to start on development mode. You can also look at the Makefile for other possible commands. The next section explains what commands to run.

<a id="3"></a>

## 3 Commands [&#x2B06;](#contents)

<a id="3-1"></a>

### 3.1 Main commands [&#x2B06;](#contents)

Run `docker-compose up` for production in Docker

- `docker-compose ps` for running instances.
- `make stop`or `docker-compose stop`
- `make build` or `docker-compose build` to rebuild images
- `docker-compose exec container-name sh` to log into a container (i.e: `docker-compose exec poc-backend sh` to log into the server container)


<a id="3-2"></a>

### 4.2 Other commands [&#x2B06;](#contents)

Other commands are available for logs or to run the project in production mode:
- `make kill` will run a `docker-compose kill` to quickly shutdown containers
- `make users` will create an admin user
- `make rebuild` will force to download all images again, starting from scratch before building containers

Save database:
`docker run --rm --link poc-db:mongo --net poc-i18n_default -v $(pwd)/data/db:/backup mongo bash -c 'mongodump --out /backup --host mongo:27017 --db poc-i18n'`

Restore in container:
`docker run --rm --link poc-db:mongo --net poc-i18n-network_default -v $(pwd)/data/db:/backup mongo mongorestore /backup --host mongo:27017`
