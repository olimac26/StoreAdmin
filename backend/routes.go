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

	// Sales routes
	mux.HandleFunc("GET /api/sales", handlers.GetSales)
	mux.HandleFunc("GET /api/sales/{id}", handlers.GetSale)
	mux.HandleFunc("POST /api/sales", handlers.CreateSale)
	mux.HandleFunc("PUT /api/sales/{id}", handlers.UpdateSale)
	mux.HandleFunc("POST /api/sales/{id}/cancel", handlers.CancelSale)
	mux.HandleFunc("POST /api/sales/{id}/return", handlers.ReturnSale)
	mux.HandleFunc("DELETE /api/sales/{id}", handlers.DeleteSale)

	// Client routes
	// Clients
	mux.HandleFunc("GET    /api/clients",                 handlers.GetClients)
	mux.HandleFunc("POST   /api/clients",                 handlers.CreateClient)
	mux.HandleFunc("GET    /api/clients/{id}",            handlers.GetClient)
	mux.HandleFunc("PUT    /api/clients/{id}",            handlers.UpdateClient)
	mux.HandleFunc("DELETE /api/clients/{id}",            handlers.DeleteClient)
	mux.HandleFunc("GET    /api/clients/{id}/history",    handlers.GetClientHistory)
	mux.HandleFunc("POST   /api/clients/{id}/history",    handlers.AddCreditEntry)

	// Health check
	mux.HandleFunc("GET /api/health", handlers.Health)

	// Wrap with CORS middleware
	var handler http.Handler = mux
	handler = CORSMiddleware(handler)

	return &handler
}
