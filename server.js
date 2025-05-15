const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 

require('dotenv').config();

const app = express();

const balanceRoutes = require("./routes/balance");
const organization = require('./routes/organization');
console.log('[DEBUG] About to load /api/tokens route');
const tokens = require('./routes/token');
const skill = require('./routes/skill');

// Middleware
app.use(cors()); 
app.use(express.json({ limit: '10mb' }));

// Routes
app.use("/balance", balanceRoutes);
app.use('/api/organizations', organization);
app.use('/api/tokens', tokens);
app.use('/api/skills', skill);

// Connect to MongoDB
mongoose.connect(process.env.CONNECTION_STRING)
    .then(() => {
        console.log('Connected to MongoDB');
        const PORT = process.env.PORT || 8800;
        app.listen(PORT, () => {
          console.log(`Server running at http://localhost:${PORT}/`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });
