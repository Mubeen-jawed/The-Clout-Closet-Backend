import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    socialMediaHandle: String,
    profileImage: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png", // 👈 default image URL
    },
    role: {
      type: String,
      enum: ["user", "influencer", "admin"],
      default: "user",
    },

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
