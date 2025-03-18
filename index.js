const express = require("express");
const app = express();
const balanceRoutes = require("./routes/balance");

app.use(express.json());
app.use("/balance", balanceRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
