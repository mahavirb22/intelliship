const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  shipment_id: { type: String, required: true, unique: true },
  product_name: String,
  seller_name: String,
  customer_name: String,
  status: { type: String, default: "IN_TRANSIT" },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Shipment", shipmentSchema);
