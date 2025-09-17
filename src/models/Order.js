import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
        title: String,
        price: Number,
        quantity: Number,
      },
    ],
    total: Number,
    shipping: {
      fullName: String,
      address: String,
      city: String,
      postalCode: String,
      phone: String,
    },
    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
