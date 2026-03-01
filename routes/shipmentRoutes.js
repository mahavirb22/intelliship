const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");

// Create Shipment
router.post("/", async (req, res) => {
  try {
    const shipment = new Shipment(req.body);
    await shipment.save();
    res.status(201).json(shipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Shipment by ID
router.get("/:id", async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ shipment_id: req.params.id });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
