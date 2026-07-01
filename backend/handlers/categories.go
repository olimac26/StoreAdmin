package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
)

// GetCategories retrieves all categories
func GetCategories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query("SELECT id, name, description, created_at, updated_at FROM categories ORDER BY name")
	if err != nil {
		http.Error(w, "Error fetching categories", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	categories := []Category{}
	for rows.Next() {
		var cat Category
		if err := rows.Scan(&cat.ID, &cat.Name, &cat.Description, &cat.CreatedAt, &cat.UpdatedAt); err != nil {
			http.Error(w, "Error scanning category", http.StatusInternalServerError)
			return
		}
		categories = append(categories, cat)
	}

	response := APIResponse{
		Success: true,
		Data:    categories,
	}
	json.NewEncoder(w).Encode(response)
}

// GetCategory retrieves a single category by ID
func GetCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var cat Category
	err = db.QueryRow("SELECT id, name, description, created_at, updated_at FROM categories WHERE id = $1", id).
		Scan(&cat.ID, &cat.Name, &cat.Description, &cat.CreatedAt, &cat.UpdatedAt)
	if err != nil {
		http.Error(w, "Category not found", http.StatusNotFound)
		return
	}

	response := APIResponse{
		Success: true,
		Data:    cat,
	}
	json.NewEncoder(w).Encode(response)
}

// CreateCategory creates a new category
func CreateCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req CreateCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var id int
	err := db.QueryRow(
		"INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id",
		req.Name, req.Description,
	).Scan(&id)
	if err != nil {
		http.Error(w, "Error creating category", http.StatusInternalServerError)
		return
	}

	response := APIResponse{
		Success: true,
		Message: "Category created successfully",
		Data:    map[string]int{"id": id},
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// UpdateCategory updates an existing category
func UpdateCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var req UpdateCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	result, err := db.Exec(
		"UPDATE categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
		req.Name, req.Description, id,
	)
	if err != nil {
		http.Error(w, "Error updating category", http.StatusInternalServerError)
		return
	}

	rows, err := result.RowsAffected()
	if err != nil || rows == 0 {
		http.Error(w, "Category not found", http.StatusNotFound)
		return
	}

	response := APIResponse{
		Success: true,
		Message: "Category updated successfully",
	}
	json.NewEncoder(w).Encode(response)
}

// DeleteCategory deletes a category
func DeleteCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("DELETE FROM categories WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Error deleting category", http.StatusInternalServerError)
		return
	}

	rows, err := result.RowsAffected()
	if err != nil || rows == 0 {
		http.Error(w, "Category not found", http.StatusNotFound)
		return
	}

	response := APIResponse{
		Success: true,
		Message: "Category deleted successfully",
	}
	json.NewEncoder(w).Encode(response)
}
