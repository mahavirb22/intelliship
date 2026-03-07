const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT Token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @route   POST /api/auth/signup
// @desc    Register a new seller
// @access  Public
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      company,
      phone,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// @route   POST /api/auth/signin
// @desc    Login seller
// @access  Public
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify JWT token
// @access  Protected
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
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
        message: "Invalid token",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

module.exports = router;
