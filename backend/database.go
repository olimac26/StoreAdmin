package main

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
)

// Database holds the connection to the database
var DB *sql.DB

// InitDB initializes the database connection
func InitDB() error {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Default connection string for development
		dbURL = "postgres://postgres:postgres@localhost:5432/storedb?sslmode=disable"
	}

	var err error
	DB, err = sql.Open("postgres", dbURL)
	if err != nil {
		return fmt.Errorf("error opening database: %w", err)
	}

	if err := DB.Ping(); err != nil {
		return fmt.Errorf("error connecting to database: %w", err)
	}

	fmt.Println("Database connected successfully")
	return nil
}

// RunMigrations runs all pending migrations
func RunMigrations() error {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/storedb?sslmode=disable"
	}

	m, err := migrate.New(
		"file://migrations",
		dbURL,
	)
	if err != nil {
		return fmt.Errorf("error creating migration instance: %w", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("error running migrations: %w", err)
	}

	version, dirty, err := m.Version()
	if err != nil && err != migrate.ErrNilVersion {
		return fmt.Errorf("error getting migration version: %w", err)
	}

	fmt.Printf("Migrations completed. Version: %d, Dirty: %v\n", version, dirty)
	return nil
}

// CloseDB closes the database connection
func CloseDB() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
