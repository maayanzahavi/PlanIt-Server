const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app); 

// === SOCKET.IO SETUP ===
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', 
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user?.id || socket.id);
  socket.join(socket.user.id); // Join private room by user ID

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user?.id || socket.id);
  });
});

// Make io globally available
module.exports.io = io;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// === ROUTES ===
app.use("/api/loadBalance", require("./routes/loadBalance"));
app.use('/api/organizations', require('./routes/organization'));
app.use('/api/tokens', require('./routes/token'));
app.use('/api/skills', require('./routes/skill'));
app.use('/api/users', require('./routes/user'));
app.use('/api', require('./routes/password'));
app.use('/api/ai', require('./routes/ai'));

// === MONGODB + START SERVER ===
mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 8800;
    server.listen(PORT, () => {
      console.log(`Server + Socket.IO running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
