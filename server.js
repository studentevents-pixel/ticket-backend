const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, "valid-ids.json");

// Make sure the file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Add a new ticket ID
app.post("/tickets", (req, res) => {
  const { ticketId } = req.body;
  if (!ticketId) return res.status(400).json({ error: "ticketId required" });

  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  if (!data.includes(ticketId)) {
    data.push(ticketId);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }
  res.json({ success: true });
});

// ✅ Return all ticket IDs
app.get("/tickets", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Could not read tickets file" });
  }
});

// Verify a ticket ID
app.get("/verify/:id", (req, res) => {
  const ticketId = req.params.id;
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  const valid = data.includes(ticketId);
  res.json({ valid });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));