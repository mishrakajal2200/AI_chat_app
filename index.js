
// import express from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import http from 'http';
// import { Server } from 'socket.io';  // Corrected import (uppercase 'S')
// import authRoutes from './routes/authRoutes.js';
// import chatRoutes from './routes/chatRoutes.js';
// import aiRoutes from './routes/aiRoutes.js';

// dotenv.config();
// const app = express();
// const httpServer = http.createServer(app);  // Renamed from `server` to `httpServer`

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));



// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => console.log("MongoDB Connected"))
//   .catch(err => console.error("MongoDB Connection Error:", err));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/ai', aiRoutes);

// // Socket.io for real chat and video call signaling
// const io = new Server(httpServer, {  // Renamed from `server` to `io`
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"],
//     }
// });

// io.on("connection", (socket) => {
//     console.log("User connected", socket.id);

//     // Handle real-time messaging
//     socket.on("sendMessage", (message) => {
//         io.emit("receiveMessage", message);
//     });

//     // Handle WebRTC for video call signaling
//     socket.on("offer", (data) => {
//         io.to(data.to).emit("offer", data);
//     });

//     socket.on("answer", (data) => {
//         io.to(data.to).emit("answer", data);
//     });

//     socket.on("ice-candidate", (data) => {
//         io.to(data.to).emit("ice-candidate", data);
//     });

//     socket.on("disconnect", () => {
//         console.log("User disconnected: ", socket.id);
//     });
// });

// const PORT = process.env.PORT || 5000;

// httpServer.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';  
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();
const app = express();
const httpServer = http.createServer(app);

// Middleware
app.use(cors());
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

// **Socket.io for real chat and video call signaling**
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

const users = {}; // Store connected users

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // **User joins the room for video calling**
    socket.on("join-room", ({ userId }) => {
        users[socket.id] = userId;
        socket.broadcast.emit("user-connected", userId);
        console.log(`${userId} joined the room`);
    });

    // **Handle video call initiation**
    socket.on("call-user", ({ to, offer }) => {
        io.to(to).emit("incoming-call", { from: socket.id, offer });
    });

    // **Handle call acceptance**
    socket.on("accept-call", ({ to, answer }) => {
        io.to(to).emit("call-accepted", { from: socket.id, answer });
    });

    // **Exchange ICE Candidates**
    socket.on("ice-candidate", ({ to, candidate }) => {
        io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    // **Handle call end**
    socket.on("end-call", ({ userId }) => {
        io.emit("call-ended", userId);
    });

    // **Handle user disconnection**
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete users[socket.id];
        socket.broadcast.emit("user-disconnected", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
