-- Create clients table
CREATE TABLE clients (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    phone       VARCHAR(50),
    email       VARCHAR(255),
    doc         VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit history table
CREATE TABLE credit_history (
    id          SERIAL PRIMARY KEY,
    client_id   INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type        VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'payment')),
    description VARCHAR(255) NOT NULL,
    amount      DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    date        DATE NOT NULL DEFAULT CURRENT_DATE,
    order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_clients_name      ON clients(name);
CREATE INDEX idx_clients_doc       ON clients(doc);
CREATE INDEX idx_clients_email     ON clients(email);
CREATE INDEX idx_credit_client_id  ON credit_history(client_id);
CREATE INDEX idx_credit_type       ON credit_history(type);
CREATE INDEX idx_credit_order_id   ON credit_history(order_id);