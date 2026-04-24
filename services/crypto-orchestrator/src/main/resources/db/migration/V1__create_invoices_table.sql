CREATE TABLE payment_invoice (
                                 id UUID PRIMARY KEY,
                                 order_id BIGINT NOT NULL,
                                 amount_usd NUMERIC(19, 2),
                                 amount_crypto NUMERIC(19, 8),
                                 wallet_address VARCHAR(255),
                                 state VARCHAR(50)
);
