-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer VARCHAR(255) NOT NULL,
    client_id INT REFERENCES clients(id) ON DELETE SET NULL,
    pay_method VARCHAR(50) NOT NULL DEFAULT 'efectivo',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Indexes for orders, items and credits
CREATE INDEX idx_orders_customer ON orders(customer);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_credit_client_id ON credit_history(client_id);
CREATE INDEX idx_credit_type ON credit_history(type);
CREATE INDEX idx_credit_order_id ON credit_history(order_id);