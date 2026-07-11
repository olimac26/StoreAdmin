package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"storebackend/handlers"
)

func main() {
  // Define commands
  migrateCmd := flag.NewFlagSet("migrate", flag.ExitOnError)
  serverCmd := flag.NewFlagSet("server", flag.ExitOnError)
  resetCmd := flag.NewFlagSet("reset", flag.ExitOnError)

  if len(os.Args) < 2 {
    fmt.Println("Usage:")
    fmt.Println("  go run . migrate   - Run database migrations")
    fmt.Println("  go run . reset     - Reset database (drop all tables)") 
    fmt.Println("  go run . server    - Start the server")
    os.Exit(1)
  }

  switch os.Args[1] {
  case "migrate":
    migrateCmd.Parse(os.Args[2:])
    if err := RunMigrations(); err != nil {
      log.Fatalf("Migration failed: %v", err)
    }

  case "reset":
    resetCmd.Parse(os.Args[2:])
    if err := InitDB(); err != nil {
      log.Fatalf("Failed to initialize database for reset: %v", err)
    }
    defer CloseDB()

    fmt.Println("Starting database reset...")
    if err := ResetMigrations(); err != nil {
      log.Fatalf("Reset failed: %v", err)
    }

  case "server":
    serverCmd.Parse(os.Args[2:])
    if err := InitDB(); err != nil {
      log.Fatalf("Failed to initialize database: %v", err)
    }
    defer CloseDB()

    // Initialize handlers with database connection
    handlers.InitDB(DB)

    // Register routes (already wrapped with CORS)
    mux := RegisterRoutes()

    // Start server
    port := ":8080"
    fmt.Printf("Server started on http://localhost:8080\n")

    if err := http.ListenAndServe(port, *mux); err != nil {
      log.Fatalf("Server error: %v", err)
    }

  default:
    fmt.Printf("Unknown command: %s\n", os.Args[1])
    os.Exit(1)
  }
}