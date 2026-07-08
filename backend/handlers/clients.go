package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

// ── Tipos ────────────────────────────────────────────────────────────────────

type Client struct {
	ID        int             `json:"id"`
	Name      string          `json:"name"`
	Phone     *string         `json:"phone"`
	Email     *string         `json:"email"`
	Doc       *string         `json:"doc"`
	Balance   float64         `json:"balance"`    // calculado: sum(credit) - sum(payment)
	Total     float64         `json:"total"`      // calculado: sum(credit)
	CreatedAt string          `json:"created_at"`
	UpdatedAt string          `json:"updated_at"`
	History   []CreditHistory `json:"history,omitempty"`
}

type CreditHistory struct {
	ID          int     `json:"id"`
	ClientID    int     `json:"client_id"`
	Type        string  `json:"type"`         // "credit" | "payment"
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	Date        string  `json:"date"`
	OrderID     *string `json:"order_id"`
	CreatedAt   string  `json:"created_at"`
}

type CreateClientRequest struct {
	Name  string  `json:"name"`
	Phone *string `json:"phone"`
	Email *string `json:"email"`
	Doc   *string `json:"doc"`
}

type UpdateClientRequest struct {
	Name  *string `json:"name"`
	Phone *string `json:"phone"`
	Email *string `json:"email"`
	Doc   *string `json:"doc"`
}

type CreateCreditRequest struct {
	Type        string  `json:"type"`         // "credit" | "payment"
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	Date        *string `json:"date"`         // opcional, default hoy
	OrderID     *string `json:"order_id"`     // opcional, para ventas a crédito
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// nullifyEmptyString convierte punteros a string vacío en nil
func nullifyEmptyString(s *string) *string {
	if s != nil && *s == "" {
		return nil
	}
	return s
}

// scanClient escanea una fila de client con balance y total precalculados
const clientSelectSQL = `
	SELECT 
		c.id, c.name, c.phone, c.email, c.doc,
		COALESCE(SUM(CASE WHEN ch.type = 'credit'  THEN ch.amount ELSE 0 END), 0) -
		COALESCE(SUM(CASE WHEN ch.type = 'payment' THEN ch.amount ELSE 0 END), 0) AS balance,
		COALESCE(SUM(CASE WHEN ch.type = 'credit'  THEN ch.amount ELSE 0 END), 0) AS total,
		c.created_at, c.updated_at
	FROM clients c
	LEFT JOIN credit_history ch ON c.id = ch.client_id
`

// ── Handlers ─────────────────────────────────────────────────────────────────

// GetClients retrieves all clients with their balance
func GetClients(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query(clientSelectSQL + `
		GROUP BY c.id
		ORDER BY c.name
	`)
	if err != nil {
		http.Error(w, "Error fetching clients", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	clients := []Client{}
	for rows.Next() {
		var c Client
		if err := rows.Scan(
			&c.ID, &c.Name, &c.Phone, &c.Email, &c.Doc,
			&c.Balance, &c.Total,
			&c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			http.Error(w, "Error scanning client", http.StatusInternalServerError)
			return
		}
		clients = append(clients, c)
	}

	json.NewEncoder(w).Encode(APIResponse{Success: true, Data: clients})
}

// GetClient retrieves a single client with full credit history
func GetClient(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var c Client
	err = db.QueryRow(clientSelectSQL+`
		WHERE c.id = $1
		GROUP BY c.id
	`, id).Scan(
		&c.ID, &c.Name, &c.Phone, &c.Email, &c.Doc,
		&c.Balance, &c.Total,
		&c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		http.Error(w, "Client not found", http.StatusNotFound)
		return
	}

	// Cargar historial
	histRows, err := db.Query(`
		SELECT id, client_id, type, description, amount, date, order_id, created_at
		FROM credit_history
		WHERE client_id = $1
		ORDER BY date DESC, created_at DESC
	`, id)
	if err != nil {
		http.Error(w, "Error fetching history", http.StatusInternalServerError)
		return
	}
	defer histRows.Close()

	c.History = []CreditHistory{}
	for histRows.Next() {
		var h CreditHistory
		if err := histRows.Scan(
			&h.ID, &h.ClientID, &h.Type, &h.Description,
			&h.Amount, &h.Date, &h.OrderID, &h.CreatedAt,
		); err != nil {
			http.Error(w, "Error scanning history", http.StatusInternalServerError)
			return
		}
		c.History = append(c.History, h)
	}

	json.NewEncoder(w).Encode(APIResponse{Success: true, Data: c})
}

// CreateClient creates a new client
func CreateClient(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req CreateClientRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	req.Phone = nullifyEmptyString(req.Phone)
	req.Email = nullifyEmptyString(req.Email)
	req.Doc   = nullifyEmptyString(req.Doc)

	var id int
	err := db.QueryRow(`
		INSERT INTO clients (name, phone, email, doc)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, req.Name, req.Phone, req.Email, req.Doc).Scan(&id)
	if err != nil {
		http.Error(w, "Error creating client", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(APIResponse{
		Success: true,
		Message: "Client created successfully",
		Data:    map[string]int{"id": id},
	})
}

// UpdateClient updates an existing client
func UpdateClient(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var req UpdateClientRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	req.Phone = nullifyEmptyString(req.Phone)
	req.Email = nullifyEmptyString(req.Email)
	req.Doc   = nullifyEmptyString(req.Doc)

	query := "UPDATE clients SET updated_at = CURRENT_TIMESTAMP"
	args  := []interface{}{}
	argc  := 1

	if req.Name != nil {
		query += fmt.Sprintf(", name = $%d", argc)
		args = append(args, *req.Name)
		argc++
	}
	if req.Phone != nil {
		query += fmt.Sprintf(", phone = $%d", argc)
		args = append(args, *req.Phone)
		argc++
	}
	if req.Email != nil {
		query += fmt.Sprintf(", email = $%d", argc)
		args = append(args, *req.Email)
		argc++
	}
	if req.Doc != nil {
		query += fmt.Sprintf(", doc = $%d", argc)
		args = append(args, *req.Doc)
		argc++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argc)
	args = append(args, id)

	result, err := db.Exec(query, args...)
	if err != nil {
		http.Error(w, "Error updating client", http.StatusInternalServerError)
		return
	}

	rows, err := result.RowsAffected()
	if err != nil || rows == 0 {
		http.Error(w, "Client not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(APIResponse{
		Success: true,
		Message: "Client updated successfully",
	})
}

// DeleteClient deletes a client and their credit history (CASCADE)
func DeleteClient(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("DELETE FROM clients WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Error deleting client", http.StatusInternalServerError)
		return
	}

	rows, err := result.RowsAffected()
	if err != nil || rows == 0 {
		http.Error(w, "Client not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(APIResponse{
		Success: true,
		Message: "Client deleted successfully",
	})
}

// AddCreditEntry adds a credit or payment entry to a client's history
func AddCreditEntry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	clientID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid client ID", http.StatusBadRequest)
		return
	}

	var req CreateCreditRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validaciones
	if req.Type != "credit" && req.Type != "payment" {
		http.Error(w, "Type must be 'credit' or 'payment'", http.StatusBadRequest)
		return
	}
	if req.Amount <= 0 {
		http.Error(w, "Amount must be greater than 0", http.StatusBadRequest)
		return
	}
	if req.Description == "" {
		http.Error(w, "Description is required", http.StatusBadRequest)
		return
	}

	// Verificar que el cliente existe
	var exists bool
	if err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM clients WHERE id = $1)", clientID).Scan(&exists); err != nil || !exists {
		http.Error(w, "Client not found", http.StatusNotFound)
		return
	}

	// Para abonos: verificar que no supere el saldo pendiente
	if req.Type == "payment" {
		var balance float64
		err := db.QueryRow(`
			SELECT
				COALESCE(SUM(CASE WHEN type = 'credit'  THEN amount ELSE 0 END), 0) -
				COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0)
			FROM credit_history
			WHERE client_id = $1
		`, clientID).Scan(&balance)
		if err != nil {
			http.Error(w, "Error checking balance", http.StatusInternalServerError)
			return
		}
		if req.Amount > balance {
			http.Error(w, fmt.Sprintf("Payment exceeds balance (%.2f)", balance), http.StatusBadRequest)
			return
		}
	}

	// Insertar
	date := "CURRENT_DATE"
	var id int
	var insertErr error

	if req.Date != nil && *req.Date != "" {
		insertErr = db.QueryRow(`
			INSERT INTO credit_history (client_id, type, description, amount, date, order_id)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id
		`, clientID, req.Type, req.Description, req.Amount, *req.Date, req.OrderID).Scan(&id)
	} else {
		_ = date
		insertErr = db.QueryRow(`
			INSERT INTO credit_history (client_id, type, description, amount, order_id)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id
		`, clientID, req.Type, req.Description, req.Amount, req.OrderID).Scan(&id)
	}

	if insertErr != nil {
		http.Error(w, "Error creating credit entry", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(APIResponse{
		Success: true,
		Message: "Entry created successfully",
		Data:    map[string]int{"id": id},
	})
}

// GetClientHistory retrieves the full credit history of a client
func GetClientHistory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	clientID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid client ID", http.StatusBadRequest)
		return
	}

	rows, err := db.Query(`
		SELECT id, client_id, type, description, amount, date, order_id, created_at
		FROM credit_history
		WHERE client_id = $1
		ORDER BY date DESC, created_at DESC
	`, clientID)
	if err != nil {
		http.Error(w, "Error fetching history", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	history := []CreditHistory{}
	for rows.Next() {
		var h CreditHistory
		if err := rows.Scan(
			&h.ID, &h.ClientID, &h.Type, &h.Description,
			&h.Amount, &h.Date, &h.OrderID, &h.CreatedAt,
		); err != nil {
			http.Error(w, "Error scanning history", http.StatusInternalServerError)
			return
		}
		history = append(history, h)
	}

	json.NewEncoder(w).Encode(APIResponse{Success: true, Data: history})
}