const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Allow requests from your GitHub Pages site
app.use(cors({
  origin: "https://studentevents-pixel.github.io"
}));
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, "valid-ids.json");

// Make sure the file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Add a new ticket with name + amount + date
app.post("/tickets", (req, res) => {
  const { ticketId, name, amount } = req.body;
  if (!ticketId || !name || !amount) {
    return res.status(400).json({ error: "ticketId, name, and amount required" });
  }

  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (err) {
    return res.status(500).json({ error: "Could not read tickets file" });
  }

  const exists = data.some(entry => entry.ticketId === ticketId);

  if (!exists) {
    data.push({
      ticketId,
      name,
      amount,
      date: "Saturday 13th December, 2025"
    });
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
  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (err) {
    return res.status(500).json({ error: "Could not read tickets file" });
  }

  const ticket = data.find(entry => entry.ticketId === ticketId);

  if (ticket) {
    const ageCategory = ticket.amount >= 150 ? "Above 18" : "Under 18";
    res.json({
      valid: true,
      ageCategory,
      name: ticket.name,
      date: ticket.date
    });
  } else {
    res.json({ valid: false });
  }
});

// Find ticket(s) by name
app.get("/find/:name", (req, res) => {
  const name = req.params.name.trim().toLowerCase();
  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (err) {
    return res.status(500).json({ error: "Could not read tickets file" });
  }

  const matches = data.filter(entry => entry.name.toLowerCase() === name);
  res.json(matches);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));