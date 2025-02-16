import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/chat", async (req, res) => {
    const { message } = req.body;

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ role: "user", parts: [{ text: message }] }]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                }
            }
        );

        res.json({ response: response.data.candidates[0].content.parts[0].text });
    } catch (error) {
        console.error("Google Gemini API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error fetching AI response" });
    }
});

export default router;
