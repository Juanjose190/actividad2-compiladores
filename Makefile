.PHONY: dev test lint build clean install

dev:
	docker-compose up

dev-build:
	docker-compose up --build

test:
	cd cal/backend && npm test -- --passWithNoTests
	cd cal/backend && npm run test:e2e
	cd cal/frontend && npm test

lint:
	cd cal/backend && npm run lint
	cd cal/frontend && npm run lint

build:
	docker-compose build

install:
	cd cal/backend && npm ci
	cd cal/frontend && npm ci

clean:
	docker-compose down -v
	rm -rf cal/backend/dist cal/backend/node_modules cal/backend/coverage
	rm -rf cal/frontend/dist cal/frontend/node_modules
