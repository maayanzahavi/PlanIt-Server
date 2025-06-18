const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config(); 

const app = express();

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));


app.use(express.static('Client'));

// === ROUTES ===
app.use("/api/loadBalance", require("./routes/loadBalance"));
app.use('/api/organizations', require('./routes/organization'));
app.use('/api/tokens', require('./routes/token'));
app.use('/api/skills', require('./routes/skill'));
app.use('/api/users', require('./routes/user'));
app.use('/api', require('./routes/password'));
app.use('/api/ai', require('./routes/ai'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});

// === CONNECT TO MONGODB & START SERVER ===
mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log('Connected to MongoDB');

    const PORT = process.env.PORT || 8800;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
