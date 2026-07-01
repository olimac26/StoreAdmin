package main

import (
	"net/http"
	"storebackend/handlers"
)

// RegisterRoutes registers all API routes
func RegisterRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	// CORS middleware wrapper
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	// Category routes
	mux.HandleFunc("GET /api/categories", corsMiddleware(http.HandlerFunc(handlers.GetCategories)).ServeHTTP)
	mux.HandleFunc("GET /api/categories/{id}", corsMiddleware(http.HandlerFunc(handlers.GetCategory)).ServeHTTP)
	mux.HandleFunc("POST /api/categories", corsMiddleware(http.HandlerFunc(handlers.CreateCategory)).ServeHTTP)
	mux.HandleFunc("PUT /api/categories/{id}", corsMiddleware(http.HandlerFunc(handlers.UpdateCategory)).ServeHTTP)
	mux.HandleFunc("DELETE /api/categories/{id}", corsMiddleware(http.HandlerFunc(handlers.DeleteCategory)).ServeHTTP)

	// Product routes
	mux.HandleFunc("GET /api/products", corsMiddleware(http.HandlerFunc(handlers.GetProducts)).ServeHTTP)
	mux.HandleFunc("GET /api/products/{id}", corsMiddleware(http.HandlerFunc(handlers.GetProduct)).ServeHTTP)
	mux.HandleFunc("POST /api/products", corsMiddleware(http.HandlerFunc(handlers.CreateProduct)).ServeHTTP)
	mux.HandleFunc("PUT /api/products/{id}", corsMiddleware(http.HandlerFunc(handlers.UpdateProduct)).ServeHTTP)
	mux.HandleFunc("DELETE /api/products/{id}", corsMiddleware(http.HandlerFunc(handlers.DeleteProduct)).ServeHTTP)

	// Health check
	mux.HandleFunc("GET /api/health", corsMiddleware(http.HandlerFunc(handlers.Health)).ServeHTTP)

	return mux
}

