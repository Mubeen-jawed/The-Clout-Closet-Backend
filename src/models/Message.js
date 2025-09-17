import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  text: String,
  read: { type: Boolean, default: false }, // NEW
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
