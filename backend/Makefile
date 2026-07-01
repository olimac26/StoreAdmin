.PHONY: help db-up db-down migrate migrate-down migrate-reset server install-deps

help:
	@echo "Available commands:"
	@echo "  make install-deps     - Install Go dependencies"
	@echo "  make db-up            - Start PostgreSQL with Docker"
	@echo "  make db-down          - Stop PostgreSQL"
	@echo "  make migrate          - Run pending migrations"
	@echo "  make migrate-down     - Rollback last migration"
	@echo "  make migrate-reset    - Reset database (drop all tables)"
	@echo "  make server           - Start the server"

install-deps:
	go mod tidy
	go get github.com/lib/pq
	go get -u github.com/golang-migrate/migrate/v4/cmd/migrate

db-up:
	docker-compose up -d postgres
	@echo "Waiting for database to be ready..."
	@sleep 2
	@echo "Database is ready on localhost:5432"

db-down:
	docker-compose down

migrate:
	go run . migrate

migrate-down:
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/storedb?sslmode=disable" down 1

migrate-reset:
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/storedb?sslmode=disable" down

server:
	go run . server

.env:
	cp .env.example .env
