import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();


// Signup Route
router.post("/register", async (req, res) => {
    try {
      const { username, email, password, interests,peerId } = req.body;
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "Email already in use" });
  
      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create New User
      const newUser = new User({ username, email, password: hashedPassword, interests,peerId });
      await newUser.save();
  
      res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
      res.status(500).json({ message: "Error registering user", error });
    }
});
  
// login
router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      console.log("🔹 Login request received for:", email);
  
      // Find user by email OR username
      const user = await User.findOne({
        $or: [{ email: email }, { username: email }],
      });
  
      if (!user) {
        console.log("❌ User not found:", email);
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      console.log("🛠 Fetched User from DB:", user); // 🔍 Check if user data exists
  
      // Check if user has a username and email
      if (!user.username || !user.email) {
        console.error("🚨 Missing username or email for user:", user);
        return res.status(500).json({ error: "User data incomplete" });
      }
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("❌ Password mismatch for user:", user.username);
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
  
      console.log("✅ Login successful:", { username: user.username, email: user.email });
  
      res.json({
        token,
        userId: user._id,
        username: user.username, 
        email: user.email,
      });
  
    } catch (error) {
      console.error("❗ Login Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  


export default router;