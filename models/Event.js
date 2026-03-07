const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  shipment_id: {
    type: String,
    required: [true, "Shipment ID is required"],
    trim: true,
  },
  event_type: {
    type: String,
    required: [true, "Event type is required"],
    enum: {
      values: ["Safe", "Moderate", "Severe"],
      message: "Event type must be Safe, Moderate, or Severe",
    },
  },
  risingEdges: {
    type: Number,
    required: [true, "Rising edges value is required"],
    min: [0, "Rising edges cannot be negative"],
  },
  avgHigh: {
    type: Number,
    required: [true, "Average high value is required"],
    min: [0, "Average high cannot be negative"],
  },
  timestamp: { type: Date, default: Date.now },
});

// Index for efficient queries by shipment_id and timestamp
eventSchema.index({ shipment_id: 1, timestamp: -1 });

module.exports = mongoose.model("Event", eventSchema);
