const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Shipment = require("../models/Shipment");

// ESP32 sends event here
// Basic validation - can be enhanced with API key authentication
router.post("/", async (req, res) => {
  try {
    const { shipment_id, event_type, risingEdges, avgHigh } = req.body;

    // Basic input validation
    if (
      !shipment_id ||
      !event_type ||
      risingEdges === undefined ||
      avgHigh === undefined
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: shipment_id, event_type, risingEdges, avgHigh",
      });
    }

    // Validate shipment exists
    const shipment = await Shipment.findOne({ shipment_id });
    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: "Shipment not found",
      });
    }

    // Create and save event
    const event = new Event(req.body);
    await event.save();

    // Update shipment status based on event severity
    if (event_type === "Severe" && shipment.status !== "Severe") {
      shipment.status = "Severe";
      await shipment.save();
    } else if (event_type === "Moderate" && shipment.status === "Safe") {
      shipment.status = "Moderate";
      await shipment.save();
    }

    res.status(201).json({
      success: true,
      message: "Event stored successfully",
      event_id: event._id,
    });
  } catch (err) {
    // Mongoose validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Get all events of shipment with pagination
router.get("/:shipment_id", async (req, res) => {
  try {
    const { shipment_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: "Invalid pagination parameters",
      });
    }

    // Get events with pagination
    const events = await Event.find({ shipment_id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination metadata
    const totalEvents = await Event.countDocuments({ shipment_id });
    const totalPages = Math.ceil(totalEvents / limit);

    res.json({
      success: true,
      data: events,
      pagination: {
        currentPage: page,
        totalPages,
        totalEvents,
        eventsPerPage: limit,
        hasMore: page < totalPages,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

module.exports = router;
