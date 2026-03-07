const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = auth;
