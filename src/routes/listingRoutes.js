// backend/routes/listingRoutes.js
import express from "express";
import multer from "multer";
import {
  getListings,
  getListing,
  createListing,
  deleteListing,
} from "../controllers/listingController.js";
import { protect } from "../middleware/authMiddleware.js";
import Listing from "../models/Listing.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getListings);
router.get("/:id", getListing);

// Category filter
router.get("/category/:param", async (req, res) => {
  try {
    const param = req.params.param;

    let listings = await Listing.find({
      categorySlug: param,
    }).populate("seller", "name email");

    if (!listings.length) {
      const categoryName = param.replace(/-/g, " ");
      listings = await Listing.find({
        category: new RegExp(`^${categoryName}$`, "i"),
      }).populate("seller", "name email");
    }

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Brands Filter

router.get("/brand/:param", async (req, res) => {
  try {
    const param = req.params.param;

    // First try slug
    let listings = await Listing.find({
      brandSlug: param,
    }).populate("seller", "name email");

    // Fallback: try normal brand name
    if (!listings.length) {
      const brandName = param.replace(/-/g, " ");
      listings = await Listing.find({
        brand: new RegExp(`^${brandName}$`, "i"),
      }).populate("seller", "name email");
    }

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/filter", async (req, res) => {
  const { categories, brands, sizes, fabrics, discounts, price } = req.body;

  const query = {};

  if (categories?.length) query.category = { $in: categories };
  if (brands?.length) query.brand = { $in: brands };
  if (sizes?.length) query.size = { $in: sizes };
  if (fabrics?.length) query.fabric = { $in: fabrics };

  if (discounts?.length) {
    // Convert discount text to number
    const minDiscount = Math.max(
      ...discounts.map((d) => parseInt(d.replace("%+", "")))
    );
    query.salePercentage = { $gte: minDiscount };
  }

  if (price?.min || price?.max) {
    query.salePrice = {
      ...(price.min && { $gte: parseInt(price.min) }),
      ...(price.max && { $lte: parseInt(price.max) }),
    };
  }

  const listings = await Listing.find(query);
  res.json(listings);
});

router.get("/search/:keyword", async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const regex = new RegExp(keyword, "i"); // case-insensitive search

    const listings = await Listing.find({
      $or: [
        { title: regex },
        { description: regex },
        { brand: regex },
        { category: regex },
        { fabric: regex },
      ],
    });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", protect, upload.array("images", 5), createListing);
router.delete("/:id", protect, deleteListing);

export default router;
