import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,

    // favorites array (store product references)
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
    bag: [
      {
        listing: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Listing",
        },
        quantity: { type: Number, default: 1 },
      },
    ],
    shipping: {
      fullName: String,
      address: String,
      city: String,
      postalCode: String,
      phone: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
