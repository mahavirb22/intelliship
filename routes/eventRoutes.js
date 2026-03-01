const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// ESP32 sends event here
router.post("/", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ message: "Event stored successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all events of shipment
router.get("/:shipment_id", async (req, res) => {
  try {
    const events = await Event.find({ shipment_id: req.params.shipment_id });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
