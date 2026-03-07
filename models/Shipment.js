const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  shipment_id: { type: String, required: true, unique: true, trim: true },
  product_name: { type: String, required: true, trim: true },
  fragility_level: {
    type: String,
    default: "Medium",
    enum: ["Low", "Medium", "High"],
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seller_name: { type: String, required: true, trim: true },
  seller_email: { type: String, required: true, trim: true, lowercase: true },
  customer_name: { type: String, required: true, trim: true },
  customer_email: { type: String, required: true, trim: true, lowercase: true },
  customer_phone: { type: String, trim: true },
  status: {
    type: String,
    default: "Safe",
    enum: ["Safe", "Moderate", "Severe", "Delivered", "In Transit"],
  },
  tracking_link: { type: String, trim: true },
  created_at: { type: Date, default: Date.now },
});

// Index for efficient queries by shipment_id
shipmentSchema.index({ shipment_id: 1 });
// Index for seller queries
shipmentSchema.index({ seller_id: 1, created_at: -1 });

module.exports = mongoose.model("Shipment", shipmentSchema);
