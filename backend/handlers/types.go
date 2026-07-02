package handlers

import (
	"database/sql"
	"time"
)

// Exported DB for handlers to use
var db *sql.DB

// InitDB initializes the database connection for handlers
func InitDB(database *sql.DB) {
	db = database
}

// Models

// Category represents a product category
type Category struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Product represents a product in the store
type Product struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Barcode   *string   `json:"barcode,omitempty"`
	CategoryID int      `json:"category_id"`
	Category  *string   `json:"category,omitempty"`
	Description *string `json:"description,omitempty"`
	Price     float64   `json:"price"`
	Cost      *float64  `json:"cost,omitempty"`
	Stock     int       `json:"stock"`
	MinStock  int       `json:"minStock"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateCategoryRequest is the payload for creating a category
type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description *string `json:"description"`
}

// UpdateCategoryRequest is the payload for updating a category
type UpdateCategoryRequest struct {
	Name        string `json:"name"`
	Description *string `json:"description"`
}

// CreateProductRequest is the payload for creating a product
type CreateProductRequest struct {
	Name        string   `json:"name" binding:"required"`
	Barcode     *string  `json:"barcode"`
	CategoryID  int      `json:"category_id" binding:"required"`
	Description *string  `json:"description"`
	Price       float64  `json:"price" binding:"required"`
	Cost        *float64 `json:"cost"`
	Stock       int      `json:"stock" binding:"required"`
	MinStock    int      `json:"minStock" binding:"required"`
}

// UpdateProductRequest is the payload for updating a product
type UpdateProductRequest struct {
	Name        *string  `json:"name"`
	Barcode     *string  `json:"barcode"`
	CategoryID  *int     `json:"category_id"`
	Description *string  `json:"description"`
	Price       *float64 `json:"price"`
	Cost        *float64 `json:"cost"`
	Stock       *int     `json:"stock"`
	MinStock    *int     `json:"minStock"`
}

// APIResponse is the standard response format
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}
