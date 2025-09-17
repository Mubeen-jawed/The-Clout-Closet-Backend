import Order from "../models/Order.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";

export const createOrder = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    // Get user with bag + shipping
    const user = await User.findById(req.user.id)
      .populate({
        path: "bag.listing",
        populate: { path: "seller", select: "email name" }, // ✅ include seller info
      })
      .select("email name shipping bag");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.shipping) {
      return res
        .status(400)
        .json({ message: "Please add shipping info before ordering" });
    }

    if (!user.bag.length) {
      return res.status(400).json({ message: "Bag is empty" });
    }

    // Build items from bag
    const items = user.bag.map((item) => ({
      listing: item.listing._id,
      title: item.listing.title,
      price: item.listing.salePrice || item.listing.price,
      quantity: item.quantity,
    }));

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Create order
    const order = await Order.create({
      user: user._id,
      items,
      total,
      shipping: user.shipping,
      paymentMethod: paymentMethod || "cod",
    });
    // Send emails (non-blocking)
    try {
      await sendEmail(
        user.email,
        "Order Confirmation ✅",
        `Hi ${user.name},\n\nThanks for your order! You bought:\n${items
          .map((i) => `- ${i.title} x${i.quantity} for ${i.price}RS`)
          .join("\n")}\n\nTotal: ${total}RS.\n\nWe’ll notify the seller(s).`
      );
    } catch (mailErr) {
      console.error("Email send failed to buyer:", mailErr);
    }

    // Notify sellers of each sold item
    for (const item of user.bag) {
      try {
        await sendEmail(
          item.listing.seller.email,
          "Your item sold! 🎉",
          `Hi ${item.listing.seller.name},\n\nYour item "${item.listing.title}" has been sold.\n\nPlease prepare it for shipping.`
        );
      } catch (mailErr) {
        console.error("Email send failed to seller:", mailErr);
      }
    }

    // Clear user bag after order
    user.bag = [];
    await user.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Order failed", error: error.message });
  }
};
