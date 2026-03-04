const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");
const auth = require("../middleware/auth");

// Create Shipment (Protected - Seller only)
router.post("/", auth, async (req, res) => {
  try {
    const shipment = new Shipment({
      ...req.body,
      seller_id: req.user._id,
      seller_name: req.user.name,
      seller_email: req.user.email,
    });
    await shipment.save();
    res.status(201).json({
      success: true,
      shipment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// Get all shipments for logged-in seller (Protected)
router.get("/", auth, async (req, res) => {
  try {
    const shipments = await Shipment.find({ seller_id: req.user._id }).sort({
      created_at: -1,
    });
    res.json({
      success: true,
      shipments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Get Shipment by ID (Public - for customer tracking)
router.get("/:id", async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ shipment_id: req.params.id });
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }
    res.json({
      success: true,
      data: shipment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
