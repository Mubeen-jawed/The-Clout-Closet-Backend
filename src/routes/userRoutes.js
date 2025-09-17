import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
  getBag,
  addToBag,
  removeFromBag,
  updateProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/favorites/:listingId", protect, addFavorite);
router.delete("/favorites/:listingId", protect, removeFavorite);
router.get("/favorites", protect, getFavorites);
router.get("/bag", protect, getBag);
router.post("/bag/:listingId", protect, addToBag);
router.delete("/bag/:listingId", protect, removeFromBag);

export default router;
