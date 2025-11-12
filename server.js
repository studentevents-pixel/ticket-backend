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

// Add a new ticket with name
app.post("/tickets", (req, res) => {
  const { ticketId, name } = req.body;
  if (!ticketId || !name) return res.status(400).json({ error: "ticketId and name required" });

  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  const exists = data.some(entry => entry.ticketId === ticketId);

  if (!exists) {
    data.push({ ticketId, name });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }

  res.json({ success: true });
});

// Return all tickets
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
  const valid = data.some(entry => entry.ticketId === ticketId);
  res.json({ valid });
});

// Find ticket(s) by name
app.get("/find/:name", (req, res) => {
  const name = req.params.name.trim().toLowerCase();
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  const matches = data.filter(entry => entry.name.toLowerCase() === name);
  res.json(matches);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));