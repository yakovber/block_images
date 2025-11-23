CREATE TABLE global_blocked (
    id SERIAL PRIMARY KEY,
    url VARCHAR(2083) UNIQUE NOT NULL,
    image_id VARCHAR(100)  NOT NULL,
    image_filename VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    status ENUM('approved', 'rejected') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE SET NULL
);