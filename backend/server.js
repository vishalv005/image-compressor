const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow requests from your Vercel frontend (set FRONTEND_URL in Render env vars)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["POST", "GET"],
  })
);

app.use(express.json());
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// ─── MULTER (memory storage — no disk writes) ─────────────────────────────────
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("INVALID_FORMAT"), false);
    }
  },
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/", (_req, res) => res.json({ status: "ok", message: "Image Compressor API" }));

// ─── POST /compress ───────────────────────────────────────────────────────────
/**
 * Body (multipart/form-data):
 *   file    — image file (JPEG / PNG / WebP, max 5 MB)
 *   quality — integer 1–100 (default: 75)
 *
 * Response (JSON):
 *   {
 *     image:          string  (base64-encoded compressed image)
 *     mimeType:       string
 *     originalSize:   number  (bytes)
 *     compressedSize: number  (bytes)
 *     reduction:      string  (e.g. "42.30")
 *   }
 */
app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("🚀 Upload route hit");   // 👈 ADD THIS LINE

  try {
    if (!req.file) {
      console.log("❌ No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("✅ File received:", req.file.mimetype);

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
    );

    console.log("✅ Uploaded to Cloudinary:", result.secure_url);

    res.json({
      message: "Uploaded to cloud",
      url: result.secure_url,
    });

  } catch (err) {
    console.error("❌ UPLOAD ERROR FULL:", err);
    console.error("❌ MESSAGE:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
});
app.post("/compress", upload.single("file"), async (req, res) => {
  try {
    // ── Validate file presence ───────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // ── Parse & clamp quality ────────────────────────────────────────────────
    const quality = Math.min(100, Math.max(1, parseInt(req.body.quality ?? 75, 10)));
    if (isNaN(quality)) {
      return res.status(400).json({ error: "Quality must be a number between 1 and 100." });
    }

    const inputBuffer = req.file.buffer;
    const originalSize = inputBuffer.length;
    const mimeType = req.file.mimetype;

    // ── Compress with sharp ──────────────────────────────────────────────────
    let pipeline = sharp(inputBuffer);

    if (mimeType === "image/jpeg") {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (mimeType === "image/png") {
      // PNG quality maps 1-100 → compressionLevel 9-0
      const compressionLevel = Math.round(9 - (quality / 100) * 9);
      pipeline = pipeline.png({ compressionLevel, effort: 10 });
    } else if (mimeType === "image/webp") {
      pipeline = pipeline.webp({ quality });
    }

    const compressedBuffer = await pipeline.toBuffer();
    const compressedSize = compressedBuffer.length;
    const reduction = (((originalSize - compressedSize) / originalSize) * 100).toFixed(2);

    // ── Return base64 so frontend can preview + download without a CDN ───────
    res.json({
      image: compressedBuffer.toString("base64"),
      mimeType,
      originalSize,
      compressedSize,
      reduction,
    });
  } catch (err) {
    console.error("[/compress]", err.message);

    if (err.message === "INVALID_FORMAT") {
      return res.status(415).json({ error: "Unsupported file type. Use JPEG, PNG, or WebP." });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File exceeds 5 MB limit." });
    }

    res.status(500).json({ error: "Compression failed. Please try again." });
  }
});

// ─── MULTER ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File exceeds 5 MB limit." });
  }
  if (err.message === "INVALID_FORMAT") {
    return res.status(415).json({ error: "Unsupported file type. Use JPEG, PNG, or WebP." });
  }
  res.status(500).json({ error: err.message || "Unexpected error." });
});

app.listen(PORT, () => console.log(`✅  API running on port ${PORT}`));
