# README.md content

# PostgreSQL Schema Project

This project contains SQL migration scripts for setting up a PostgreSQL database schema for an application that manages images and user interactions.

## Project Structure

- `src/migrations/`: Contains SQL files for creating and managing database tables.
  - `001_create_users.sql`: Creates the `users` table.
  - `002_create_blocked.sql`: Creates the `blocked` table.
  - `003_create_global_blocked.sql`: Creates the `global_blocked` table.
  - `004_create_pending_images.sql`: Creates the `pending_images` table.
  - `005_create_pixelated_images.sql`: Creates the `pixelated_images` table.
  - `006_create_activity_log.sql`: Creates the `activity_log` table.

- `src/schema/schema.sql`: Central schema definition file that may include all migration scripts or a summary of the database schema.

- `package.json`: Configuration file for npm, listing dependencies and scripts for the project.

## Usage

To apply the migrations, run the SQL scripts in the order they are numbered. Ensure that you have a PostgreSQL database set up and configured to accept connections.

## License

This project is licensed under the MIT License. See the LICENSE file for details.