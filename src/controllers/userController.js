import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update shipping info if provided
    if (req.body.shipping) {
      user.shipping = {
        ...user.shipping,
        ...req.body.shipping, // merge old + new
      };
    }

    // Optionally allow updating name/email too
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;

    await user.save();

    res.json(user); // return full profile without password
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};
