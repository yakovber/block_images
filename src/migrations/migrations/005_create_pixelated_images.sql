CREATE TABLE pixelated_images (
    id SERIAL PRIMARY KEY,
    image_id VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255),
    pixelated_filename VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES pending_images(image_id) ON DELETE CASCADE
);