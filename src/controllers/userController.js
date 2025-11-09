import User from "../models/User.js";
import Listing from "../models/Listing.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token, user });
};

export const addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.favorites.includes(req.params.listingId)) {
      user.favorites.push(req.params.listingId);
      await user.save();
    }
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: "Failed to add favorite" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(
      (id) => id.toString() !== req.params.listingId
    );
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove favorite" });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json(user.favorites); // return full product objects
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

export const getBag = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("bag.listing");
    res.json(user.bag);

    // console.log(object)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bag" });
  }
};

export const addToBag = async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const user = await User.findById(req.user.id);

    const existingItem = user.bag.find(
      (item) => item.listing.toString() === req.params.listingId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.bag.push({ listing: req.params.listingId, quantity });
    }

    await user.save();
    res.json(user.bag);
  } catch (err) {
    res.status(500).json({ error: "Failed to add to bag" });
  }
};

export const removeFromBag = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.bag = user.bag.filter(
      (item) => item.listing.toString() !== req.params.listingId
    );
    await user.save();
    res.json(user.bag);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove from bag" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInfluencerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const listings = await Listing.find({ seller: user._id });

    res.json({ user, listings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // If multipart/form-data, shipping may arrive as a JSON string.
    console.log(req.body);
    let incomingShipping = req.body.shipping;
    if (typeof incomingShipping === "string") {
      try {
        incomingShipping = JSON.parse(incomingShipping);
      } catch {
        // ignore parse error; treat as plain string or empty
      }
    }

    // Merge shipping if provided
    if (incomingShipping && typeof incomingShipping === "object") {
      user.shipping = { ...(user.shipping || {}), ...incomingShipping };
    }

    // Optional profile fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;

    // If an image file was uploaded, set/replace profileImage
    if (req.file) {
      // e.g., "/uploads/myfile-123.jpg"
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    // Return user without password
    const safe = user.toObject();
    delete safe.password;
    return res.json(safe);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};

export const saveUserTypeGoogleForm = async (req, res) => {
  try {
    // console.log("🧾 Received body:", req.body);
    const formData = req.body;

    await axios.post(
      "https://script.google.com/macros/s/AKfycbzdcg58LH0ZfAHs4mmFGUJ8bGBOQWWLvm9y9vS3_A_KVkoo0NFvEuFvQHV1oTTqhWKn/exec",
      formData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    res
      .status(200)
      .json({ message: "Data saved to Google Sheet successfully" });
  } catch (err) {
    console.error("Google Sheets submission failed:", err.message);
    res.status(500).json({ error: "Failed to save data to Google Sheet" });
  }
};
