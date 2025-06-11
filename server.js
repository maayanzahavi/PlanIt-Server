const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');

require('dotenv').config();

const app = express();
const server = http.createServer(app); // Required for socket.io

// === SOCKET.IO SETUP ===
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // frontend URL
    credentials: true,
  },
});

// === SOCKET.IO JWT AUTHENTICATION ===
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log('No token provided in handshake');
    return next(new Error('Authentication error: Token missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Attach decoded user info to socket
    next();
  } catch (err) {
    console.log('Token verification failed');
    return next(new Error('Authentication error: Invalid token'));
  }
});

// === SOCKET CONNECTION HANDLER ===
io.on('connection', (socket) => {
  const userId = socket.user?._id || socket.id;
  console.log(`User connected: ${userId}`);

  socket.join(userId); // Join user-specific room

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
  });
});

// === MAKE IO AVAILABLE GLOBALLY ===
module.exports.io = io;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
// app.use(express.static(path.join(__dirname, '/build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname + '/build/index.html'));
// });
app.use(express.static('client'));



// === ROUTES ===
app.use("/api/loadBalance", require("./routes/loadBalance"));
app.use('/api/organizations', require('./routes/organization'));
app.use('/api/tokens', require('./routes/token'));
app.use('/api/skills', require('./routes/skill'));
app.use('/api/users', require('./routes/user'));
app.use('/api', require('./routes/password'));
app.use('/api/ai', require('./routes/ai'));

// === CONNECT TO MONGODB & START SERVER ===
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
