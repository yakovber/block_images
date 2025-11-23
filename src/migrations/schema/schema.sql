-- Central schema definition for the PostgreSQL database

-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS pixelated_images CASCADE;
DROP TABLE IF EXISTS pending_images CASCADE;
DROP TABLE IF EXISTS global_blocked CASCADE;
DROP TABLE IF EXISTS blocked CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    isAdmin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blocked table
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

-- Create global_blocked table
CREATE TABLE global_blocked (
    id SERIAL PRIMARY KEY,
    url VARCHAR(2083) UNIQUE NOT NULL,
    image_id VARCHAR(100) NOT NULL,
    image_filename VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE SET NULL
);

-- Create pending_images table
CREATE TABLE pending_images (
    id SERIAL PRIMARY KEY,
    url VARCHAR(2083) NOT NULL,
    image_id VARCHAR(100) UNIQUE NOT NULL,
    image_filename VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- Create pixelated_images table
CREATE TABLE pixelated_images (
    id SERIAL PRIMARY KEY,
    image_id VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255),
    pixelated_filename VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES pending_images(image_id) ON DELETE CASCADE
);

-- Create activity_log table
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);