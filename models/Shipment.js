const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  shipment_id: { type: String, required: true, unique: true },
  product_name: { type: String, required: true },
  fragility_level: { type: String, default: "Medium" },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seller_name: { type: String, required: true },
  seller_email: { type: String, required: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_phone: { type: String },
  status: { type: String, default: "Safe" },
  tracking_link: { type: String },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Shipment", shipmentSchema);
