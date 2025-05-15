CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE,
    INDEX (email),
    INDEX (created_at)
);