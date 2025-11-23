CREATE TABLE blocked (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    url VARCHAR(2083) NOT NULL,
    image_id VARCHAR(100),
    image_filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email, url),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);