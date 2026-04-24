
CREATE TABLE users (
                       id                     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       name                   VARCHAR(255) UNIQUE NOT NULL,
                       password               VARCHAR(255) NOT NULL,
                       status                 VARCHAR(50) DEFAULT 'ACTIVE',
                       is_temporary_password  BOOLEAN DEFAULT FALSE
);



CREATE TABLE authors
(
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    birth_date DATE
);

CREATE TABLE sellers
(
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    address        VARCHAR(255) NOT NULL,
    afip_number    VARCHAR(255) NOT NULL,
    seller_user_id BIGINT UNIQUE,
    CONSTRAINT fk_seller_user FOREIGN KEY (seller_user_id) REFERENCES users (id)
);


CREATE TABLE genres
(
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE cards (
                       id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       card_number VARCHAR(255) NOT NULL,
                       bank VARCHAR(255) NOT NULL,
                       cvv VARCHAR(4) NOT NULL,
                       owner_id BIGINT,
                       CONSTRAINT fk_card_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE orders
(
    id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date    DATE NOT NULL,
    user_id BIGINT,
    card_id BIGINT,
    total_price DECIMAL(19, 2) NOT NULL,
    status  VARCHAR(50) DEFAULT 'PENDING',
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_order_card FOREIGN KEY (card_id) REFERENCES cards (id)
);


CREATE TABLE books
(
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name         VARCHAR(255)   NOT NULL,
    description  VARCHAR(255),
    price        DECIMAL(19, 2) NOT NULL,
    stock        BIGINT         NOT NULL,
    author_id    BIGINT,
    seller_id    BIGINT,
    image_url    TEXT,
    available    BOOLEAN DEFAULT TRUE,
    cart_user_id BIGINT,
    CONSTRAINT fk_book_author FOREIGN KEY (author_id) REFERENCES authors (id),
    CONSTRAINT fk_book_seller FOREIGN KEY (seller_id) REFERENCES sellers (id),
    CONSTRAINT fk_cart_user FOREIGN KEY (cart_user_id) REFERENCES users (id)
);


CREATE TABLE books_genres
(
    book_id  BIGINT,
    genre_id BIGINT,
    PRIMARY KEY (book_id, genre_id),
    CONSTRAINT fk_bg_book FOREIGN KEY (book_id) REFERENCES books (id),
    CONSTRAINT fk_bg_genre FOREIGN KEY (genre_id) REFERENCES genres (id)
);

CREATE TABLE orders_books
(
    book_id BIGINT,
    order_id BIGINT,
    PRIMARY KEY (book_id, order_id),
    CONSTRAINT fk_sb_book FOREIGN KEY (book_id) REFERENCES books (id),
    CONSTRAINT fk_sb_order FOREIGN KEY (order_id) REFERENCES orders (id)
);

CREATE TABLE user_roles
(
    user_id BIGINT      NOT NULL,
    role    VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE seller_requests
(
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id          BIGINT       NOT NULL,
    business_name    VARCHAR(255) NOT NULL,
    cuit             VARCHAR(255) NOT NULL,
    address          VARCHAR(255) NOT NULL,
    status           VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(255),
    created_date     DATE         NOT NULL,
    updated_date     DATE,
    CONSTRAINT fk_request_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE users_cart (
                            cart_user_id BIGINT NOT NULL,
                            cart_id      BIGINT NOT NULL,
                            CONSTRAINT fk_cart_user_link FOREIGN KEY (cart_user_id) REFERENCES users(id),
                            CONSTRAINT fk_cart_book_link FOREIGN KEY (cart_id) REFERENCES books(id)
);


DO
$$
DECLARE
new_user_id BIGINT;
BEGIN
INSERT INTO users (name, password)
VALUES ('admin@bookstore.com', '$2b$12$1L/HVmqEdQxJMeF4ddi8d.Xo/CWoEfzA1P6GGaZ8j62cBtQ0P2lNW') RETURNING id
INTO new_user_id;

INSERT INTO user_roles (user_id, role)
VALUES (new_user_id, 'ROLE_ADMIN');
END $$;