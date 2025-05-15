const db = require('../src/models/db');

(async () => {
  try {
    // Drop existing tables in correct order (due to foreign keys)
    await db.schema.dropTableIfExists('activity_log');
    await db.schema.dropTableIfExists('pixelated_images');
    await db.schema.dropTableIfExists('pending_images');
    await db.schema.dropTableIfExists('global_blocked');
    await db.schema.dropTableIfExists('blocked');
    await db.schema.dropTableIfExists('users');

    // Create users table - base table for all relations
    await db.schema.createTable('users', table => {
      table.increments('id').primary();
      table.string('email', 255).unique().notNullable();
      table.string('password', 255).notNullable();
      table.boolean('isAdmin').defaultTo(false);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    // Blocked images per user
    await db.schema.createTable('blocked', table => {
      table.increments('id').primary();
      table.string('email', 255).notNullable();
      table.string('url', 2083).notNullable(); // max URL length
      table.string('image_id', 100).nullable();
      table.string('image_filename', 255).nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.unique(['email', 'url']);
      table.foreign('email').references('users.email').onDelete('CASCADE');
      table.index(['image_id']);
    });

    // Globally blocked images
    await db.schema.createTable('global_blocked', table => {
      table.increments('id').primary();
      table.string('url', 2083).unique().notNullable();
      table.string('image_id', 100).unique().notNullable();
      table.string('image_filename', 255);
      table.string('email', 255).notNullable();
      table.enum('status', ['approved', 'rejected']).defaultTo('approved');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.foreign('email').references('users.email').onDelete('SET NULL');
      table.index(['image_id']);
    });

    // Pending images for review
    await db.schema.createTable('pending_images', table => {
      table.increments('id').primary();
      table.string('url', 2083).notNullable();
      table.string('image_id', 100).unique().notNullable();
      table.string('image_filename', 255);
      table.string('email', 255).notNullable();
      table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
      table.foreign('email').references('users.email').onDelete('CASCADE');
      table.index(['status']);
      table.index(['image_id']);
    });

    // Pixelated versions of images
    await db.schema.createTable('pixelated_images', table => {
      table.increments('id').primary();
      table.string('image_id', 100).notNullable();
      table.string('original_filename', 255);
      table.string('pixelated_filename', 255).notNullable();
      table.integer('block_size').unsigned().notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.foreign('image_id').references('pending_images.image_id').onDelete('CASCADE');
      table.index(['image_id']);
    });

    // Activity logging
    await db.schema.createTable('activity_log', table => {
      table.increments('id').primary();
      table.string('email', 255).notNullable();
      table.string('action', 100).notNullable();
      table.text('details').nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.foreign('email').references('users.email').onDelete('CASCADE');
      table.index(['email']);
      table.index(['created_at']);
    });

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
