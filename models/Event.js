const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  shipment_id: String,
  event_type: String,
  risingEdges: Number,
  avgHigh: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", eventSchema);
