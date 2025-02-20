import express from "express";
import dotenv from "dotenv";
import User from "../models/User.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("Gemini API Key:", GEMINI_API_KEY);

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// AI Chat Route using Gemini
router.post("/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const response = await axios.post(GEMINI_API_URL, {
            contents: [{ parts: [{ text: message }] }]
        });

        const geminiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
        res.json({ response: geminiResponse });

    } catch (error) {
        console.error("Gemini API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Error fetching AI response" });
    }
});

// Find users with matching interests
router.get("/match/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Find users who share at least one interest with the current user
        const matchedUsers = await User.find({
            _id: { $ne: user._id }, // Exclude the current user
            interests: { $in: user.interests }, // Check if at least one interest matches
        }).select("_id username interests");

        res.json({ matchedUsers });
    } catch (error) {
        console.error("Error matching users:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 📌 Route to Start a Video Call
router.post("/video-call", async (req, res) => {
    const { sender, receiver } = req.body;

    if (!sender || !receiver) {
        console.log("Sender or receiver is missing");
        return res.status(400).json({ error: "Sender and receiver are required" });
    }

    try {
        const roomId = uuidv4();
        res.json({ success: true, roomId });
    } catch (error) {
        console.error("Error starting video call:", error.message);
        res.status(500).json({ error: "Server error" });
    }
});


export default router;
