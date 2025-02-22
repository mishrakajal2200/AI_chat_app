
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';  
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import userRoutes from './routes/userRoutes.js'

dotenv.config();
const app = express();
const httpServer = http.createServer(app);

// Middleware
app.use(cors({
    origin: ["https://poetic-cuchufli-c8644d.netlify.app", "https://elegant-sable-c4c941.netlify.app"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api',userRoutes);

// **Socket.io for real chat and video call signaling**
const io = new Server(httpServer, {
    cors: {
        origin:  ["https://poetic-cuchufli-c8644d.netlify.app", "https://elegant-sable-c4c941.netlify.app"],
        methods: ["GET", "POST"],
    }
});



const users = {}; // Store connected users and their socket IDs

// io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     // User joins a specific room for a video call
//     socket.on("join-room", ({ userId, roomId }) => {
//         users[socket.id] = { userId, roomId };
//         socket.join(roomId);
//         socket.broadcast.to(roomId).emit("user-connected", userId);
//         console.log(`${userId} joined room ${roomId}`);
//     });

//     // Handle video call initiation
//     socket.on("call-user", ({ to, offer, roomId }) => {
//         io.to(roomId).emit("incoming-call", { from: socket.id, offer });
//     });

//     // Handle call acceptance
//     socket.on("accept-call", ({ to, answer, roomId }) => {
//         io.to(roomId).emit("call-accepted", { from: socket.id, answer });
//     });

//     // Handle call rejection
//     socket.on("reject-call", ({ to, roomId }) => {
//         io.to(roomId).emit("call-rejected", { from: socket.id });
//     });

//     // Exchange ICE Candidates
//     socket.on("ice-candidate", ({ to, candidate, roomId }) => {
//         io.to(roomId).emit("ice-candidate", { from: socket.id, candidate });
//     });

//     // Handle call end
//     socket.on("end-call", ({ roomId }) => {
//         io.to(roomId).emit("call-ended", { from: socket.id });
//     });

//     // Handle user disconnection
//     socket.on("disconnect", () => {
//         if (users[socket.id]) {
//             const { userId, roomId } = users[socket.id];
//             console.log("User disconnected:", socket.id);
//             delete users[socket.id];
//             socket.broadcast.to(roomId).emit("user-disconnected", userId);
//         }
//     });
// });

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Store connected users and their socket IDs
    socket.on("join-room", ({ userId, roomId }) => {
        users[socket.id] = { userId, roomId };
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", { userId, socketId: socket.id });
        console.log(`${userId} joined room ${roomId}`);
    });

    // Handle call initiation
    socket.on("call-user", ({ to, offer }) => {
        console.log("Sending offer to:", to);
        io.to(to).emit("incoming-call", { from: socket.id, offer });
    });

    // Handle call acceptance
    socket.on("accept-call", ({ to, answer }) => {
        console.log("Sending answer to:", to);
        io.to(to).emit("call-accepted", { from: socket.id, answer });
    });

    // Handle ICE Candidate Exchange
    socket.on("ice-candidate", ({ to, candidate }) => {
        console.log("Sending ICE candidate to:", to);
        io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    // Handle call end
    socket.on("end-call", ({ to }) => {
        io.to(to).emit("call-ended", { from: socket.id });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        if (users[socket.id]) {
            const { userId, roomId } = users[socket.id];
            console.log("User disconnected:", socket.id);
            delete users[socket.id];
            socket.broadcast.to(roomId).emit("user-disconnected", userId);
        }
    });
});


const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
