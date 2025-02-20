
import express from "express";
import Chat from "../models/Chat.js";
const router = express.Router();

// Save and fetch messages
router.post("/send", async (req, res) => {
    const { sender, receiver, message } = req.body;

    if (!sender || !receiver || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const chat = new Chat({ sender, receiver, message });
        await chat.save();
        res.json({ message: "Message sent" });
    } catch (error) {
        console.error("Error sending message:", error.message);
        res.status(500).json({ error: "Error sending message" });
    }
});

router.get("/:userId", async (req, res) => {
    try {
        console.log("Fetching chat for user:", req.params.userId);

        const chats = await Chat.find({
            $or: [{ sender: req.params.userId }, { receiver: req.params.userId }],
        }).populate("sender receiver", "name email");

        if (!chats.length) {
            return res.status(404).json({ error: "No chats found" });
        }

        res.json(chats);
    } catch (error) {
        console.error("Error fetching chat:", error.message);
        res.status(500).json({ error: "Server error" });
    }
});


export default router;
