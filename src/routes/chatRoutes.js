import express from "express";
import Message from "../models/Message.js";
import { protect } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/send", protect, async (req, res) => {
  const { sender, receiver, listing, text } = req.body;
  const message = await Message.create({ sender, receiver, listing, text });
  res.json(message);
});

router.get("/conversations", protect, async (req, res) => {
  const userId = req.user.id;

  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate("listing", "title")
    .populate("sender", "name email")
    .populate("receiver", "name email")
    .sort({ timestamp: -1 });

  // Group by listing + other user
  const convMap = {};
  messages.forEach((msg) => {
    const otherUser =
      msg.sender._id.toString() === userId ? msg.receiver : msg.sender;

    const key = `${msg.listing._id}-${otherUser._id}`;
    if (!convMap[key]) {
      convMap[key] = {
        listing: msg.listing,
        otherUser,
        lastMessage: msg.text,
        lastTimestamp: msg.timestamp,
      };
    }
  });

  res.json(Object.values(convMap));
});

router.get("/unread/count", protect, async (req, res) => {
  const userId = req.user.id;

  const count = await Message.countDocuments({
    receiver: userId,
    read: false,
  });

  res.json({ count });
});

router.get("/:listingId/:otherUserId", protect, async (req, res) => {
  const { listingId, otherUserId } = req.params;
  const userId = req.user.id;

  const messages = await Message.find({
    listing: listingId,
    $or: [
      { sender: userId, receiver: otherUserId },
      { sender: otherUserId, receiver: userId },
    ],
  }).sort({ timestamp: 1 });

  await Message.updateMany(
    { listing: listingId, sender: otherUserId, receiver: userId, read: false },
    { $set: { read: true } }
  );

  res.json(messages);
});

export default router;
