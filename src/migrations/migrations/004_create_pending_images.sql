CREATE TABLE pending_images (
    id SERIAL PRIMARY KEY,
    url VARCHAR(2083) NOT NULL,
    image_id VARCHAR(100) UNIQUE NOT NULL,
    image_filename VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE,
    INDEX (status),
    INDEX (image_id)
);