const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Replace with your MongoDB Atlas URI
const MONGODB_URI =
    "mongodb+srv://suriyan:COOWG9nsnloxnMtV@cluster0.pzuq2ov.mongodb.net/animeApp?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("✅ MongoDB connected"));

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // Serves HTML/CSS/JS files

// ----- Mongoose Schemas and Models -----
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
});
const User = mongoose.model("User", userSchema);

const wishlistSchema = new mongoose.Schema({
    username: String,
    anime: String,
});
const Wishlist = mongoose.model("Wishlist", wishlistSchema);

// ----- API Endpoints -----

// Sign Up
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    try {
        const exists = await User.findOne({ username });
        if (exists) {
            return res
                .status(400)
                .json({ success: false, message: "User already exists" });
        }
        await User.create({ username, password });
        res.json({ success: true });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ success: false });
    }
});

// Login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        res.json({ success: !!user });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false });
    }
});

// Add or remove anime from wishlist
app.post("/save", async (req, res) => {
    const { username, anime, action } = req.body;
    try {
        if (action === "add") {
            const exists = await Wishlist.findOne({ username, anime });
            if (!exists) {
                await Wishlist.create({ username, anime });
            }
        } else if (action === "remove") {
            await Wishlist.deleteOne({ username, anime });
        } else {
            return res
                .status(400)
                .json({ success: false, message: "Invalid action" });
        }
        res.json({ success: true });
    } catch (err) {
        console.error("Wishlist save error:", err);
        res.status(500).json({ success: false });
    }
});

// Get wishlist for a user
app.get("/wishlist", async (req, res) => {
    const { username } = req.query;
    try {
        const entries = await Wishlist.find({ username });
        const list = entries.map((entry) => entry.anime);
        res.json(list);
    } catch (err) {
        console.error("Wishlist fetch error:", err);
        res.status(500).json([]);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
