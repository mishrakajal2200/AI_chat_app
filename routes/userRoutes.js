import express from 'express';
import User from '../models/User.js'
const router = express.Router();
import jwt from 'jsonwebtoken';

// Get User Details
router.get("/user", async (req, res) => {
    try {
      // ✅ Extract token from request headers
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Unauthorized - No Token Provided" });
      }
  
      // ✅ Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔹 Decoded Token:", decoded);
  
      // ✅ Find user in DB
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      console.log("✅ User Data:", user);
      res.json(user);
  
    } catch (error) {
      console.error("❗ Server Error:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/update-peer", async (req, res) => {
    const { userId, peerId } = req.body;

    try {
        if (!userId || !peerId) {
            return res.status(400).json({ success: false, message: "User ID and Peer ID required!" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { peerId }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.json({ success: true, message: "Peer ID updated successfully!", peerId: updatedUser.peerId });
    } catch (error) {
        console.error("❌ Error updating Peer ID:", error);
        res.status(500).json({ success: false, message: "Error updating Peer ID." });
    }
});

router.get("/get-peer/:brotherUsername", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.brotherUsername });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.peerId) {
            return res.status(404).json({ message: "User is offline or has no active Peer ID." });
        }

        res.json({ peerId: user.peerId });
    } catch (error) {
        console.error("❌ Error fetching Peer ID:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});



export default router;