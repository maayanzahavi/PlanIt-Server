const express = require("express");
const app = express();

const balanceRoutes = require("./routes/balance");
const organization = require('./routes/organization');


app.use(express.json());
app.use("/balance", balanceRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Connecting to routers
app.use('/api/organizations', organization);
