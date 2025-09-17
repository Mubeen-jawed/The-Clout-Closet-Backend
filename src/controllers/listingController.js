import Listing from "../models/Listing.js";
import slugify from "slugify";

export const getListings = async (req, res) => {
  const listings = await Listing.find().populate("seller", "name email");
  res.json(listings);
};

export const getListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate(
    "seller",
    "name email"
  );
  res.json(listing);
};

export const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      brand,
      condition,
      fabric,
      size,
      originalPrice,
      salePrice,
      salePercentage,
    } = req.body;

    const categorySlug = slugify(category, { lower: true, strict: true });
    const brandSlug = slugify(brand, { lower: true, strict: true });
    // Store all image URLs
    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

    const listing = await Listing.create({
      title,
      description,
      category,
      categorySlug,
      brand,
      brandSlug,
      condition,
      fabric,
      size,
      originalPrice,
      salePrice,
      salePercentage,
      imageUrl: imageUrls, // save as array
      seller: req.user.id,
    });

    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: "Not found" });
  if (listing.seller.toString() !== req.user.id)
    return res.status(403).json({ message: "Unauthorized" });

  await listing.remove();
  res.json({ message: "Listing deleted" });
};
