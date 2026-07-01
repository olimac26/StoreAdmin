package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

// GetProducts retrieves all products
func GetProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query(`
		SELECT p.id, p.name, p.barcode, p.category_id, c.name, p.description, 
		       p.price, p.cost, p.stock, p.min_stock, p.created_at, p.updated_at 
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		ORDER BY p.name
	`)
	if err != nil {
		http.Error(w, "Error fetching products", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	products := []Product{}
	for rows.Next() {
		var prod Product
		if err := rows.Scan(&prod.ID, &prod.Name, &prod.Barcode, &prod.CategoryID, &prod.Category,
			&prod.Description, &prod.Price, &prod.Cost, &prod.Stock, &prod.MinStock,
			&prod.CreatedAt, &prod.UpdatedAt); err != nil {
			http.Error(w, "Error scanning product", http.StatusInternalServerError)
			return
		}
		products = append(products, prod)
	}

	response := APIResponse{
		Success: true,
		Data:    products,
	}
	json.NewEncoder(w).Encode(response)
}

// GetProduct retrieves a single product by ID
func GetProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var prod Product
	err = db.QueryRow(`
		SELECT p.id, p.name, p.barcode, p.category_id, c.name, p.description, 
		       p.price, p.cost, p.stock, p.min_stock, p.created_at, p.updated_at 
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.id = $1
	`, id).Scan(&prod.ID, &prod.Name, &prod.Barcode, &prod.CategoryID, &prod.Category,
		&prod.Description, &prod.Price, &prod.Cost, &prod.Stock, &prod.MinStock,
		&prod.CreatedAt, &prod.UpdatedAt)
	if err != nil {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	response := APIResponse{
		Success: true,
		Data:    prod,
	}
	json.NewEncoder(w).Encode(response)
}

// CreateProduct creates a new product
func CreateProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req CreateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var id int
	err := db.QueryRow(
		`INSERT INTO products (name, barcode, category_id, description, price, cost, stock, min_stock) 
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
		 RETURNING id`,
		req.Name, req.Barcode, req.CategoryID, req.Description, req.Price, req.Cost, req.Stock, req.MinStock,
	).Scan(&id)
	if err != nil {
		fmt.Println("Error:", err)
		http.Error(w, "Error creating product", http.StatusInternalServerError)
		return
	}

	response := APIResponse{
		Success: true,
		Message: "Product created successfully",
		Data:    map[string]int{"id": id},
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// UpdateProduct updates an existing product
func UpdateProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var req UpdateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Build dynamic update query
	query := "UPDATE products SET updated_at = CURRENT_TIMESTAMP"
	args := []interface{}{}
	argCount := 1

	if req.Name != nil {
		query += fmt.Sprintf(", name = $%d", argCount)
		args = append(args, *req.Name)
		argCount++
	}
	if req.Barcode != nil {
		query += fmt.Sprintf(", barcode = $%d", argCount)
		args = append(args, *req.Barcode)
		argCount++
	}
	if req.CategoryID != nil {
		query += fmt.Sprintf(", category_id = $%d", argCount)
		args = append(args, *req.CategoryID)
		argCount++
	}
	if req.Description != nil {
		query += fmt.Sprintf(", description = $%d", argCount)
		args = append(args, *req.Description)
		argCount++
	}
	if req.Price != nil {
		query += fmt.Sprintf(", price = $%d", argCount)
		args = append(args, *req.Price)
		argCount++
	}
	if req.Cost != nil {
		query += fmt.Sprintf(", cost = $%d", argCount)
		args = append(args, *req.Cost)
		argCount++
	}
	if req.Stock != nil {
		query += fmt.Sprintf(", stock = $%d", argCount)
		args = append(args, *req.Stock)
		argCount++
	}
	if req.MinStock != nil {
		query += fmt.Sprintf(", min_stock = $%d", argCount)
		args = append(args, *req.MinStock)
		argCount++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argCount)
	args = append(args, id)

	result, err := db.Exec(query, args...)
	if err != nil {
		http.Error(w, "Error updating product", http.StatusInternalServerError)
		return
	}

	rows, err := result.RowsAffected()
	if err != nil || rows == 0 {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	response := APIResponse{
		Success: true,
		Message: "Product updated successfully",
	}
	json.NewEncoder(w).Encode(response)
}

// DeleteProduct deletes a product
func DeleteProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("DELETE FROM products WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Error deleting product", http.StatusInternalServerError)
		return
	}

	rows, err := result.RowsAffected()
	if err != nil || rows == 0 {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	response := APIResponse{
		Success: true,
		Message: "Product deleted successfully",
	}
	json.NewEncoder(w).Encode(response)
}
