const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { PORT, FILE_LIMITS } = require('./config/default');
const { initWebSocket } = require('./src/services/websocket');

const app = express();
const server = http.createServer(app); // ⬅️ יצירת server

// Middleware
app.use(cors({
  origin: '*', // או '*'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: FILE_LIMITS.MAX_FILE_SIZE }));
app.use(express.urlencoded({
  extended: true,
  limit: FILE_LIMITS.MAX_FILE_SIZE
}));

// Static files
app.use('/pending_images', express.static(path.join(__dirname, 'pending_images'), {
  maxAge: '1d',
  index: false,
  redirect: false
}));
app.use('/pixelated', express.static(path.join(__dirname, 'pending_images/pixelated'), {
  maxAge: '1d',
  index: false,
  redirect: false
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Routes
app.use('/auth', require('./src/routes/auth'));
app.use('/', require('./src/routes/block'));
app.use('/admin', require('./src/routes/admin'));
app.use('/admin/db', require('./src/routes/db-admin'));

// Start WebSocket
initWebSocket(server); // ⬅️ הפעלת WebSocket

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
