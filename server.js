const express = require("express");
const cors = require("cors");
const path = require("path");
const uploadRouter = require("./routes/upload");

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS for all origins (you can restrict it to your frontend URL if needed)
app.use(cors());

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g. screenshots and reports)
app.use("/public", express.static(path.join(__dirname, "public")));

// Upload route
app.use("/upload", uploadRouter);

// Root route (optional)
app.get("/", (req, res) => {
  res.send("Component Audit Backend is running");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
