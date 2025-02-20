
// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   username: String,
//   email: { type: String, unique: true },
//   password: String, // Hash this in the controller
//   interests: [String], // User-selected interests at signup
//   traits: [String], // Extracted traits after voice analysis
//   socketId: String, // Store user's socket ID for real-time chat
// });

// module.exports = mongoose.model("User", userSchema);


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String, // Hash this in the controller
  interests: [String], // User-selected interests at signup
  traits: [String], // Extracted traits after voice analysis
  socketId: String, // Store user's socket ID for real-time chat
  peerId: String, // Store user's PeerJS/WebRTC ID for video calls
});

module.exports = mongoose.model("User", userSchema);
