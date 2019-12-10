start: dev

stop:
	docker-compose stop

kill:
	docker-compose kill

build:
	NODE_ENV=development docker-compose build

rebuild:
	NODE_ENV=development docker-compose build --no-cache && make users

dev:
	make kill && NODE_ENV=development docker-compose up -d && make logs

prod:
	NODE_ENV=production docker-compose up -d --build && make logs

users:
	docker-compose up -d && docker-compose exec poc-backend node app fixtures:users && make stop

logs:
	docker logs poc-backend -f
