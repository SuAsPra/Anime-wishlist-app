// model.js

const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  username: { type: String, required: true },
  anime: { type: String, required: true },
});
const Wishlist = mongoose.model("Wishlist", wishlistSchema);

// Export models
module.exports = { User, Wishlist };
