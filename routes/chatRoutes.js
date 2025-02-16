import express from "express";
import Chat from "../models/Chat.js";

const router = express.Router();

// Save and fetch messages
router.post("/send", async (req, res) => {
    const { sender, receiver, message } = req.body;
    const chat = new Chat({ sender, receiver, message });

    try {
        await chat.save();
        res.json({ message: "Message sent" });
    } catch (error) {
        res.status(400).json({ error: "Error sending message" });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        console.log("Fetching chat for user:", req.params.userId);  // Debugging log

        const chats = await Chat.find({
            $or: [{ sender: req.params.userId }, { receiver: req.params.userId }]
        }).populate("sender receiver", "name email"); // Populate user details

        if (!chats || chats.length === 0) {
            return res.status(404).json({ error: "No chats found" });
        }

        res.json(chats);
    } catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete a specific chat message (by ID)
router.delete("/:chatId", async (req, res) => {
    try {
        const deletedChat = await Chat.findByIdAndDelete(req.params.chatId);

        if (!deletedChat) {
            return res.status(404).json({ error: "Chat message not found" });
        }

        res.json({ message: "Chat message deleted" }); // Or you could send the deleted chat object
    } catch (error) {
        console.error("Error deleting chat:", error);
        res.status(500).json({ error: "Server error deleting chat" });
    }
});

export default router;
