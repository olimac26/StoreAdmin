package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// Sale represents a completed or cancelled sale.
type Sale struct {
	ID            string     `json:"id"`
	Customer      string     `json:"customer"`
	Status        string     `json:"status"`
	Total         float64    `json:"total"`
	PaymentMethod string     `json:"paymentMethod"`
	Notes         string     `json:"notes"`
	IsVoided      bool       `json:"isVoided"`
	VoidedAt      *time.Time `json:"voidedAt,omitempty"`
	VoidReason    *string    `json:"voidReason,omitempty"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
	Items         []SaleItem `json:"items"`
}

// SaleItem represents a product line within a sale.
type SaleItem struct {
	ProductID   int     `json:"productId"`
	ProductName string  `json:"productName"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
}

type createSaleRequest struct {
	Customer      string              `json:"customer"`
	Status        string              `json:"status"`
	PaymentMethod string              `json:"paymentMethod"`
	Notes         string              `json:"notes"`
	Items         []createSaleItemReq `json:"items"`
}

type createSaleItemReq struct {
	ProductID int     `json:"productId"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
}

type updateSaleRequest struct {
	Customer      *string              `json:"customer"`
	Status        *string              `json:"status"`
	PaymentMethod *string              `json:"paymentMethod"`
	Notes         *string              `json:"notes"`
	Items         *[]createSaleItemReq `json:"items"`
}

type cancelSaleRequest struct {
	Reason string `json:"reason"`
}

type returnSaleRequest struct {
	Items  []returnSaleItemReq `json:"items"`
	Reason string              `json:"reason"`
}

type returnSaleItemReq struct {
	ProductID int `json:"productId"`
	Quantity  int `json:"quantity"`
}

// GetSales returns all sales ordered from newest to oldest.
func GetSales(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query(`
		SELECT id, customer, status, total, payment_method, notes, is_voided, voided_at, void_reason, created_at, updated_at
		FROM orders
		ORDER BY created_at DESC
	`)
	if err != nil {
		http.Error(w, "Error fetching sales", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	sales := []Sale{}
	for rows.Next() {
		var sale Sale
		var voidedAt sql.NullTime
		var voidReason sql.NullString
		if err := rows.Scan(&sale.ID, &sale.Customer, &sale.Status, &sale.Total, &sale.PaymentMethod,
			&sale.Notes, &sale.IsVoided, &voidedAt, &voidReason, &sale.CreatedAt, &sale.UpdatedAt); err != nil {
			http.Error(w, "Error scanning sale", http.StatusInternalServerError)
			return
		}
		if voidedAt.Valid {
			sale.VoidedAt = &voidedAt.Time
		}
		if voidReason.Valid {
			sale.VoidReason = &voidReason.String
		}
		items, err := loadSaleItems(sale.ID)
		if err != nil {
			http.Error(w, "Error loading sale items", http.StatusInternalServerError)
			return
		}
		sale.Items = items
		sales = append(sales, sale)
	}

	response := APIResponse{Success: true, Data: sales}
	json.NewEncoder(w).Encode(response)
}

// GetSale returns a single sale by ID.
func GetSale(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id := r.PathValue("id")
	if strings.TrimSpace(id) == "" {
		http.Error(w, "Invalid sale ID", http.StatusBadRequest)
		return
	}

	sale, err := loadSale(id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Sale not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error loading sale", http.StatusInternalServerError)
		return
	}

	response := APIResponse{Success: true, Data: sale}
	json.NewEncoder(w).Encode(response)
}

// CreateSale creates a new sale and decrements stock.
func CreateSale(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req createSaleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if len(req.Items) == 0 {
		http.Error(w, "At least one item is required", http.StatusBadRequest)
		return
	}

	status := normalizeSaleStatus(req.Status)
	paymentMethod := strings.TrimSpace(req.PaymentMethod)
	if paymentMethod == "" {
		paymentMethod = "efectivo"
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, "Error starting transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	total := 0.0
	var orderID string
	for _, item := range req.Items {
		if item.Quantity <= 0 || item.ProductID <= 0 {
			http.Error(w, "Each item requires a valid product and quantity", http.StatusBadRequest)
			return
		}

		var productPrice float64
		var stock int
		var productName string
		err := tx.QueryRow("SELECT price, stock, name FROM products WHERE id = $1 AND deleted_at IS NULL", item.ProductID).Scan(&productPrice, &stock, &productName)
		if err != nil {
      if err == sql.ErrNoRows {
        http.Error(w, fmt.Sprintf("El producto con ID %d está descontinuado o no existe", item.ProductID), http.StatusNotFound)
        return
      }
      http.Error(w, "Error loading product", http.StatusInternalServerError)
      return
    }
		if stock < item.Quantity {
			http.Error(w, "Insufficient stock for one or more products", http.StatusConflict)
			return
		}

		unitPrice := productPrice
		if item.Price > 0 {
			unitPrice = item.Price
		}
		total += unitPrice * float64(item.Quantity)

		_, err = tx.Exec("UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", item.Quantity, item.ProductID)
		if err != nil {
			http.Error(w, "Error updating stock", http.StatusInternalServerError)
			return
		}
		_ = productName
	}

	err = tx.QueryRow(`
		INSERT INTO orders (customer, status, total, payment_method, notes)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, strings.TrimSpace(req.Customer), status, total, paymentMethod, req.Notes).Scan(&orderID)
	if err != nil {
		http.Error(w, "Error creating sale", http.StatusInternalServerError)
		return
	}

	for _, item := range req.Items {
		unitPrice := item.Price
		if unitPrice <= 0 {
			var productPrice float64
			err = tx.QueryRow("SELECT price FROM products WHERE id = $1 AND deleted_at IS NULL", item.ProductID).Scan(&productPrice)
			if err != nil {
				http.Error(w, "Error fetching product price", http.StatusInternalServerError)
				return
			}
			unitPrice = productPrice
		}
		_, err = tx.Exec(`
			INSERT INTO order_items (order_id, product_id, quantity, price)
			VALUES ($1, $2, $3, $4)
		`, orderID, item.ProductID, item.Quantity, unitPrice)
		if err != nil {
			http.Error(w, "Error creating sale items", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Error committing sale", http.StatusInternalServerError)
		return
	}

	sale, err := loadSale(orderID)
	if err != nil {
		http.Error(w, "Error loading created sale", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	response := APIResponse{Success: true, Message: "Sale created successfully", Data: sale}
	json.NewEncoder(w).Encode(response)
}

// UpdateSale updates an existing sale without deleting it.
func UpdateSale(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id := r.PathValue("id")
	if strings.TrimSpace(id) == "" {
		http.Error(w, "Invalid sale ID", http.StatusBadRequest)
		return
	}

	var req updateSaleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	existingSale, err := loadSale(id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Sale not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error loading sale", http.StatusInternalServerError)
		return
	}
	if existingSale.IsVoided {
		http.Error(w, "Cannot edit a voided sale", http.StatusConflict)
		return
	}

	customer := existingSale.Customer
	status := normalizeSaleStatus(existingSale.Status)
	paymentMethod := existingSale.PaymentMethod
	notes := existingSale.Notes
	items := existingSale.Items
	if req.Customer != nil {
		customer = strings.TrimSpace(*req.Customer)
	}
	if req.Status != nil {
		status = normalizeSaleStatus(*req.Status)
	}
	if req.PaymentMethod != nil {
		paymentMethod = strings.TrimSpace(*req.PaymentMethod)
		if paymentMethod == "" {
			paymentMethod = "efectivo"
		}
	}
	if req.Notes != nil {
		notes = *req.Notes
	}
	if req.Items != nil {
		items = []SaleItem{}
		for _, item := range *req.Items {
			if item.Quantity <= 0 || item.ProductID <= 0 {
				http.Error(w, "Each item requires a valid product and quantity", http.StatusBadRequest)
				return
			}
			unitPrice := item.Price
			if unitPrice <= 0 {
				var productPrice float64
				err = db.QueryRow("SELECT price FROM products WHERE id = $1", item.ProductID).Scan(&productPrice)
				if err != nil {
					http.Error(w, "Error fetching product price", http.StatusInternalServerError)
					return
				}
				unitPrice = productPrice
			}
			items = append(items, SaleItem{ProductID: item.ProductID, Quantity: item.Quantity, Price: unitPrice})
		}
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, "Error starting transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	for _, item := range existingSale.Items {
		_, err = tx.Exec("UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", item.Quantity, item.ProductID)
		if err != nil {
			http.Error(w, "Error restoring stock", http.StatusInternalServerError)
			return
		}
	}

	_, err = tx.Exec("DELETE FROM order_items WHERE order_id = $1", id)
	if err != nil {
		http.Error(w, "Error removing existing sale items", http.StatusInternalServerError)
		return
	}

	total := 0.0
	for _, item := range items {
		var stock int
		err = tx.QueryRow("SELECT stock FROM products WHERE id = $1  AND deleted_at IS NULL", item.ProductID).Scan(&stock)
		if err != nil {
      if err == sql.ErrNoRows {
        http.Error(w, "Uno de los productos seleccionados ya no está disponible en el catálogo activo", http.StatusNotFound)
        return
      }
      http.Error(w, "Error loading product stock", http.StatusInternalServerError)
      return
    }
		if stock < item.Quantity {
			http.Error(w, "Insufficient stock to apply the update", http.StatusConflict)
			return
		}
		total += item.Price * float64(item.Quantity)
		_, err = tx.Exec("UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", item.Quantity, item.ProductID)
		if err != nil {
			http.Error(w, "Error updating stock for updated sale", http.StatusInternalServerError)
			return
		}
	}

	_, err = tx.Exec(`
		UPDATE orders
		SET customer = $1, status = $2, total = $3, payment_method = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
		WHERE id = $6
	`, customer, status, total, paymentMethod, notes, id)
	if err != nil {
		http.Error(w, "Error updating sale", http.StatusInternalServerError)
		return
	}

	for _, item := range items {
		_, err = tx.Exec(`
			INSERT INTO order_items (order_id, product_id, quantity, price)
			VALUES ($1, $2, $3, $4)
		`, id, item.ProductID, item.Quantity, item.Price)
		if err != nil {
			http.Error(w, "Error storing updated sale items", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Error committing updated sale", http.StatusInternalServerError)
		return
	}

	sale, err := loadSale(id)
	if err != nil {
		http.Error(w, "Error loading updated sale", http.StatusInternalServerError)
		return
	}

	response := APIResponse{Success: true, Message: "Sale updated successfully", Data: sale}
	json.NewEncoder(w).Encode(response)
}

// CancelSale marks a sale as voided instead of deleting it.
func CancelSale(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id := r.PathValue("id")
	if strings.TrimSpace(id) == "" {
		http.Error(w, "Invalid sale ID", http.StatusBadRequest)
		return
	}

	var req cancelSaleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		req.Reason = ""
	}

	sale, err := loadSale(id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Sale not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error loading sale", http.StatusInternalServerError)
		return
	}
	if sale.IsVoided {
		response := APIResponse{Success: true, Message: "Sale already voided", Data: sale}
		json.NewEncoder(w).Encode(response)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, "Error starting transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	for _, item := range sale.Items {
		_, err = tx.Exec("UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", item.Quantity, item.ProductID)
		if err != nil {
			http.Error(w, "Error restoring stock on cancellation", http.StatusInternalServerError)
			return
		}
	}

	var voidReason *string
	if strings.TrimSpace(req.Reason) != "" {
		voidReason = &req.Reason
	}
	_, err = tx.Exec(`
		UPDATE orders
		SET status = 'cancelled', is_voided = TRUE, voided_at = CURRENT_TIMESTAMP, void_reason = $1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`, voidReason, id)
	if err != nil {
		http.Error(w, "Error cancelling sale", http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Error committing cancellation", http.StatusInternalServerError)
		return
	}

	sale, err = loadSale(id)
	if err != nil {
		http.Error(w, "Error loading cancelled sale", http.StatusInternalServerError)
		return
	}

	response := APIResponse{Success: true, Message: "Sale cancelled successfully", Data: sale}
	json.NewEncoder(w).Encode(response)
}

func DeleteSale(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// 1. Obtener y validar el ID de la venta
	id := r.PathValue("id")
	if strings.TrimSpace(id) == "" {
		http.Error(w, "Invalid sale ID", http.StatusBadRequest)
		return
	}

	// 2. Cargar la venta existente para conocer los productos y cantidades a restaurar
	sale, err := loadSale(id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Sale not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error loading sale", http.StatusInternalServerError)
		return
	}

	// 3. Iniciar la transacción
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, "Error starting transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// 4. Si la venta NO estaba anulada, devolvemos el stock al inventario
	// (Si ya estaba anulada, el stock ya se restauró en CancelSale)
	if !sale.IsVoided {
		for _, item := range sale.Items {
			_, err = tx.Exec(`
				UPDATE products 
				SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP 
				WHERE id = $2
			`, item.Quantity, item.ProductID)
			if err != nil {
				http.Error(w, "Error restoring stock on deletion", http.StatusInternalServerError)
				return
			}
		}
	}

	// 5. Eliminar los items de la orden (por restricciones de clave foránea)
	_, err = tx.Exec("DELETE FROM order_items WHERE order_id = $1", id)
	if err != nil {
		http.Error(w, "Error removing sale items", http.StatusInternalServerError)
		return
	}

	// 6. Eliminar la venta de la tabla principal
	_, err = tx.Exec("DELETE FROM orders WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Error deleting sale record", http.StatusInternalServerError)
		return
	}

	// 7. Confirmar los cambios en la base de datos
	if err := tx.Commit(); err != nil {
		http.Error(w, "Error committing deletion", http.StatusInternalServerError)
		return
	}

	// 8. Responder con éxito
	w.WriteHeader(http.StatusOK)
	response := APIResponse{
		Success: true, 
		Message: fmt.Sprintf("Sale %s permanently deleted and stock adjusted", id),
	}
	json.NewEncoder(w).Encode(response)
}

// ReturnSale applies partial returns to a sale and restores stock.
func ReturnSale(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id := r.PathValue("id")
	if strings.TrimSpace(id) == "" {
		http.Error(w, "Invalid sale ID", http.StatusBadRequest)
		return
	}

	var req returnSaleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if len(req.Items) == 0 {
		http.Error(w, "At least one returned item is required", http.StatusBadRequest)
		return
	}

	sale, err := loadSale(id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Sale not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error loading sale", http.StatusInternalServerError)
		return
	}
	if sale.IsVoided {
		http.Error(w, "Cannot return items from a voided sale", http.StatusConflict)
		return
	}

	currentItems := map[int]int{}
	for _, item := range sale.Items {
		currentItems[item.ProductID] = item.Quantity
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, "Error starting transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	for _, item := range req.Items {
		if item.Quantity <= 0 || item.ProductID <= 0 {
			http.Error(w, "Each return requires a valid product and quantity", http.StatusBadRequest)
			return
		}
		currentQty, ok := currentItems[item.ProductID]
		if !ok || currentQty < item.Quantity {
			http.Error(w, "Requested return exceeds the quantity sold", http.StatusConflict)
			return
		}

		_, err = tx.Exec("UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", item.Quantity, item.ProductID)
		if err != nil {
			http.Error(w, "Error returning stock", http.StatusInternalServerError)
			return
		}

		nextQty := currentQty - item.Quantity
		if nextQty <= 0 {
			_, err = tx.Exec("DELETE FROM order_items WHERE order_id = $1 AND product_id = $2", id, item.ProductID)
		} else {
			_, err = tx.Exec("UPDATE order_items SET quantity = $1 WHERE order_id = $2 AND product_id = $3", nextQty, id, item.ProductID)
		}
		if err != nil {
			http.Error(w, "Error updating sale items", http.StatusInternalServerError)
			return
		}
		currentItems[item.ProductID] = nextQty
	}

	var total float64
	err = tx.QueryRow("SELECT COALESCE(SUM(quantity * price), 0) FROM order_items WHERE order_id = $1", id).Scan(&total)
	if err != nil {
		http.Error(w, "Error recalculating sale total", http.StatusInternalServerError)
		return
	}

	notes := sale.Notes
	if strings.TrimSpace(req.Reason) != "" {
		if notes != "" {
			notes += " | "
		}
		notes += "Devolución: " + strings.TrimSpace(req.Reason)
	}

	_, err = tx.Exec("UPDATE orders SET total = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3", total, notes, id)
	if err != nil {
		http.Error(w, "Error updating sale after return", http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Error committing sale return", http.StatusInternalServerError)
		return
	}

	updatedSale, err := loadSale(id)
	if err != nil {
		http.Error(w, "Error loading updated sale", http.StatusInternalServerError)
		return
	}

	response := APIResponse{Success: true, Message: "Sale return registered successfully", Data: updatedSale}
	json.NewEncoder(w).Encode(response)
}

func loadSale(orderID string) (Sale, error) {
	var sale Sale
	var voidedAt sql.NullTime
	var voidReason sql.NullString
	err := db.QueryRow(`
		SELECT id, customer, status, total, payment_method, notes, is_voided, voided_at, void_reason, created_at, updated_at
		FROM orders
		WHERE id = $1
	`, orderID).Scan(&sale.ID, &sale.Customer, &sale.Status, &sale.Total, &sale.PaymentMethod, &sale.Notes,
		&sale.IsVoided, &voidedAt, &voidReason, &sale.CreatedAt, &sale.UpdatedAt)
	if err != nil {
		return Sale{}, err
	}
	if voidedAt.Valid {
		sale.VoidedAt = &voidedAt.Time
	}
	if voidReason.Valid {
		sale.VoidReason = &voidReason.String
	}
	items, err := loadSaleItems(orderID)
	if err != nil {
		return Sale{}, err
	}
	sale.Items = items
	return sale, nil
}

func loadSaleItems(orderID string) ([]SaleItem, error) {
  rows, err := db.Query(`
    SELECT oi.product_id, COALESCE(p.name, 'Producto No Disponible'), oi.quantity, oi.price
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = $1
    ORDER BY oi.id
  `, orderID)
  if err != nil {
    return nil, err
  }
  defer rows.Close()

	items := []SaleItem{}
	for rows.Next() {
		var item SaleItem
		if err := rows.Scan(&item.ProductID, &item.ProductName, &item.Quantity, &item.Price); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func normalizeSaleStatus(status string) string {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case "completed", "complete":
		return "completed"
	case "pending":
		return "pending"
	case "processing":
		return "processing"
	case "cancelled", "canceled", "voided":
		return "cancelled"
	default:
		return "completed"
	}
}

func init() {
	fmt.Println("sales handler registered")
}
