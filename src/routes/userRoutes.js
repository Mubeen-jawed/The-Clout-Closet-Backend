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
  saveUserTypeGoogleForm,
  getInfluencerProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.get("/profile/:id", protect, getInfluencerProfile);
router.put("/profile", protect, upload.single("image"), updateProfile);
router.post("/favorites/:listingId", protect, addFavorite);
router.delete("/favorites/:listingId", protect, removeFavorite);
router.get("/favorites", protect, getFavorites);
router.get("/bag", protect, getBag);
router.post("/bag/:listingId", protect, addToBag);
router.post("/userTypeCheck", protect, saveUserTypeGoogleForm);
router.delete("/bag/:listingId", protect, removeFromBag);

export default router;
