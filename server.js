const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 

require('dotenv').config();

const app = express();

const loadBalanceRoutes = require("./routes/loadBalance");
const organization = require('./routes/organization');
const tokens = require('./routes/token');
const skill = require('./routes/skill');
const user = require('./routes/user');
const passwordRoutes = require('./routes/password');
const aiRoutes = require('./routes/ai');



// Middleware
app.use(cors()); 
app.use(express.json({ limit: '10mb' }));

// Routes
app.use("/api/loadBalance", loadBalanceRoutes);
app.use('/api/organizations', organization);
app.use('/api/tokens', tokens);
app.use('/api/skills', skill);
app.use('/api/users', user);
app.use('/api', passwordRoutes);
app.use('/api/ai', aiRoutes);



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
