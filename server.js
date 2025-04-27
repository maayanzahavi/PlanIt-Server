const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 

require('dotenv').config();

const app = express();

const balanceRoutes = require("./routes/balance");
const organization = require('./routes/organization');

// Middleware
app.use(cors()); 
app.use(express.json());

// Routes
app.use("/balance", balanceRoutes);
app.use('/api/organizations', organization);

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
