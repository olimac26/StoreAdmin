package main

import (
	"net/http"
	"storebackend/handlers"
)

// RegisterRoutes registers all API routes
func RegisterRoutes() *http.Handler {
	mux := http.NewServeMux()

	// Category routes
	mux.HandleFunc("GET /api/categories", handlers.GetCategories)
	mux.HandleFunc("GET /api/categories/{id}", handlers.GetCategory)
	mux.HandleFunc("POST /api/categories", handlers.CreateCategory)
	mux.HandleFunc("PUT /api/categories/{id}", handlers.UpdateCategory)
	mux.HandleFunc("DELETE /api/categories/{id}", handlers.DeleteCategory)

	// Product routes
	mux.HandleFunc("GET /api/products", handlers.GetProducts)
	mux.HandleFunc("GET /api/products/{id}", handlers.GetProduct)
	mux.HandleFunc("POST /api/products", handlers.CreateProduct)
	mux.HandleFunc("PUT /api/products/{id}", handlers.UpdateProduct)
	mux.HandleFunc("DELETE /api/products/{id}", handlers.DeleteProduct)

	// Health check
	mux.HandleFunc("GET /api/health", handlers.Health)

	// Wrap with CORS middleware
	var handler http.Handler = mux
	handler = CORSMiddleware(handler)

	return &handler
}

