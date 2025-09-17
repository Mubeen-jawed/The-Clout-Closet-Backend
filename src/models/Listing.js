import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: String, // e.g. Shoes, Clothes
    categorySlug: String,
    brand: String, // e.g. Nike, Adidas
    brandSlug: String,

    condition: String, // e.g. New, Used
    fabric: String, // e.g. Cotton, Leather
    size: String,
    originalPrice: Number, // Old price
    salePrice: Number, // Discounted price
    salePercentage: Number, // Auto-calculated or manually entered
    imageUrl: [String],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);
